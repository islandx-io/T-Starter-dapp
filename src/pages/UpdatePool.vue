<template>
  <q-page>
    <section class="header-bg row content-center justify-center">
      <h2 class="text-white">Update Pool</h2>
    </section>

    <section class="body-container">
      <q-card>
        <q-form
          v-if="this.accountName === this.pool.owner"
          @submit="onSubmit"
          @reset="onReset"
          ref="updateForm"
        >
          <!-- tokens and adresses -->
          <div class="form-col-container">
            <q-list dense>
              <q-item>
                <q-item-section>
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
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
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
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section top>
                  <q-input
                    color="primary"
                    v-model="token_symbol"
                    label="Token"
                    lazy-rules
                    :rules="[val => !!val || 'Must specify the token']"
                    outlined
                    class="col"
                    input-style
                  />
                </q-item-section>
                <q-item-section class="col-shrink q-pb-md">To</q-item-section>
                <q-item-section top>
                  <q-select
                    v-model="base_token_symbol"
                    :options="base_token_options.map(a => a.sym)"
                    label="Base token"
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
                    :label="`Swap ratio (${tokenSymbolReformat})`"
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
                    :label="`Soft cap (${baseTokenSymbolReformat})`"
                    lazy-rules
                    :rules="[val => !!val || 'Must specify the amount']"
                    outlined
                  />
                </q-item-section>
                <q-item-section>
                  <q-input
                    color="primary"
                    v-model="pool.hard_cap"
                    :label="`Hard cap (${baseTokenSymbolReformat})`"
                    lazy-rules
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
                    :label="`Minimum allocation (${baseTokenSymbolReformat})`"
                    lazy-rules
                    :rules="[val => !!val || 'Must specify the amount']"
                    outlined
                  />
                </q-item-section>
                <q-item-section>
                  <q-input
                    color="primary"
                    v-model="pool.maximum_swap"
                    :label="`Maximum allocation (${baseTokenSymbolReformat})`"
                    lazy-rules
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
                    :value.sync="pool_open"
                    label="Sale start"
                    class="q-pb-md"
                  />
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <datetime-field
                    :value.sync="private_end"
                    label="Private sale end"
                  />
                </q-item-section>
                <q-item-section>
                  <datetime-field
                    :value.sync="public_end"
                    label="Public sale end"
                  />
                </q-item-section>
              </q-item>
              <!-- <div class="col column">
                <div>Type</div>
                <q-radio v-model="pool.pool_type" val="fixed" label="Fixed" />
              </div> -->
              <!-- Image -->
            </q-list>
            <q-list class="col" dense>
              <q-item>
                <q-item-section>
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
              <!-- Whitelist -->
              <!-- <q-item>
                <q-item-section>
                  <q-input
                    v-model="pool.whitelist"
                    autogrow
                    label="Some whitelist thing"
                    outlined
                  /> </q-item-section
              ></q-item> -->
              <!-- web links -->
              <q-item class="weblink-container">
                <div v-for="link in webLinks" :key="link.key">
                  <q-input
                    outlined
                    v-model="link.value"
                    :label="capitalize(link.key)"
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
                    label="Tag line"
                    lazy-rules
                    :rules="[
                      val =>
                        (val && val.length > 1 && val.length < 230) ||
                        'Must specify'
                    ]"
                    outlined
                    debounce="500"
                    style="padding-top:20px"
                  />
                </q-item-section>
              </q-item>
              <!-- description -->
              <q-item>
                <q-item-section>
                  <q-input
                    v-model="pool.description"
                    autogrow
                    label="Description"
                    lazy-rules
                    :rules="[val => (val && val.length > 1) || 'Must specify']"
                    outlined
                    debounce="1000"
                    type="textarea"
                  />
                </q-item-section>
              </q-item>
            </q-list>
          </div>
          <q-list>
            <q-item>
              <q-toggle
                v-model="accept"
                label="I accept the license and terms"
                el="accept"
              />
            </q-item>
            <q-item class="justify-start">
              <q-item-section class="col-auto">
                <q-btn label="Update" type="submit" color="primary" />
              </q-item-section>
              <q-item-section class="col-auto">
                <q-btn label="Fund" @click="onFund" :disable="pool.status === 'published'" color="primary" />
                <q-tooltip v-if="pool.status === 'published'">
                  Already published
                </q-tooltip>
              </q-item-section>
              <q-item-section class="col-auto">
                <q-btn
                  label="Publish"
                  @click="onPublish"
                  :disable="!this.funded || pool.status === 'published'"
                  color="primary"
                />
                <q-tooltip v-if="!funded">
                  Pool fully not funded
                </q-tooltip>
                <q-tooltip v-if="pool.status === 'published'">
                  Already published
                </q-tooltip>
              </q-item-section>
              <q-item-section class="col-shrink">
                <q-btn label="Reset" type="reset" color="primary" flat />
              </q-item-section>
            </q-item>
          </q-list>
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
      link_index: -1,
      funded: false
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
    }
  },

  methods: {
    ...mapActions("pools", [
      "getChainAccountInfo",
      "getTokenPrecision",
      "getChainPoolByID",
      "updatePoolStatus",
      "ifPoolFunded"
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
    getPoolInfo() {
      this.pool = JSON.parse(JSON.stringify(this.getPoolByID(this.poolID))); //make deep copy
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
    },

    async loadChainData() {
      await this.getChainPoolByID(this.poolID);
    },

    // TODO check this check again
    async checkTokenContract(val) {
      // simulating a delay
      let payload = { address: val, token_symbol: this.token_symbol };
      this.token_decimals = await this.getTokenPrecision(payload);
      console.log(this.token_decimals);
      return (
        (!!val && this.token_decimals >= 0) ||
        `Must be a valid contract and token`
      );
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

    async fundPool() {
      const actions = [
        {
          account: this.pool.swap_ratio.contract,
          name: "transfer",
          data: {
            from: this.accountName,
            to: process.env.CONTRACT_ADDRESS,
            quantity: this.$toChainString(
              this.pool.swap_ratio.quantity * this.pool.hard_cap,
              this.token_decimals,
              this.token_symbol
            ),
            memo: `fund pool:${this.poolID}`
          }
        }
      ];
      const transaction = await this.$store.$api.signTransaction(actions);
    },

    async onSubmit() {
      // console.log({ "Submitted start date": this.pool.pool_open });
      this.pool.pool_open = this.pool_open.date;
      this.pool.private_end = this.private_end.date;
      this.pool.public_end = this.public_end.date;
      console.log({ pool_open: this.pool_open.date });
      if (this.accept !== true || !this.isAuthenticated) {
        this.$q.notify({
          color: "red-5",
          textColor: "white",
          icon: "warning",
          message: "You need to login and accept the license and terms first"
        });
      } else {
        this.checkLinks();
        await this.updateChainPool();
        this.$q.notify({
          color: "green-4",
          textColor: "white",
          icon: "cloud_done",
          message: "Submitted"
        });
      }
    },

    async onPublish() {
      await this.publishPool();
    },

    async onFund() {
      try {
        if (await this.$refs.updateForm.validate()) {
          await this.fundPool();
        }
      } catch (error) {}
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
    await this.getPoolInfo();

    // TODO check if already funded
    let payload = { account: this.accountName, id: this.poolID };
    this.funded = await this.ifPoolFunded(payload);
    console.log(this.funded);
  },

  watch: {}
};
</script>

<style lang="scss" scoped>
// .header-bg,
.body-container,
.q-card {
  min-width: 450px;
}
.header-bg {
  height: 200px;
  min-width: 490px;
  margin-bottom: -50px;
}
.base-grid-container {
  display: grid;
  align-items: stretch;
  grid-template-rows: min-content;
}
.form-col-container {
  @extend .base-grid-container;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
}
.weblink-container {
  @extend .base-grid-container;
  grid-column-gap: 10px;
  grid-row-gap: 24px;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
}
</style>
