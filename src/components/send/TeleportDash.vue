<template>
  <q-card>
    <div class="row justify-center">
      <div class="text-h6 text-center q-pr-sm">Teleports</div>
      <q-btn
        padding="sm"
        class="hover-accent"
        color="black"
        icon="fas fa-sync-alt"
        flat
        size="sm"
        @click="refreshTeleports()"
      />
    </div>
    <q-list>
      <q-item v-for="t in unclaimedTeleports" :key="t.id">
        <q-item-section class="col-3">
          {{ t.quantity }}
        </q-item-section>
        <q-item-section class="col-1">
          <q-icon class="fas fa-arrow-right"></q-icon>
        </q-item-section>
        <q-item-section class="col-2 q-mr-md">{{
          ethAddressShort(t.eth_address)
        }}</q-item-section>
        <q-item-section>
          <token-avatar
            :token="evmNetworkNameById(t.chain_id)"
            :avatarSize="25"
          />
        </q-item-section>
        <q-item-section side>
          <q-btn class="hover-accent" v-if="t.processing" color="grey">
            Processing
          </q-btn>
          <q-btn
            class="hover-accent"
            v-else-if="
              !t.claimed &&
                correctNetwork(t.chain_id) &&
                correctAccount(t.eth_address)
            "
            color="positive"
            @click="claimEvm(t)"
          >
            Claim
          </q-btn>
          <q-btn
            class="hover-accent"
            v-else-if="!t.claimed && !correctNetwork(t.chain_id)"
            color="primary"
            @click="switchMetamaskNetwork(networkNameFromId(t.chain_id))"
          >
            Switch Chain
          </q-btn>
          <q-btn
            class="hover-accent"
            v-else-if="!t.claimed && !correctAccount(t.eth_address)"
            color="grey"
            @click="$q.notify({ color: 'green-4', message: 'TODO' })"
          >
            Switch Account
          </q-btn>
        </q-item-section>
      </q-item>
    </q-list>
    <q-card-actions class="row justify-center">
      <div>{{ expanded ? "Hide" : "Show" }} Claimed</div>
      <q-btn
        color="grey"
        round
        flat
        dense
        :icon="expanded ? 'keyboard_arrow_up' : 'keyboard_arrow_down'"
        @click="expanded = !expanded"
      />
    </q-card-actions>

    <q-slide-transition>
      <div v-show="expanded">
        <q-separator />
        <q-card-section class="text-subitle2">
          <q-list>
            <q-item v-for="t in claimedTeleports" :key="t.id">
              <q-item-section class="col-3">
                {{ t.quantity }}
              </q-item-section>
              <q-item-section class="col-1">
                <q-icon class="fas fa-arrow-right"></q-icon>
              </q-item-section>
              <q-item-section>{{
                ethAddressShort(t.eth_address)
              }}</q-item-section>
              <q-item-section>
                <token-avatar
                  :token="evmNetworkNameById(t.chain_id)"
                  :avatarSize="25"
                />
              </q-item-section>
              <q-item-section side>
                <div v-if="t.claimed" class="text-emphasis">Claimed</div>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </div>
    </q-slide-transition>
  </q-card>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import { Api, JsonRpc, Serialize } from "eosjs";
import tokenAvatar from "src/components/TokenAvatar";
import metamask from "src/components/Metamask";

const fromHexString = hexString =>
  new Uint8Array(hexString.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));

const toHexString = bytes =>
  bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, "0"), "");

export default {
  props: ["selectedTokenSym"],
  components: {
    tokenAvatar
  },
  mixins: [metamask],
  data() {
    return {
      expanded: false
    };
  },
  computed: {
    ...mapGetters("account", ["accountName"]),
    ...mapGetters("tport", [
      "getEvmAccountName",
      "getEvmNetwork",
      "getEvmChainId",
      "getEvmRemoteId",
      "getEvmNetworkList",
      "getTPortTokensBySym",
      "getTeleports"
    ]),
    unclaimedTeleports() {
      return this.getTeleports.filter(
        el =>
          !el.claimed && this.$chainToSym(el.quantity) === this.selectedTokenSym
      );
    },
    claimedTeleports() {
      return this.getTeleports.filter(
        el =>
          el.claimed && this.$chainToSym(el.quantity) === this.selectedTokenSym
      );
    }
  },
  methods: {
    correctNetwork(remoteId) {
      if (this.getEvmNetwork) {
        return this.getEvmNetwork.remoteId === remoteId;
      } else return false;
    },
    correctAccount(account) {
      return (
        this.getEvmAccountName.toUpperCase() ===
        this.ethAddressFull(account).toUpperCase()
      );
    },
    networkNameFromId(remoteId) {
      const net = this.getEvmNetworkList.find(el => el.remoteId === remoteId);
      return net ? net.name : "";
    },
    ethAddressShort(val) {
      return "0x" + val.substr(0, 4) + "..." + val.substr(36, 4);
    },
    ethAddressFull(val) {
      return "0x" + val.substr(0, 40);
    },
    evmNetworkNameById(remoteId) {
      const net = this.getEvmNetworkList.find(el => el.remoteId === remoteId);
      if (net) return net.name;
      else return "";
    },
    async getSignData(teleportId) {
      const res = await this.$store.$api.getTableRows({
        code: process.env.TPORT_ADDRESS,
        scope: process.env.TPORT_ADDRESS,
        table: "teleports",
        lower_bound: teleportId,
        upper_bound: teleportId,
        limit: 1
      });

      if (!res.rows.length) {
        throw new Error(
          this.$t("dialog.could_not_find_teleport", { teleportId })
        );
      }

      const teleportData = res.rows[0];
      console.log("Teleport Data:", teleportData);

      // logteleport(uint64_t id, uint32_t timestamp, name from, asset quantity, uint8_t chain_id, checksum256 eth_address)
      const sb = new Serialize.SerialBuffer({
        textEncoder: new TextEncoder(),
        textDecoder: new TextDecoder()
      });
      sb.pushNumberAsUint64(teleportData.id);
      sb.pushUint32(teleportData.time);
      sb.pushName(teleportData.account);
      sb.pushAsset(teleportData.quantity);
      sb.push(teleportData.chain_id);
      sb.pushArray(fromHexString(teleportData.eth_address));

      return {
        claimAccount: "0x" + teleportData.eth_address,
        data: "0x" + toHexString(sb.array.slice(0, 69)),
        signatures: teleportData.signatures
      };
    },
    async claimEvm(teleport) {
      console.log("Claiming teleport:", teleport);
      const { injectedWeb3, web3 } = await this.$web3();

      if (injectedWeb3) {
        const signData = await this.getSignData(teleport.id);
        console.log(JSON.stringify(signData));

        const token = this.getTPortTokensBySym(
          this.$chainToSym(teleport.quantity)
        );
        const remoteContractAddress = token.remote_contracts.find(
          el => el.key === this.getEvmRemoteId
        ).value;
        const remoteInstance = new web3.eth.Contract(
          this.$erc20Abi,
          remoteContractAddress
        ); // TODO Add check to validate abi
        // TODO Add try catch
        const resp = await remoteInstance.methods
          .claim(signData.data, signData.signatures)
          .send({ from: this.getEvmAccountName });
        console.log(resp);

        // await this.$store.commit("global/setInfo", $t("dialog.tlm_claimed"));
        // this.showOverlay = true;

        // this.updateTportState();
        this.$store.dispatch("tport/setTeleports", this.accountName);
        // this.loadTeleports();
        // TODO Do a proper refresh
      }
    },
    async refreshTeleports() {
      this.$store.dispatch("tport/setTeleports", this.accountName);
    }
  },
  mounted() {
    this.connectWeb3();
  }
};
</script>
