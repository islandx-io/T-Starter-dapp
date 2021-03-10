<template>
  <q-page>
    <q-form v-if="(this.accountName === this.pool.owner)" @submit="onSubmit" @reset="onReset" @publish="onPublish" class="q-gutter-md">
      <!-- tokens and adresses -->
      <div class="row">
        <div class="q-pa-md">
          <div class="q-gutter-sm">
            Pool type:
            <q-radio v-model="pool.pool_type" val="fixed" label="Fixed" />
          </div>
        </div>
      </div>
      <div class="row">
        <q-input
          color="primary"
          v-model="pool.swap_ratio.contract"
          label="Token contract address"
          lazy-rules
          :rules="[checkTokenContract]"
          debounce="1000"
        >
        </q-input>
      </div>
      <div class="row">
        <q-input
          color="primary"
          v-model="token_symbol"
          label="Token"
          lazy-rules
          :rules="[val => (!!val) || 'Must specify the token']"
        >
        </q-input>
        To
        <q-select
          v-model="base_token_symbol"
          :options="base_token_options.map(a => a.sym)"
          label="Standard"
        />
      </div>
      <!-- Swap ratio -->
      <h3>Swap ratio</h3>
      <div class="row">
        1 {{ base_token_symbol }} =
        <q-input
          color="primary"
          v-model="pool.swap_ratio.quantity"
          label="Ratio"
          lazy-rules
          :rules="[val => (!!val) || 'Must specify the token']"
        >
          {{
            toChainString(
              pool.swap_ratio.quantity,
              token_decimals,
              token_symbol
            )
          }}
        </q-input>
      </div>
      <!-- Quantities -->
      <h3>Quantities</h3>
      <div class="class row">
        <div>
          <q-input
            color="primary"
            v-model="pool.soft_cap"
            label="Soft cap"
            lazy-rules
            :rules="[
              val => (!!val) || 'Must specify the amount'
            ]"
          >
          </q-input>
          <q-input
            color="primary"
            v-model="pool.hard_cap"
            label="Hard cap"
            lazy-rules
            :rules="[
              val => (!!val) || 'Must specify the amount'
            ]"
          >
          </q-input>
        </div>
        <div>
          <q-input
            color="primary"
            v-model="pool.minimum_swap"
            label="minimum swap amount"
            lazy-rules
            :rules="[
              val => (!!val) || 'Must specify the amount'
            ]"
          >
          </q-input>
          <q-input
            color="primary"
            v-model="pool.maximum_allocation"
            label="maximum swap per wallet"
            lazy-rules
            :rules="[
              val => (!!val) || 'Must specify the amount'
            ]"
          >
          </q-input>
        </div>
      </div>

      <h3>Dates</h3>
      <!-- Date input -->
      <div class="row">
        <q-input filled v-model="pool.pool_open">
          <template v-slot:prepend>
            <q-icon name="event" class="cursor-pointer">
              <q-popup-proxy transition-show="scale" transition-hide="scale">
                <q-date v-model="pool.pool_open" mask="YYYY-MM-DD HH:mm">
                  <div class="row items-center justify-end">
                    <q-btn v-close-popup label="Close" color="primary" flat />
                  </div>
                </q-date>
              </q-popup-proxy>
            </q-icon>
          </template>
          <template v-slot:append>
            <q-icon name="access_time" class="cursor-pointer">
              <q-popup-proxy transition-show="scale" transition-hide="scale">
                <q-time
                  v-model="pool.pool_open"
                  mask="YYYY-MM-DD HH:mm"
                  format24h
                >
                  <div class="row items-center justify-end">
                    <q-btn v-close-popup label="Close" color="primary" flat />
                  </div>
                </q-time>
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>
        Sale start
      </div>
      <!-- Date input -->
      <div class="row">
        <q-input filled v-model="pool.private_end">
          <template v-slot:prepend>
            <q-icon name="event" class="cursor-pointer">
              <q-popup-proxy transition-show="scale" transition-hide="scale">
                <q-date v-model="pool.private_end" mask="YYYY-MM-DD HH:mm">
                  <div class="row items-center justify-end">
                    <q-btn v-close-popup label="Close" color="primary" flat />
                  </div>
                </q-date>
              </q-popup-proxy>
            </q-icon>
          </template>
          <template v-slot:append>
            <q-icon name="access_time" class="cursor-pointer">
              <q-popup-proxy transition-show="scale" transition-hide="scale">
                <q-time
                  v-model="pool.private_end"
                  mask="YYYY-MM-DD HH:mm"
                  format24h
                >
                  <div class="row items-center justify-end">
                    <q-btn v-close-popup label="Close" color="primary" flat />
                  </div>
                </q-time>
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>
        Private sale end
      </div>
      <!-- Date input -->
      <div class="row">
        <q-input filled v-model="pool.public_end">
          <template v-slot:prepend>
            <q-icon name="event" class="cursor-pointer">
              <q-popup-proxy transition-show="scale" transition-hide="scale">
                <q-date v-model="pool.public_end" mask="YYYY-MM-DD HH:mm">
                  <div class="row items-center justify-end">
                    <q-btn v-close-popup label="Close" color="primary" flat />
                  </div>
                </q-date>
              </q-popup-proxy>
            </q-icon>
          </template>
          <template v-slot:append>
            <q-icon name="access_time" class="cursor-pointer">
              <q-popup-proxy transition-show="scale" transition-hide="scale">
                <q-time
                  v-model="pool.public_end"
                  mask="YYYY-MM-DD HH:mm"
                  format24h
                >
                  <div class="row items-center justify-end">
                    <q-btn v-close-popup label="Close" color="primary" flat />
                  </div>
                </q-time>
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>
        Public sale end
        <!-- {{ toUnixTimestamp(date) }} -->
      </div>

      <!-- Pool name, image and descriptions -->
      <div class=" row">
        <!-- Title -->
        <q-input
          color="primary"
          v-model="pool.title"
          label="Title"
          lazy-rules
          :rules="[val => (val && val.length > 1) || 'Must specify the title']"
        >
        </q-input>
        <!-- Image link -->
        <q-input
          color="primary"
          v-model="pool.avatar"
          label="Avatar image link"
          lazy-rules
          :rules="[val => (val && val.length > 1) || 'Must specify the image link']"
        >
        </q-input>
        <q-avatar size="50px">
          <img :src="pool.avatar" width="20px" alt="image" />
        </q-avatar>
      </div>
      <div class="q-pa-md" style="max-width: 500px">
        <!-- tag-line -->
        <q-input
          v-model="pool.tag_line"
          filled
          autogrow
          label="Tag line"
          lazy-rules
          :rules="[
            val => (val && val.length > 1 && val.length < 230) || 'Must specify'
          ]"
        />
      </div>
      <div class="q-pa-md" style="max-width: 500px">
        <!-- description -->
        <q-input
          v-model="pool.description"
          filled
          autogrow
          label="Description"
          lazy-rules
          :rules="[val => (val && val.length > 1) || 'Must specify']"
        />
      </div>

      <!-- web links -->
      <h3>Websites</h3>
      <div>
        <!-- <link-field
          v-for="(link, link_index) in pool.web_links"
          :key="link_index"
          :link.sync="link"
          :index.sync="link_index"
          v-on:deleteThisLink="deleteThisLink"
        ></link-field>
        <q-btn round color="primary" icon="add" @click="addLinkField" /> -->

        <div class="row">
          <q-input
            outlined
            v-model="webLinks[0].value"
            :label="capitalize(webLinks[0].key)"
          />
          <q-input
            outlined
            v-model="webLinks[1].value"
            :label="capitalize(webLinks[1].key)"
          />
          <q-input
            outlined
            v-model="webLinks[2].value"
            :label="capitalize(webLinks[2].key)"
          />
          <q-input
            outlined
            v-model="webLinks[3].value"
            :label="capitalize(webLinks[3].key)"
          />
          <q-input
            outlined
            v-model="webLinks[4].value"
            :label="capitalize(webLinks[4].key)"
          />
          <q-input
            outlined
            v-model="webLinks[5].value"
            :label="capitalize(webLinks[5].key)"
          />
        </div>
      </div>

      <!-- Whitelist -->
      <div class="q-pa-md" style="max-width: 500px">
        <q-input
          v-model="pool.whitelist"
          filled
          autogrow
          label="Some whitelist thing"
        />
      </div>

      <!-- T's and C's -->
      <q-toggle v-model="accept" label="I accept the license and terms" />

      <!-- Submit -->
      <div>
        <q-btn label="Update" type="submit" color="primary" />
        <q-btn label="Publish" @click="onPublish" color="primary" />
        <q-btn
          label="Reset"
          type="reset"
          color="primary"
          flat
          class="q-ml-sm"
        />
      </div>
    </q-form>

    <div v-else> You are not the owner of this pool</div>
  </q-page>
</template>

<script>
import { date } from "quasar";
// import LinkField from "src/components/poolcreation/link-field.vue";
import { mapGetters, mapActions } from "vuex";

export default {
  // components: { LinkField },
  data() {
    return {
      poolID: Number(this.$route.params.id),
      pool: this.$defaultPoolInfo,

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
    toDateString(timestamp){
      return date.formatDate(timestamp, 'YYYY-MM-DD HH:mm')
    },
    toChainString(number, decimals, symbol) {
      return (
        String(parseFloat(number).toFixed(decimals)) + String(" " + symbol)
      );
    },
    getPoolInfo() {
      this.pool = JSON.parse(JSON.stringify(this.getPoolByID(this.poolID))); //make deep copy
      this.getTokenSymbolFromPool();
      // pool to numbers
      this.pool.swap_ratio.quantity = this.$chainToQty(this.pool.swap_ratio.quantity);
      this.pool.soft_cap = this.$chainToQty(this.pool.soft_cap);
      this.pool.hard_cap = this.$chainToQty(this.pool.hard_cap);
      this.pool.minimum_swap = this.$chainToQty(this.pool.minimum_swap);
      this.pool.maximum_allocation = this.$chainToQty(this.pool.maximum_allocation);

      this.populateWebLinks();
      this.BaseTokenFromChain();      

      this.pool.pool_open = this.toDateString(this.pool.pool_open)
      this.pool.private_end = this.toDateString(this.pool.private_end)
      this.pool.public_end = this.toDateString(this.pool.public_end)

    },
    getTokenSymbolFromPool() {
      let idx = this.pool.swap_ratio.quantity.indexOf(' ')+1
      this.token_symbol = this.pool.swap_ratio.quantity.slice(idx)
    },
    BaseTokenFromChain() {
      let idx = this.pool.base_token.sym.indexOf(',')+1
      this.base_token_symbol = this.pool.base_token.sym.slice(idx)
    },
    populateWebLinks() {
      this.webLinks.find(el => el.key === "website").value = this.pool.web_links.filter(el => el.key === "website").map(a => a.value)
      this.webLinks.find(el => el.key === "github").value = this.pool.web_links.filter(el => el.key === "github").map(a => a.value)
      this.webLinks.find(el => el.key === "medium").value = this.pool.web_links.filter(el => el.key === "medium").map(a => a.value)
      this.webLinks.find(el => el.key === "telegram").value = this.pool.web_links.filter(el => el.key === "telegram").map(a => a.value)
      this.webLinks.find(el => el.key === "twitter").value = this.pool.web_links.filter(el => el.key === "twitter").map(a => a.value)
      this.webLinks.find(el => el.key === "whitepaper").value = this.pool.web_links.filter(el => el.key === "whitepaper").map(a => a.value)
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
      console.log(this.webLinks.filter(el => el.value != ""))
      this.cleanedWebLinks = this.webLinks.filter(el => el.value != "");
      console.log(this.cleanedWebLinks)
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
        },
      ];
      const transaction = await this.$store.$api.signTransaction(actions);
    },
    async onSubmit() {
      // TODO Check and clean links not empty
      // TODO check if have permission to create pool. e.g. fuzzytestnet
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
    onReset() {},

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

<style scoped>
</style>
