<template>
  <q-page padding>
    <!-- content -->
    <div v-if="isAuthenticated">This is my wallet!</div>
    <div v-else>Connect wallet</div>
  </q-page>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

export default {
  data() {
    return {
      
    };
  },

  computed: {
    ...mapGetters("account", ["isAuthenticated", "accountName"])
  },

  methods: {
    ...mapActions("pools", ["getBalanceFromChain", "getBaseTokens"]),
    ...mapActions("account", ["setWalletBaseTokens","getChainWalletTable", "setWalletBalances", "getChainSTART"]),

  },

  async mounted() {
    await this.setWalletBaseTokens();
    await this.getChainWalletTable(this.accountName);
    await this.getChainSTART(this.accountName);
    await this.setWalletBalances(this.accountName);
  }
};
</script>
