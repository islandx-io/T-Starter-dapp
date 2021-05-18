<template>
  <q-page>
    <section class="header-bg row content-center justify-center">
      <h2 class="text-white">Create Pool</h2>
    </section>

    <section class="body-container">
      <q-card>
        <div
          v-if="this.$route.params.id != undefined && accountName != pool.owner"
          class="text-center"
        >
          You are not the owner of this pool
        </div>
        <div
          v-else-if="this.$route.params.id === undefined && !isAuthenticated"
          class="text-center"
        >
          Please login to continue
        </div>
        <q-form v-else @submit="onSubmit" @reset="onReset" ref="updateForm">
          <!-- tokens and adresses -->
          <div class="row">
            <q-list dense class="col-xs-12 col-sm-12 col-md-6 q-mb-md">
              <q-item>
                <q-item-section>
                  <q-input
                    color="primary"
                    v-model="pool.title"
                    label="Title *"
                    lazy-rules
                    :disable="
                      pool.status !== 'draft' &&
                        this.$route.params.id != undefined
                    "
                    :readonly="
                      pool.status !== 'draft' &&
                        this.$route.params.id != undefined
                    "
                    :rules="[
                      val => (val && val.length > 1) || 'Must specify the title'
                    ]"
                    outlined
                  />
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <q-input
                    color="primary"
                    v-model="pool.swap_ratio.contract"
                    label="Token contract address *"
                    lazy-rules
                    :disable="
                      pool.status !== 'draft' &&
                        this.$route.params.id != undefined
                    "
                    :readonly="
                      pool.status !== 'draft' &&
                        this.$route.params.id != undefined
                    "
                    :rules="[val => !!val || 'Must specify the token contract']"
                    outlined
                  >
                  </q-input>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section top>
                  <q-input
                    color="primary"
                    v-model="token_symbol"
                    label="Token Symbol *"
                    lazy-rules
                    :disable="
                      pool.status !== 'draft' &&
                        this.$route.params.id != undefined
                    "
                    :readonly="
                      pool.status !== 'draft' &&
                        this.$route.params.id != undefined
                    "
                    :rules="[checkTokenContract]"
                    outlined
                    debounce="1000"
                    class="col"
                    input-style
                  />
                </q-item-section>
                <q-item-section class="col-shrink q-pb-md">To</q-item-section>
                <q-item-section top>
                  <q-select
                    v-model="base_token_symbol"
                    :options="base_token_options.map(a => a.sym)"
                    :disable="
                      pool.status !== 'draft' &&
                        this.$route.params.id != undefined
                    "
                    :readonly="
                      pool.status !== 'draft' &&
                        this.$route.params.id != undefined
                    "
                    label="Base token *"
                    outlined
                  />
                </q-item-section>
              </q-item>
              <!-- Swap ratio -->
              <q-item>
                <q-item-section side class="q-pb-md"
                  >1 {{ base_token_symbol }} =
                </q-item-section>
                <q-item-section>
                  <q-input
                    color="primary"
                    v-model="pool.swap_ratio.quantity"
                    :disable="
                      pool.status !== 'draft' &&
                        this.$route.params.id != undefined
                    "
                    :readonly="
                      pool.status !== 'draft' &&
                        this.$route.params.id != undefined
                    "
                    :label="`Swap ratio (${tokenSymbolReformat}) *`"
                    lazy-rules
                    :rules="[val => !!val || 'Must specify the swap ratio']"
                    outlined
                  >
                  </q-input>
                </q-item-section>
              </q-item>
              <!-- Quantities -->
              <!-- <h3>Quantities</h3> -->
              <q-item>
                <q-item-section>
                  <q-input
                    color="primary"
                    v-model="pool.soft_cap"
                    :label="`Soft cap (${baseTokenSymbolReformat}) *`"
                    lazy-rules
                    :disable="
                      pool.status !== 'draft' &&
                        this.$route.params.id != undefined
                    "
                    :readonly="
                      pool.status !== 'draft' &&
                        this.$route.params.id != undefined
                    "
                    :rules="[val => !!val || 'Must specify the amount']"
                    outlined
                  />
                </q-item-section>
                <q-item-section>
                  <q-input
                    color="primary"
                    v-model="pool.hard_cap"
                    :label="`Hard cap (${baseTokenSymbolReformat}) *`"
                    lazy-rules
                    :disable="
                      pool.status !== 'draft' &&
                        this.$route.params.id != undefined
                    "
                    :readonly="
                      pool.status !== 'draft' &&
                        this.$route.params.id != undefined
                    "
                    :rules="[val => !!val || 'Must specify the amount']"
                    outlined
                  />
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <q-input
                    color="primary"
                    v-model="pool.minimum_swap"
                    :label="`Minimum allocation (${baseTokenSymbolReformat}) *`"
                    lazy-rules
                    :disable="
                      pool.status !== 'draft' &&
                        this.$route.params.id != undefined
                    "
                    :readonly="
                      pool.status !== 'draft' &&
                        this.$route.params.id != undefined
                    "
                    :rules="[val => !isNaN(val) || 'Must specify the amount']"
                    outlined
                  />
                </q-item-section>
                <q-item-section>
                  <q-input
                    color="primary"
                    v-model="pool.maximum_swap"
                    :label="`Maximum allocation (${baseTokenSymbolReformat}) *`"
                    lazy-rules
                    :disable="
                      pool.status !== 'draft' &&
                        this.$route.params.id != undefined
                    "
                    :readonly="
                      pool.status !== 'draft' &&
                        this.$route.params.id != undefined
                    "
                    :rules="[val => !!val || 'Must specify the amount']"
                    outlined
                  />
                </q-item-section>
              </q-item>
              <!-- Dates -->
              <!-- TODO Add "today" button -->
              <q-item>
                <q-item-section>
                  <datetime-field
                    :value.sync="ballot_close"
                    :pool="pool"
                    label="Ballot close time (UTC) *"
                    class="q-pb-md"
                  />
                </q-item-section>
                <q-item-section>
                  <datetime-field
                    :value.sync="pool_open"
                    :pool="pool"
                    label="Opening time (UTC) *"
                    class="q-pb-md"
                  />
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <datetime-field
                    :value.sync="private_end"
                    :pool="pool"
                    label="Premium end time (UTC) *"
                  />
                </q-item-section>
                <q-item-section>
                  <datetime-field
                    :value.sync="public_end"
                    :pool="pool"
                    label="Public end time (UTC) *"
                  />
                </q-item-section>
              </q-item>
              <!-- <div class="col column">
                <div>Type</div>
                <q-radio v-model="pool.pool_type" val="fixed" label="Fixed" />
              </div> -->
              <!-- Image -->
            </q-list>
            <q-list class="col-xs-12 col-sm-12 col-md-6 " dense>
              <q-item>
                <q-item-section>
                  <q-input
                    color="primary"
                    v-model="pool.avatar"
                    label="Avatar image link *"
                    lazy-rules
                    :rules="[
                      val =>
                        (val && val.length > 1) || 'Must specify the image link'
                    ]"
                    outlined
                  />
                </q-item-section>
                <q-item-section side v-if="pool.avatar !== ''">
                  <q-avatar size="50px" class="q-mb-md">
                    <q-img :src="pool.avatar" style="height: 50px">
                      <template v-slot:loading>
                        <q-spinner-puff color="primary" />
                      </template>
                      <template v-slot:error>
                        <div
                          class="absolute-full flex flex-center text-negative transparent text-weight-bold"
                        >
                          ?
                        </div>
                      </template>
                    </q-img>
                  </q-avatar>
                </q-item-section>
              </q-item>

              <!-- web links -->
              <q-item class="weblink-container">
                <div v-for="link in webLinks.slice(0, -1)" :key="link.key">
                  <q-input
                    outlined
                    v-model="link.value"
                    :label="capitalize(link.key)"
                    :rules="[validURL]"
                  />
                </div>
              </q-item>
              <!-- <q-item v-for="link in webLinks" :key="link.key">
                <q-item-section>
                  <q-input
                    outlined
                    v-model="link.value"
                    :label="capitalize(link.key)"
                  />
                </q-item-section>
              </q-item> -->
              <!-- tag-line -->
              <q-item>
                <q-item-section>
                  <q-input
                    v-model="pool.tag_line"
                    autogrow
                    label="Tag line *"
                    lazy-rules
                    :rules="[val => val.length > 1 || 'Must specify']"
                    counter
                    maxlength="230"
                    outlined
                    debounce="500"
                  />
                </q-item-section>
              </q-item>
              <!-- description -->
              <q-item>
                <q-item-section>
                  <q-input
                    v-model="pool.description"
                    autogrow
                    label="Description *"
                    lazy-rules
                    :rules="[val => val.length > 1 || 'Must specify']"
                    outlined
                    debounce="1000"
                    type="textarea"
                    counter
                    maxlength="4000"
                  />
                </q-item-section>
              </q-item>

              <!-- Whitelist -->
              <q-item>
                <q-checkbox v-model="haveWhitelist" el="haveWhitelist">
                  Whitelist?
                </q-checkbox>
              </q-item>

              <q-item v-if="haveWhitelist">
                <q-item-section>
                  <!-- FIXME make dynamic, find doesn't work -->
                  <q-input
                    v-model="webLinks[6].value"
                    label="Whitelist Application URL"
                    outlined
                    :rules="[validURL]"
                  />
                </q-item-section>
              </q-item>
              <q-item v-if="haveWhitelist">
                <q-item-section>
                  <q-input
                    v-model="pool.whitelist"
                    autogrow
                    label="Whitelist (CSV)"
                    outlined
                    :rules="[whitelistValidate]"
                    debounce="500"
                    placeholder="Leave empty if no whitelist needed"
                  /> </q-item-section
              ></q-item>
            </q-list>
          </div>

          <!-- Terms and Conditions -->
          <q-list>
            <q-item>
              <q-checkbox v-model="accept" el="accept">
                I agree to the
                <a :href="TermsandConditionsURL" target="_blank" @click.stop
                  >Terms and Conditions</a
                >
              </q-checkbox>
            </q-item>

            <q-item class="justify-start">
              <q-item-section class="col-auto">
                <q-btn
                  :label="
                    this.$route.params.id === undefined ? 'Create' : 'Update'
                  "
                  type="submit"
                  color="primary"
                />
              </q-item-section>
              <q-item-section class="col-auto">
                <q-btn
                  label="Fund"
                  @click="onFund"
                  :disable="
                    pool.status === 'published' ||
                      this.funded ||
                      pool.title == ''
                  "
                  v-if="pool.status === 'draft'"
                  color="primary"
                />
                <q-tooltip v-if="pool.status === 'published'">
                  Already published
                </q-tooltip>
                <q-tooltip v-if="this.funded">
                  Already funded
                </q-tooltip>
              </q-item-section>
              <q-item-section class="col-auto">
                <q-btn
                  label="Publish"
                  @click="onPublish"
                  :disable="!this.funded || pool.status === 'published'"
                  v-if="pool.status === 'draft' && funded"
                  color="primary"
                />
                <q-tooltip v-if="!funded">
                  Not funded
                </q-tooltip>
                <q-tooltip v-if="pool.status === 'published'">
                  Already published
                </q-tooltip>
              </q-item-section>
              <!-- <q-item-section class="col-shrink">
                <q-btn label="Reset" type="reset" color="primary" flat />
              </q-item-section> -->
              <!-- Close pool button -->
              <q-item-section class="col-auto">
                <q-btn
                  label="Close Pool"
                  @click="onClosePool"
                  color="accent"
                  v-if="
                    (this.$chainToQty(pool.remaining_offer) === 0 ||
                      Date.now() > pool.public_end) &&
                      pool.status === 'published'
                  "
                />
              </q-item-section>
              <q-item-section>
                <div>
                  <status-badge
                    :poolStatus="pool.status"
                    :badgeText="poolStatusText"
                  />
                </div>
              </q-item-section>
            </q-item>
          </q-list>
        </q-form>
        <!-- <div v-else style="min-height: 80px">
          <q-inner-loading :showing="pool.owner === 'Loading'">
            <q-spinner-puff size="50px" color="primary" />
          </q-inner-loading>
        </div> -->
      </q-card>
    </section>
  </q-page>
</template>

<script>
import datetimeField from "src/components/poolcreation/datetime-field.vue";
import { mapGetters, mapActions } from "vuex";
import statusBadge from "src/components/poolinfo/status-badge";

export default {
  components: { datetimeField, statusBadge },
  data() {
    return {
      TermsandConditionsURL: "",
      haveWhitelist: false,
      customDate: "",
      poolID: Number(this.$route.params.id),
      pool: this.$defaultBallotInfo,
      settings: {},
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
    ...mapGetters("pools", ["getPoolByID"]),
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
      else return "Draft";
    }
  },

  methods: {
    ...mapActions("ballots", [
      "getAllChainBallots",
      "getChainBallotByID",
      "findCreatedBallotID"
    ]),
    ...mapActions("pools", [
      "getChainAccountInfo",
      "getTokenPrecision",
      "getChainPoolByID",
      "updatePoolStatus",
      "ifPoolFunded",
      "getBaseTokens",
      "getPoolsSettings"
    ]),
    capitalize(str) {
      return str.charAt(0).toUpperCase() + str.slice(1);
    },
    toUnixTimestamp(timeStamp) {
      return new Date(timeStamp).valueOf();
    },
    toDateString(timestamp) {
      if (timestamp <= 0) timestamp = new Date().valueOf();
      return new Date(timestamp)
        .toISOString()
        .slice(0, 16)
        .replace("T", " ");
      // return date.formatDate(new Date(timestamp), "YYYY-MM-DD HH:mm");
    },

    formatWhitelist() {
      // check if whitelist enabled
      if (this.haveWhitelist) {
        if (!(this.pool.whitelist instanceof Array)) {
          // if empty do nothing
          if (this.pool.whitelist.length !== 0) {
            //clean whitespace
            if (this.pool.whitelist.includes(" ")) {
              this.pool.whitelist = this.pool.whitelist.replace(" ", "");
            }
            //split into array
            this.pool.whitelist = this.pool.whitelist.split(",");
          }
        }
      } else {
        this.pool.whitelist = "";
        this.webLinks.find(el => el.key === "whitelist").value = "";
      }
    },

    // TODO check accounts exist?
    whitelistValidate(val) {
      console.log(val);
      if (val.length === 0) {
        return;
      } else if (val instanceof Array) {
        return;
      } else {
        console.log(val.split(","));
        return (
          (val.split(",").length > 1 && val.split(",")[1] != "") ||
          `Must contain at least two accounts`
        );
      }
    },

    validURL(str) {
      var pattern = new RegExp(
        "^(https?:\\/\\/)?" + // protocol
        "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
        "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
        "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
        "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
          "(\\#[-a-z\\d_]*)?$",
        "i"
      ); // fragment locator
      if (str.length === 0) {
        return;
      } else {
        return !!pattern.test(str) || "Must be valid URL";
      }
    },

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
    },

    getTokenSymbolFromPool() {
      let idx = this.pool.swap_ratio.quantity.indexOf(" ") + 1;
      this.token_symbol = this.pool.swap_ratio.quantity.slice(idx);
    },
    BaseTokenSymFromChain() {
      let idx = this.pool.base_token.sym.indexOf(",") + 1;
      this.base_token_symbol = this.pool.base_token.sym.slice(idx);
    },
    populateWebLinks() {
      // prettier-ignore
      this.webLinks.find(el => el.key === "website").value = this.pool.web_links.filter(el => el.key === "website").map(a => a.value);
      // prettier-ignore
      this.webLinks.find( el => el.key === "github" ).value = this.pool.web_links.filter(el => el.key === "github").map(a => a.value);
      // prettier-ignore
      this.webLinks.find( el => el.key === "medium" ).value = this.pool.web_links.filter(el => el.key === "medium").map(a => a.value);
      // prettier-ignore
      this.webLinks.find( el => el.key === "telegram" ).value = this.pool.web_links.filter(el => el.key === "telegram").map(a => a.value);
      // prettier-ignore
      this.webLinks.find( el => el.key === "twitter" ).value = this.pool.web_links.filter(el => el.key === "twitter").map(a => a.value);
      // prettier-ignore
      this.webLinks.find( el => el.key === "whitepaper" ).value = this.pool.web_links.filter(el => el.key === "whitepaper").map(a => a.value);
      // prettier-ignore
      this.webLinks.find( el => el.key === "whitelist" ).value = this.pool.web_links.filter(el => el.key === "whitelist").map(a => a.value);
    },

    async checkTokenContract(val) {
      // get decimal precisoin from token
      let payload = {
        address: this.pool.swap_ratio.contract,
        token_symbol: val
      };
      this.token_decimals = await this.getTokenPrecision(payload);
      return (
        (!!val && this.token_decimals >= 0) ||
        `Must be a valid contract and token`
      );
    },

    checkLinks() {
      this.cleanedWebLinks = this.webLinks.filter(el => el.value != "");
    },

    getPoolInfo() {
      if (this.poolID) {
        this.pool = JSON.parse(JSON.stringify(this.getBallotByID(this.poolID))); //make deep copy
        // if this pool is owned by user, populate the fields
        if (this.pool.owner === this.accountName) {
          this.getTokenSymbolFromPool();
          // pool to numbers
          this.pool.swap_ratio.quantity = this.$chainToQty(
            this.pool.swap_ratio.quantity
          );
          this.pool.soft_cap = this.$chainToQty(this.pool.soft_cap);
          this.pool.hard_cap = this.$chainToQty(this.pool.hard_cap);
          this.pool.minimum_swap = this.$chainToQty(this.pool.minimum_swap);
          this.pool.maximum_swap = this.$chainToQty(this.pool.maximum_swap);

          this.populateWebLinks();
          this.BaseTokenSymFromChain();

          this.ballot_close.date = this.toDateString(this.pool.ballot_close);
          this.pool_open.date = this.toDateString(this.pool.pool_open);
          this.private_end.date = this.toDateString(this.pool.private_end);
          this.public_end.date = this.toDateString(this.pool.public_end);

          if (this.pool.whitelist.length > 0) {
            this.haveWhitelist = true;
          }
        }
      }
    },

    async updateChainPool() {
      const actions = [
        {
          account: process.env.BALLOT_ADDRESS,
          name: "updateballot",
          data: {
            id: this.poolID,
            title: this.pool.title,
            avatar: this.pool.avatar,
            tag_line: this.pool.tag_line,
            description: this.pool.description,
            base_token: this.BaseTokenToChain,
            swap_ratio: this.swapRatio,
            soft_cap: this.$toChainString(
              this.pool.soft_cap,
              this.selected_base_token.decimals,
              this.selected_base_token.sym
            ),
            hard_cap: this.$toChainString(
              this.pool.hard_cap,
              this.selected_base_token.decimals,
              this.selected_base_token.sym
            ),
            minimum_swap: this.$toChainString(
              this.pool.minimum_swap,
              this.selected_base_token.decimals,
              this.selected_base_token.sym
            ),
            maximum_swap: this.$toChainString(
              this.pool.maximum_swap,
              this.selected_base_token.decimals,
              this.selected_base_token.sym
            ),
            ballot_close: this.pool.ballot_close,
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
          account: process.env.BALLOT_ADDRESS,
          name: "publishpool",
          data: {
            pool_id: this.poolID
          }
        }
      ];
      const transaction = await this.$store.$api.signTransaction(actions);
    },

    async createBallot() {
      const actions = [
        {
          account: "token.start",
          name: "transfer",
          data: {
            from: this.accountName,
            to: process.env.BALLOT_ADDRESS,
            quantity: this.settings.listing_fee,
            memo: `ballot fee`
          }
        },
        {
          account: process.env.BALLOT_ADDRESS,
          name: "newballot",
          data: {
            owner: this.accountName
          }
        }
      ];
      const transaction = await this.$store.$api.signTransaction(actions);
    },

    async fundPool() {
      const actions = [
        {
          account: this.pool.swap_ratio.contract,
          name: "transfer",
          data: {
            from: this.accountName,
            to: process.env.BALLOT_ADDRESS,
            quantity: this.$toChainString(
              this.pool.swap_ratio.quantity * this.pool.hard_cap,
              this.token_decimals,
              this.token_symbol
            ),
            memo: `fund ballot:${this.poolID}`
          }
        }
      ];
      const transaction = await this.$store.$api.signTransaction(actions);
    },

    async closePool(send_tokens) {
      const actions = [
        {
          account: process.env.BALLOT_ADDRESS,
          name: "closepool",
          data: {
            pool_id: this.poolID,
            send_tokens: send_tokens
          }
        }
      ];
      const transaction = await this.$store.$api.signTransaction(actions);
    },

    async tryCreatePool() {
      try {
        // if not owned pool create ballot
        if (this.accountName != this.pool.owner) {
          await this.createBallot();
        }
        this.poolID = await this.findCreatedBallotID(this.accountName);
      } catch (error) {
        this.$q.notify({
          color: "red-5",
          textColor: "white",
          icon: "warning",
          message: `${error}`
        });
      }
    },

    async onSubmit() {
      this.pool.ballot_close = this.ballot_close.date;
      this.pool.pool_open = this.pool_open.date;
      this.pool.private_end = this.private_end.date;
      this.pool.public_end = this.public_end.date;
      console.log({ "Submitted start date": this.pool.pool_open });
      if (this.accept !== true || !this.isAuthenticated) {
        this.$q.notify({
          color: "red-5",
          textColor: "white",
          icon: "warning",
          message: "You need to accept the terms and conditions first"
        });
      } else {
        this.checkLinks();
        this.formatWhitelist();
        try {
          // try create pool
          await this.tryCreatePool();
          //update ballot
          await this.updateChainPool();
          this.$q.notify({
            color: "green-4",
            textColor: "white",
            icon: "cloud_done",
            message: "Updated"
          });
          this.redirectBallotPage();
        } catch (error) {
          this.$q.notify({
            color: "red-5",
            textColor: "white",
            icon: "warning",
            message: `${error}`
          });
        }
      }
    },

    async onPublish() {
      if (this.accept !== true) {
        this.$q.notify({
          color: "red-5",
          textColor: "white",
          icon: "warning",
          message: "You need to accept the terms and conditions first"
        });
      } else {
        try {
          if (await this.$refs.updateForm.validate()) {
            await this.publishPool();
            this.$q.notify({
              color: "green-4",
              textColor: "white",
              icon: "cloud_done",
              message: "Published"
            });
            this.redirectBallotPage();
          }
        } catch (error) {
          this.$q.notify({
            color: "red-5",
            textColor: "white",
            icon: "warning",
            message: `${error}`
          });
        }
      }
    },

    async onFund() {
      if (this.accept !== true) {
        this.$q.notify({
          color: "red-5",
          textColor: "white",
          icon: "warning",
          message: "You need to accept the terms and conditions first"
        });
      } else {
        try {
          if (await this.$refs.updateForm.validate()) {
            await this.fundPool();
            this.$q.notify({
              color: "green-4",
              textColor: "white",
              icon: "cloud_done",
              message: "Funded"
            });
            this.redirectBallotPage();
          }
        } catch (error) {
          this.$q.notify({
            color: "red-5",
            textColor: "white",
            icon: "warning",
            message: `${error}`
          });
        }
      }
    },

    async tryClosePool(send_tokens) {
      try {
        await this.closePool(send_tokens);
        this.$q.notify({
          color: "green-4",
          textColor: "white",
          icon: "cloud_done",
          message: "Pool completed"
        });
        this.redirectBallotPage();
      } catch (error) {
        this.$q.notify({
          color: "red-5",
          textColor: "white",
          icon: "warning",
          message: `${error}`
        });
      }
    },

    async onClosePool() {
      this.dialog_send_tokens = true;
    },

    onReset() {},

    redirectBallotPage() {
      this.$router.push({
        name: "ballotdetails",
        params: { id: this.poolID }
      });
    }
  },

  async mounted() {
    this.settings = await this.getPoolsSettings();

    if (this.poolID) {
      await this.getChainBallotByID(this.poolID);
      this.getPoolInfo();
    }
    await this.setBaseTokenOptions();

    // check if already funded
    this.funded = await this.ifPoolFunded({
      account: this.accountName,
      id: this.poolID
    });
  },

  watch: {
    async accountName() {
      if (this.poolID) {
        await this.getChainBallotByID(this.poolID);
        this.getPoolInfo();
      }

      // check if already funded
      this.funded = await this.ifPoolFunded({
        account: this.accountName,
        id: this.poolID
      });
    }
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
