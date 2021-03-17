<template>
  <q-page padding>
    <!-- content -->
    <div v-if="isAuthenticated" class="q-pa-md">
      <q-table :data="wallet" row-key="name" />
    </div>
    <div v-else>Connect wallet</div>
  </q-page>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

export default {
  data() {
    return {};
  },

  computed: {
    ...mapGetters("account", ["isAuthenticated", "accountName", "wallet"])
  },

  methods: {
    ...mapActions("pools", ["getBalanceFromChain", "getBaseTokens"]),
    ...mapActions("account", [
      "setWalletBaseTokens",
      "getChainWalletTable",
      "setWalletBalances",
      "getChainSTART"
    ])
  },

  async mounted() {
    await this.setWalletBaseTokens();
    await this.getChainWalletTable(this.accountName);
    await this.getChainSTART(this.accountName);
    await this.setWalletBalances(this.accountName);
  }
};
</script>
