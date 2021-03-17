<template>
  <q-page padding>
    <!-- content -->
    <div>This is my wallet!</div>
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
    await this.setWalletBalances();
  }
};
</script>
