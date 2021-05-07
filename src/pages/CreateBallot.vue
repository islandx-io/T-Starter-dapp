<template>
  <q-page>
    <section class="header-bg row content-center justify-center">
      <h2 class="text-white">Create Pool</h2>
    </section>

    <section class="body-container">
      <q-card>
        <q-form
          v-if="accountName === pool.owner"
          @submit="onSubmit"
          @reset="onReset"
          ref="updateForm"
        >
          {{ this.$route.params.id }}
        </q-form>
        <div v-else-if="this.$route.params.id != ''" style="min-height: 80px">
          <q-inner-loading :showing="pool.owner === 'Loading'">
            <q-spinner-puff size="50px" color="primary" />
          </q-inner-loading>
        </div>
        <div v-else class="text-center">
          You are not the owner of this pool
        </div>
      </q-card>
    </section>
  </q-page>
</template>

<script>
import datetimeField from "src/components/poolcreation/datetime-field.vue";
import { mapGetters, mapActions } from "vuex";
import statusBadge from "src/components/poolinfo/status-badge";

export default {
  data() {
    return {
      TermsandConditionsURL: "",
      haveWhitelist: false,
      customDate: "",
      poolID: Number(this.$route.params.id),
      pool: this.$defaultPoolInfo,
      ballot_close: { date: "" },
      pool_open: { date: "" },
      private_end: { date: "" },
      public_end: { date: "" },

      cleanedWebLinks: [],
      // prettier-ignore
      webLinks: [
        { key: "website", value: "" },
        { key: "github", value: "" },
        { key: "medium", value: "" },
        { key: "telegram", value: "" },
        { key: "twitter", value: "" },
        { key: "whitepaper", value: ""},
        { key: "whitelist", value: "" }
      ],

      base_token_symbol: "PBTC",
      base_tokens_raw: [],
      base_token_options: [],
      token_symbol: "",
      token_decimals: 1,
      accept: false,
      funded: false,
      dialog_send_tokens: false
    };
  },

  computed: {
    ...mapGetters("account", ["isAuthenticated", "accountName"]),
    ...mapGetters("ballots", ["getBallotByID"]),

    selected_base_token() {
      return this.base_token_options.find(
        el => el.sym === this.base_token_symbol
      );
    },
    BaseTokenToChain() {
      let BaseObj = this.selected_base_token;
      let obj = {
        sym: BaseObj.decimals + "," + BaseObj.sym,
        contract: BaseObj.contract
      };
      return obj;
    },
    swapRatio() {
      return {
        quantity: this.$toChainString(
          this.pool.swap_ratio.quantity,
          this.token_decimals,
          this.token_symbol
        ),
        contract: this.pool.swap_ratio.contract
      };
    },
    tokenSymbolReformat() {
      let token = this.token_symbol;
      if (token === "") return "Custom token";
      else return token;
    },
    baseTokenSymbolReformat() {
      let token = this.base_token_symbol;
      if (token === "") return "Base token";
      else return token;
    },
    poolStatusText() {
      let status = this.pool.status;
      if (status === "published") return "Pool in progress";
      else if (status === "fail") return "Pool cancelled";
      else if (status === "success") return "Pool succeeded";
      else return "";
    }
  },

  methods: {
    ...mapActions("ballots", ["getAllChainBallots", "getChainBallotByID"]),

    getPoolInfo() {
      if (this.poolID) {
        this.pool = JSON.parse(JSON.stringify(this.getBallotByID(this.poolID))); //make deep copy
      }
    },

    async onSubmit() {},
    onReset() {}
  },

  async mounted() {
    await this.getChainBallotByID(this.poolID);
    this.getPoolInfo();
  }
};
</script>

<style lang="scss" scoped>
.header-bg {
  height: 250px;
  margin-bottom: -50px;
}
.weblink-container {
  display: grid;
  align-items: stretch;
  grid-template-rows: min-content;
  grid-column-gap: 10px;
  grid-row-gap: 3px;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
}
@media only screen and (max-width: 650px) {
  .q-card {
    padding-left: 10px;
    padding-right: 10px;
  }
  .body-container {
    padding-left: 8px;
    padding-right: 8px;
  }
}
</style>
