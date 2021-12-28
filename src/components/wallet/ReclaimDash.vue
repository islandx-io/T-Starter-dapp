<template>
  <div>
    <div v-if="hasClaimable">
      <div class="q-pa-md q-gutter-sm row justify-center">
        <q-btn
          v-if="getEvmAccountName !== ''"
          label="Reclaim Tokens"
          @click="tryReclaimTokens()"
          color="primary"
        />
      </div>
      <div class="q-pa-md q-gutter-sm row justify-center">
        <q-btn
          v-if="getEvmAccountName === ''"
          label="CONNECT TO METAMASK"
          @click="connectWeb3()"
          class="hover-accent"
          color="positive"
          outline
          no-shadow
          no-caps
        />
        <div
          class="evm-account col ellipsis cursor-pointer vertical-center"
          style="max-width: 200px"
          v-if="getEvmAccountName !== ''"
        >
          {{ getEvmAccountName }}
        </div>
      </div>
    </div>
    <div v-if="!hasClaimable" class="row justify-center content-center">
      Nothing to reclaim
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import metamask from "src/components/Metamask";

export default {
  // name: 'ComponentName',
  mixins: [metamask],
  data() {
    return {};
  },

  computed: {
    ...mapGetters("account", ["isAuthenticated", "accountName"]),
    ...mapGetters("blockchains", ["currentChain"]),
    ...mapGetters("xchain", ["getEvmAccountName", "getReclaimableTokens"]),

    hasClaimable() {
      if (this.getReclaimableTokens) {
        return this.getReclaimableTokens.length > 0;        
      } else {
        return false;
      }
    },
  },

  methods: {
    ...mapActions("xchain", ["updateReclaimableTokens"]),
    async reclaimTokens() {
      const actions = [
        {
          account: process.env.XCHAIN_ADDRESS,
          name: "reclaim",
          data: {
            owner: this.accountName,
            to_address: this.getEvmAccountName.slice(2),
          },
        },
      ];
      const transaction = await this.$store.$api.signTransaction(actions);
    },
    async tryReclaimTokens() {
      try {
        await this.reclaimTokens();
        this.$q.notify({
          color: "green-4",
          textColor: "white",
          icon: "cloud_done",
          message: "Tokens reclaimed",
        });
      } catch (error) {
        this.$errorNotification(error);
      }
    },
  },

  mounted() {
    this.updateReclaimableTokens(this.accountName);
  },
};
</script>
