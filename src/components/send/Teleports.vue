<template>
  <q-card>
    <div class="text-h6 text-center">Teleports</div>
    <q-list>
      <q-item v-for="t in getTeleports" :key="t.id">
        <q-item-section class="col-3">
          {{ t.quantity }}
        </q-item-section>
        <q-item-section class="col-1">
          <q-icon class="fas fa-arrow-right"></q-icon>
        </q-item-section>
        <q-item-section>{{ t.chain_id }}</q-item-section>
        <q-item-section side>
          <q-btn v-if="t.claimable" color="primary" @click="claimEvm(t)">
            Claim
          </q-btn>
          <div v-else-if="t.claimed" class="text-emphasis">Claimed</div>
        </q-item-section>
      </q-item>
    </q-list>
  </q-card>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import { Api, JsonRpc, Serialize } from "eosjs";

const fromHexString = hexString =>
  new Uint8Array(hexString.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));

const toHexString = bytes =>
  bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, "0"), "");

export default {
  props: { selectedNetwork: String, selectedTokenSym: String },
  data() {
    return {};
  },
  computed: {
    ...mapGetters("account", ["accountName"]),
    ...mapGetters("tport", [
      "getEvmAccountName",
      "getEvmChainId",
      "getEvmRemoteId",
      "getEvmNetworkList",
      "getTPortTokensBySym",
      "getTeleports"
    ])
  },
  methods: {
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

        const chainData = this.getEvmNetworkList.find(
          el => el.name.toUpperCase() === this.selectedNetwork
        );
        const token = this.getTPortTokensBySym(this.selectedTokenSym);
        const remoteContractAddress = token.remote_contracts.find(
          el => el.key === chainData.remoteId
        ).value;
        const remoteInstance = new web3.eth.Contract(
          this.$erc20Abi,
          remoteContractAddress
        ); // TODO Add check to validate abi
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
    }
  }
};
</script>
