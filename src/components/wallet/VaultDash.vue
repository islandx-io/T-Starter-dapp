<template>
  <div>
    <!-- <div
      class="evm-account col ellipsis cursor-pointer"
      style="max-width: 200px"
      v-if="getEvmAccountName !== ''"
    >
      {{ getEvmAccountName }}
    </div> -->
    <div class="row justify-center">
      <div class="text-h6 text-center q-pr-sm">Refunds</div>      
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
    
    <!-- Connect button -->
    <div class="row justify-center">
      <q-btn
        v-if="getEvmAccountName === ''"
        label="CONNECT"
        @click="connectWeb3()"
        class="hover-accent justify-center"
        color="positive"
        outline
        no-shadow
        no-caps
      />
    </div>
    
    <div class="column">      
      <div
        class="row justify-center items-center q-py-xs"
        v-for="t in unclaimedTeleports"
        :key="t.id"
      >
        <div class="col-4 text-right">
          {{ t.token_amount }}
        </div>
        <q-icon class="q-mx-sm fas fa-arrow-right"></q-icon>
        <div class="col-sm row items-center justify-start">
          <div>{{ ethAddressShort(t.to_address) }}</div>
          <token-avatar
            class="q-mx-sm"
            :token="evmNetworkNameById(t.chain_id)"
            :avatarSize="25"
          />
        </div>
        <div side>
          <q-btn class="hover-accent" v-if="t.processing" color="grey">
            Processing
          </q-btn>
          <q-btn
            class="hover-accent"
            v-else-if="
              !t.claimed &&
              correctNetwork(t.chain_id) &&
              correctAccount(t.to_address)
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
            v-else-if="!t.claimed && !correctAccount(t.to_address)"
            color="grey"
            @click="$q.notify({ color: 'green-4', message: 'TODO' })"
          >
            Switch Account
          </q-btn>
        </div>
      </div>
    </div>
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
        <div class="text-subitle2">
          <div class="column">
            <div
              class="row justify-center items-center q-py-xs"
              v-for="t in claimedTeleports"
              :key="t.id"
            >
              <div class="col text-right">
                {{ t.token_amount }}
              </div>
              <q-icon class="q-mx-sm fas fa-arrow-right"></q-icon>
              <div class="col row items-center justify-start">
                <div>{{ ethAddressShort(t.to_address) }}</div>
                <token-avatar
                  class="q-mx-sm"
                  :token="evmNetworkNameById(t.chain_id)"
                  :avatarSize="25"
                />
              </div>
              <!-- <div side>
                <div v-if="t.claimed" class="text-emphasis">Claimed</div>
              </div> -->
            </div>
          </div>
        </div>
      </div>
    </q-slide-transition>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import { Api, JsonRpc, Serialize } from "eosjs";
import tokenAvatar from "src/components/TokenAvatar";
import metamask from "src/components/Metamask";

const fromHexString = (hexString) =>
  new Uint8Array(hexString.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)));

const toHexString = (bytes) =>
  bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, "0"), "");

export default {
  components: {
    tokenAvatar,
  },
  mixins: [metamask],
  data() {
    return {
      expanded: false,
      pollTeleport: null,
    };
  },
  computed: {
    ...mapGetters("account", ["accountName"]),
    ...mapGetters("xchain", [
      "getEvmAccountName",
      "getEvmNetwork",
      "getEvmChainId",
      "getEvmRemoteId",
      "getEvmNetworkList",
      "getTPortTokensBySym",
      "getTeleports",
      "getVaultContractAddr",
    ]),
    unclaimedTeleports() {
      if (this.getEvmAccountName !== undefined) {
        return this.getTeleports.filter(
          (el) => !el.claimed && this.correctAccount(el.to_address)
        );
      } else {
        return [];
      }
    },
    claimedTeleports() {
      if (this.getEvmAccountName !== undefined) {
        return this.getTeleports.filter(
          (el) => el.claimed && this.correctAccount(el.to_address)
        );
      } else {
        return [];
      }
    },
  },
  methods: {
    ...mapActions("xchain", ["updateTeleports", "updateTPortTokens"]),
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
      const net = this.getEvmNetworkList.find((el) => el.remoteId === remoteId);
      return net ? net.name : "";
    },
    ethAddressShort(val) {
      return "0x" + val.substr(0, 4) + "..." + val.substr(36, 4);
    },
    ethAddressFull(val) {
      return "0x" + val.substr(0, 40);
    },
    evmNetworkNameById(remoteId) {
      const net = this.getEvmNetworkList.find((el) => el.remoteId === remoteId);
      if (net) return net.name;
      else return "";
    },
    async getSignData(teleportId) {
      const res = await this.$store.$api.getTableRows({
        code: process.env.XCHAIN_ADDRESS,
        scope: process.env.XCHAIN_ADDRESS,
        table: "teleports",
        lower_bound: teleportId,
        upper_bound: teleportId,
        limit: 1,
      });

      if (!res.rows.length) {
        throw new Error(
          this.$t("dialog.could_not_find_teleport", { teleportId })
        );
      }

      const teleportData = res.rows[0];
      console.log("Teleport Data:", teleportData);

      // logteleport(uint64_t id, uint32_t timestamp, name from, asset token_amount, uint8_t chain_id, checksum256 to_address)
      const sb = new Serialize.SerialBuffer({
        textEncoder: new TextEncoder(),
        textDecoder: new TextDecoder(),
      });
      sb.pushNumberAsUint64(teleportData.id);
      sb.pushUint32(teleportData.time);
      sb.pushName(teleportData.account);
      sb.pushAsset(teleportData.token_amount);
      sb.push(teleportData.chain_id);
      sb.pushArray(fromHexString(teleportData.to_address));
      sb.pushArray(fromHexString(teleportData.token_address));

      return {
        claimAccount: "0x" + teleportData.to_address,
        data: "0x" + toHexString(sb.array.slice(0, 77)),
        signatures: teleportData.signatures,
      };
    },
    async claimEvm(teleport) {
      console.log("Claiming teleport:", teleport);
      const { injectedWeb3, web3 } = await this.$web3();

      if (injectedWeb3) {
        try {
          const signData = await this.getSignData(teleport.id);
          // console.log(JSON.stringify(signData));

          // const token = this.getTPortTokensBySym(
          //   this.$chainToSym(teleport.token_amount)
          // );
          const remoteInstance = new web3.eth.Contract(
            this.$vaultAbi,
            this.getVaultContractAddr
          );

          const resp = await remoteInstance.methods
            .claim(signData.data, signData.signatures)
            .send({ from: this.getEvmAccountName });
          // console.log(resp);

          // this.showOverlay = true;

          // this.updateTportState();
          this.updateTeleports(this.accountName);
          // this.loadTeleports();
          // TODO Do a proper refresh?
        } catch (error) {
          this.$errorNotification(error);
        }
      }
    },
    async refreshTeleports() {
      this.updateTeleports(this.accountName);
    },
  },
  mounted() {
    // Poll teleports
    this.pollTeleport = setInterval(async () => {
      this.refreshTeleports();
    }, 10000);
  },
  destroyed() {
    clearInterval(this.pollTeleport);
  },
};
</script>
