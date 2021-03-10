<template>
  <q-page>
    <section class="header-bg row content-center justify-center">
      <h2 class="text-white">Update Pool</h2>
    </section>

    <section class="body-container">
      <q-card class="card">
        <q-form
          v-if="this.accountName === this.pool.owner"
          @submit="onSubmit"
          @reset="onReset"
          @publish="onPublish"
        >
          <!-- tokens and adresses -->
          <div class="form-col-container">
            <div class="col">
              <div class="col column">
                <q-input
                  color="primary"
                  v-model="pool.title"
                  label="Title"
                  lazy-rules
                  :rules="[
                    val => (val && val.length > 1) || 'Must specify the title'
                  ]"
                  outlined
                />
              </div>
              <q-input
                color="primary"
                v-model="pool.swap_ratio.contract"
                label="Token contract address"
                lazy-rules
                :rules="[checkTokenContract]"
                debounce="1000"
                outlined
              >
              </q-input>
              <div class="q-gutter-md q-pb-md row items-center">
                <q-input
                  color="primary"
                  v-model="token_symbol"
                  label="Token"
                  lazy-rules
                  :rules="[val => !!val || 'Must specify the token']"
                  outlined
                  class="col"
                  input-style
                  hide-bottom-space
                />
                <div>To</div>
                <q-select
                  v-model="base_token_symbol"
                  :options="base_token_options.map(a => a.sym)"
                  label="Standard"
                  outlined
                  class="col"
                />
              </div>
              <!-- Swap ratio -->
              <div>Swap ratio</div>
              <div class="q-gutter-md q-pb-md row items-center">
                <div>1 {{ base_token_symbol }} =</div>
                <q-input
                  color="primary"
                  v-model="pool.swap_ratio.quantity"
                  :label="tokenSymbolReformat"
                  lazy-rules
                  :rules="[val => !!val || 'Must specify the swap ratio']"
                  outlined
                  hide-bottom-space
                  class="col"
                >
                </q-input>
              </div>
              <!-- Quantities -->
              <!-- <h3>Quantities</h3> -->
              <div class="q-gutter-md row">
                <q-input
                  color="primary"
                  v-model="pool.soft_cap"
                  :label="`Soft cap ()`"
                  lazy-rules
                  :rules="[val => !!val || 'Must specify the amount']"
                  outlined
                  class="col"
                />
                <q-input
                  color="primary"
                  v-model="pool.hard_cap"
                  :label="`Hard cap ()`"
                  lazy-rules
                  :rules="[val => !!val || 'Must specify the amount']"
                  outlined
                  class="col"
                />
              </div>
              <div class="q-gutter-md row">
                <q-input
                  color="primary"
                  v-model="pool.minimum_swap"
                  :label="`Minimum allocation ()`"
                  lazy-rules
                  :rules="[val => !!val || 'Must specify the amount']"
                  outlined
                  class="col"
                />
                <q-input
                  color="primary"
                  v-model="pool.maximum_allocation"
                  :label="`Maximum allocation ()`"
                  lazy-rules
                  :rules="[val => !!val || 'Must specify the amount']"
                  outlined
                  class="col"
                />
              </div>
              <div>Dates</div>
              <!-- Dates -->
              <div class="row reverse-wrap items-center">
                <datetime-field :value.sync="pool_open" />
                <div>Sale start</div>
              </div>
              <div class="row reverse-wrap items-center">
                <datetime-field :value.sync="private_end" />
                <div>Private sale end</div>
              </div>
              <div class="row reverse-wrap items-center">
                <datetime-field :value.sync="public_end" />
                <div>Public sale end</div>
              </div>
              <!-- <div class="col column">
                <div>Type</div>
                <q-radio v-model="pool.pool_type" val="fixed" label="Fixed" />
              </div> -->
            </div>
            <div class="col">
              <!-- Image -->
              <div class="row items-center q-pb-md">
                <q-input
                  color="primary"
                  v-model="pool.avatar"
                  label="Avatar image link"
                  lazy-rules
                  :rules="[
                    val =>
                      (val && val.length > 1) || 'Must specify the image link'
                  ]"
                  outlined
                  class="col q-pr-md"
                  hide-bottom-space
                >
                </q-input>
                <q-avatar size="50px">
                  <img :src="pool.avatar" width="20px" alt="image" />
                </q-avatar>
              </div>
              <!-- web links -->
              <div>Websites</div>
              <div class="row q-gutter-md q-pb-md">
                <q-input
                  outlined
                  v-for="link in webLinks"
                  v-model="link.value"
                  :key="link.key"
                  :label="capitalize(link.key)"
                />
              </div>
              <!-- Whitelist -->
              <q-input
                v-model="pool.whitelist"
                autogrow
                label="Some whitelist thing"
                outlined
                class="q-pb-md"
              />
              <!-- tag-line -->
              <q-input
                v-model="pool.tag_line"
                autogrow
                label="Tag line"
                lazy-rules
                :rules="[
                  val =>
                    (val && val.length > 1 && val.length < 230) ||
                    'Must specify'
                ]"
                outlined
              />
              <!-- description -->
              <q-input
                v-model="pool.description"
                autogrow
                label="Description"
                lazy-rules
                :rules="[val => (val && val.length > 1) || 'Must specify']"
                outlined
              />
            </div>
          </div>
          <div>
            <!-- T's and C's -->
            <q-toggle v-model="accept" label="I accept the license and terms" />
            <!-- Submit -->
            <div class="q-gutter-md">
              <q-btn label="Update" type="submit" color="primary" />
              <q-btn label="Publish" @click="onPublish" color="primary" />
              <q-btn label="Reset" type="reset" color="primary" flat />
            </div>
          </div>
        </q-form>

        <div v-else>You are not the owner of this pool</div>
      </q-card>
    </section>
  </q-page>
</template>

<script>
import { date } from "quasar";
import datetimeField from "src/components/poolcreation/datetime-field.vue";
import { mapGetters, mapActions } from "vuex";

export default {
  components: { datetimeField },
  data() {
    return {
      customDate: "",
      dateTimeMask: "YYYY-MM-DD HH:mm",
      poolID: Number(this.$route.params.id),
      pool: this.$defaultPoolInfo,
      pool_open: { date: "" },
      private_end: { date: "" },
      public_end: { date: "" },

      cleanedWebLinks: [],
      webLinks: [
        {
          key: "website",
          value: ""
        },
        {
          key: "github",
          value: ""
        },
        {
          key: "medium",
          value: ""
        },
        {
          key: "telegram",
          value: ""
        },
        {
          key: "twitter",
          value: ""
        },
        {
          key: "whitepaper",
          value: ""
        }
      ],

      base_token_symbol: "PBTC",
      base_token_options: [
        {
          sym: "PBTC",
          decimals: 8,
          contract: "btc.ptokens"
        },
        {
          sym: "PETH",
          decimals: 9,
          contract: "eth.ptokens"
        },
        {
          sym: "TLOS",
          decimals: 4,
          contract: "eosio.token"
        }
      ],
      token_symbol: "",
      token_decimals: 1,
      date: date.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss"),
      accept: false,
      link_index: -1
    };
  },
  computed: {
    ...mapGetters("account", ["isAuthenticated", "accountName"]),
    ...mapGetters("pools", ["getPoolByID"]),
    // owner: accountName,
    admin_address() {
      return process.env.ADMIN_ADDRESS;
    },
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
        quantity: this.toChainString(
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
    }
  },

  methods: {
    ...mapActions("pools", [
      "getChainAccountInfo",
      "getTokenPrecision",
      "getChainPoolByID",
      "updatePoolStatus"
    ]),
    capitalize(str) {
      return str.charAt(0).toUpperCase() + str.slice(1);
    },
    toUnixTimestamp(timeStamp) {
      return new Date(timeStamp).valueOf();
    },
    toDateString(timestamp) {
      return date.formatDate(timestamp, "YYYY-MM-DD HH:mm");
    },
    toChainString(number, decimals, symbol) {
      return (
        String(parseFloat(number).toFixed(decimals)) + String(" " + symbol)
      );
    },
    fromChainString(str) {
      let idx = str.indexOf(" ");
      return Number(str.slice(0, idx));
    },
    getPoolInfo() {
      this.pool = JSON.parse(JSON.stringify(this.getPoolByID(this.poolID))); //make deep copy
      this.getTokenSymbolFromPool();
      // pool to numbers
      this.pool.swap_ratio.quantity = this.fromChainString(
        this.pool.swap_ratio.quantity
      );
      this.pool.soft_cap = this.fromChainString(this.pool.soft_cap);
      this.pool.hard_cap = this.fromChainString(this.pool.hard_cap);
      this.pool.minimum_swap = this.fromChainString(this.pool.minimum_swap);
      this.pool.maximum_allocation = this.fromChainString(
        this.pool.maximum_allocation
      );

      this.populateWebLinks();
      this.BaseTokenFromChain();

      this.pool_open.date = this.toDateString(this.pool.pool_open);
      this.private_end.date = this.toDateString(this.pool.private_end);
      this.public_end.date = this.toDateString(this.pool.public_end);
    },
    getTokenSymbolFromPool() {
      let idx = this.pool.swap_ratio.quantity.indexOf(" ") + 1;
      this.token_symbol = this.pool.swap_ratio.quantity.slice(idx);
    },
    BaseTokenFromChain() {
      let idx = this.pool.base_token.sym.indexOf(",") + 1;
      this.base_token_symbol = this.pool.base_token.sym.slice(idx);
    },
    populateWebLinks() {
      this.webLinks.find(
        el => el.key === "website"
      ).value = this.pool.web_links
        .filter(el => el.key === "website")
        .map(a => a.value);
      this.webLinks.find(
        el => el.key === "github"
      ).value = this.pool.web_links
        .filter(el => el.key === "github")
        .map(a => a.value);
      this.webLinks.find(
        el => el.key === "medium"
      ).value = this.pool.web_links
        .filter(el => el.key === "medium")
        .map(a => a.value);
      this.webLinks.find(
        el => el.key === "telegram"
      ).value = this.pool.web_links
        .filter(el => el.key === "telegram")
        .map(a => a.value);
      this.webLinks.find(
        el => el.key === "twitter"
      ).value = this.pool.web_links
        .filter(el => el.key === "twitter")
        .map(a => a.value);
      this.webLinks.find(
        el => el.key === "whitepaper"
      ).value = this.pool.web_links
        .filter(el => el.key === "whitepaper")
        .map(a => a.value);
    },
    async loadChainData() {
      await this.getChainPoolByID(this.poolID);
    },
    async checkTokenContract(val) {
      // simulating a delay
      let payload = { address: val, token_symbol: this.token_symbol };
      this.token_decimals = await this.getTokenPrecision(payload);
      console.log(this.token_decimals);
    },
    checkLinks() {
      // console.log(this.webLinks.filter(el => el.value[0] != ""))
      console.log(this.webLinks.filter(el => el.value != ""));
      this.cleanedWebLinks = this.webLinks.filter(el => el.value != "");
      console.log(this.cleanedWebLinks);
    },
    async updateChainPool() {
      const actions = [
        {
          account: process.env.CONTRACT_ADDRESS,
          name: "updatepool",
          data: {
            id: this.poolID,
            title: this.pool.title,
            avatar: this.pool.avatar,
            tag_line: this.pool.tag_line,
            description: this.pool.description,
            base_token: this.BaseTokenToChain,
            swap_ratio: this.swapRatio,
            soft_cap: this.toChainString(
              this.pool.soft_cap,
              this.selected_base_token.decimals,
              this.selected_base_token.sym
            ),
            hard_cap: this.toChainString(
              this.pool.hard_cap,
              this.selected_base_token.decimals,
              this.selected_base_token.sym
            ),
            minimum_swap: this.toChainString(
              this.pool.minimum_swap,
              this.selected_base_token.decimals,
              this.selected_base_token.sym
            ),
            maximum_allocation: this.toChainString(
              this.pool.maximum_allocation,
              this.selected_base_token.decimals,
              this.selected_base_token.sym
            ),
            remaining_offer: "3501234.5670 START", //TODO set these amounts
            total_raise: "14.98765433 PBTC",
            participants: 0,
            pool_open: this.pool.pool_open,
            private_end: this.pool.private_end,
            public_end: this.pool.public_end,
            whitelist: this.pool.whitelist,
            web_links: this.cleanedWebLinks
          }
        }
      ];
      const transaction = await this.$store.$api.signTransaction(actions);
    },
    async publishPool() {
      const actions = [
        {
          account: process.env.CONTRACT_ADDRESS,
          name: "publishpool",
          data: {
            pool_id: this.poolID
          }
        }
      ];
      const transaction = await this.$store.$api.signTransaction(actions);
    },
    async onSubmit() {
      // TODO Check and clean links not empty
      // TODO check if have permission to create pool. e.g. fuzzytestnet
      // console.log({ "Submitted start date": this.pool.pool_open });
      console.log({ pool_open: this.pool_open.date });
      // console.log({ Title: this.pool.title });
      // if (this.accept !== true || !this.isAuthenticated) {
      //   this.$q.notify({
      //     color: "red-5",
      //     textColor: "white",
      //     icon: "warning",
      //     message: "You need to login and accept the license and terms first"
      //   });
      // } else {
      //   this.checkLinks();
      //   await this.updateChainPool();
      //   this.$q.notify({
      //     color: "green-4",
      //     textColor: "white",
      //     icon: "cloud_done",
      //     message: "Submitted"
      //   });
      // }
    },
    async onPublish() {
      await this.publishPool();
    },
    onReset() {}

    // addLinkField() {
    //   console.log(this.pool.web_links);
    //   this.pool.web_links.push({ key: "", value: "" });
    // },
    // deleteThisLink(index) {
    //   console.log("Delete key:" + index);
    //   this.$delete(this.pool.web_links, index);
    //   console.log(this.pool.web_links);
    // }
  },
  async mounted() {
    await this.loadChainData();
    this.getPoolInfo();
  },

  watch: {}
};
</script>

<style lang="scss" scoped>
.header-bg {
  height: 200px;
  margin-bottom: -50px;
}
.form-col-container {
  display: grid;
  grid-gap: 20px;
  align-items: stretch;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  grid-template-rows: min-content;
}
</style>
