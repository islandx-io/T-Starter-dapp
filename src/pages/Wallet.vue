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
    ...mapActions("account", ["setWalletBaseTokens"]),

  },

  async mounted() {
    await this.setWalletBaseTokens();
  }
};
</script>
