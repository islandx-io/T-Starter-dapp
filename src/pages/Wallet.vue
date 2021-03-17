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
      base_tokens_raw: [],
      base_token_options: []
    };
  },

  computed: {
    ...mapGetters("account", ["isAuthenticated", "accountName"])
  },

  methods: {
    ...mapActions("pools", ["getBaseTokens", "getBalanceFromChain"]),

    async setBaseTokenOptions() {
      this.base_tokens_raw = await this.getBaseTokens();
      for (
        let token_num = 0;
        token_num < this.base_tokens_raw.length;
        token_num++
      ) {
        const asset = this.base_tokens_raw[token_num];
        let token_reformat = {
          sym: this.$getSymFromAsset(asset),
          decimals: this.$getDecimalFromAsset(asset),
          contract: asset.contract
        };
        this.base_token_options.push(token_reformat);
      }
    }
  },

  mounted() {}
};
</script>
