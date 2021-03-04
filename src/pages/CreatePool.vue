<template>
  <q-page>
    <!-- <q-input outlined v-model="poolName" label="Pool Name" />

    <div class="slug-widget">
      <div class="icon-wrapper wrapper">
        <i class="fa fa-link"></i>
      </div>

      <div class="url-wrapper wrapper">
        <span class="root-url">http://tstarter.io</span>
        <span class="subdirectory-url">/pools/</span>
        <span class="slug" v-show="slug">{{ slug }}</span>
      </div>

      <div class="button-wrapper wrapper">
        <button class="button is-small">Edit</button>
      </div>
    </div> -->
    <q-form @submit="onSubmit" @reset="onReset" class="q-gutter-md">
      <!-- tokens and adresses -->
      <div class="row">
        <div class="q-pa-md">
          <div class="q-gutter-sm">
            Pool type:
            <q-radio v-model="pool_type" val="fixed" label="Fixed" />
          </div>
        </div>
      </div>
      <div class="row">
        <q-input
          color="primary"
          v-model="swap_ratio.contract"
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
          :rules="[val => (val && val.length > 1) || 'Must specify the token']"
        >
        </q-input>
        To
        <q-select
          v-model="base_token_symbol"
          :options="base_token_options.map(a => a.sym)"
          label="Standard"
        />
        {{ swapRatio }}
      </div>
      <!-- Swap ratio -->
      <h3>Swap ratio</h3>
      <div class="row">
        1 {{ base_token_symbol }} =
        <q-input
          color="primary"
          v-model="swap_ratio.quantity"
          label="Ratio"
          lazy-rules
          :rules="[val => (val && val.length > 1) || 'Must specify the token']"
        >
          {{ toChainString(swap_ratio.quantity, token_decimals, token_symbol) }}
        </q-input>
      </div>
      <!-- Quantities -->
      <h3>Quantities</h3>
      <div class="class row">
        <div>
          <q-input
            color="primary"
            v-model="soft_cap"
            label="Soft cap"
            lazy-rules
            :rules="[
              val => (val && val.length > 1) || 'Must specify the amount'
            ]"
          >
          </q-input>
          <q-input
            color="primary"
            v-model="hard_cap"
            label="Hard cap"
            lazy-rules
            :rules="[
              val => (val && val.length > 1) || 'Must specify the amount'
            ]"
          >
          </q-input>
        </div>
        <div>
          <q-input
            color="primary"
            v-model="minimum_swap"
            label="minimum swap amount"
            lazy-rules
            :rules="[
              val => (val && val.length > 1) || 'Must specify the amount'
            ]"
          >
          </q-input>
          <q-input
            color="primary"
            v-model="maximum_allocation"
            label="maximum swap per wallet"
            lazy-rules
            :rules="[
              val => (val && val.length > 1) || 'Must specify the amount'
            ]"
          >
          </q-input>
        </div>
      </div>

      <h3>Dates</h3>
      <!-- Date input -->
      <div class="row">
        <q-input filled v-model="pool_open">
          <template v-slot:prepend>
            <q-icon name="event" class="cursor-pointer">
              <q-popup-proxy transition-show="scale" transition-hide="scale">
                <q-date v-model="pool_open" mask="YYYY-MM-DD HH:mm">
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
                <q-time v-model="pool_open" mask="YYYY-MM-DD HH:mm" format24h>
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
        <q-input filled v-model="private_end">
          <template v-slot:prepend>
            <q-icon name="event" class="cursor-pointer">
              <q-popup-proxy transition-show="scale" transition-hide="scale">
                <q-date v-model="private_end" mask="YYYY-MM-DD HH:mm">
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
                <q-time v-model="private_end" mask="YYYY-MM-DD HH:mm" format24h>
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
        <q-input filled v-model="public_end">
          <template v-slot:prepend>
            <q-icon name="event" class="cursor-pointer">
              <q-popup-proxy transition-show="scale" transition-hide="scale">
                <q-date v-model="public_end" mask="YYYY-MM-DD HH:mm">
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
                <q-time v-model="public_end" mask="YYYY-MM-DD HH:mm" format24h>
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
          v-model="title"
          label="Title"
          lazy-rules
          :rules="[val => (val && val.length > 1) || 'Must specify the amount']"
        >
        </q-input>
        <!-- Image link -->
        <q-input
          color="primary"
          v-model="avatar"
          label="Avatar image link"
          lazy-rules
          :rules="[val => (val && val.length > 1) || 'Must specify the amount']"
        >
        </q-input>
        <q-avatar size="50px">
          <img :src="avatar" width="20px" alt="image" />
        </q-avatar>
      </div>
      <div class="q-pa-md" style="max-width: 500px">
        <!-- tag-line -->
        <q-input
          v-model="tag_line"
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
          v-model="description"
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
          v-for="(link, link_index) in web_links"
          :key="link_index"
          :link.sync="link"
          :index.sync="link_index"
          v-on:deleteThisLink="deleteThisLink"
        ></link-field>
        <q-btn round color="primary" icon="add" @click="addLinkField" /> -->

        <div class="row">
          <q-input
            outlined
            v-model="web_links[0].value"
            :label="capitalize(web_links[0].key)"
          />
          <q-input
            outlined
            v-model="web_links[1].value"
            :label="capitalize(web_links[1].key)"
          />
          <q-input
            outlined
            v-model="web_links[2].value"
            :label="capitalize(web_links[2].key)"
          />
          <q-input
            outlined
            v-model="web_links[3].value"
            :label="capitalize(web_links[3].key)"
          />
          <q-input
            outlined
            v-model="web_links[4].value"
            :label="capitalize(web_links[4].key)"
          />
          <q-input
            outlined
            v-model="web_links[5].value"
            :label="capitalize(web_links[5].key)"
          />
        </div>
      </div>

      <!-- Whitelist -->
      <div class="q-pa-md" style="max-width: 500px">
        <q-input
          v-model="whitelist"
          filled
          autogrow
          label="Some whitelist thing"
        />
      </div>

      <!-- T's and C's -->
      <q-toggle v-model="accept" label="I accept the license and terms" />

      <!-- Submit -->
      <div>
        <q-btn label="Submit" type="submit" color="primary" />
        <q-btn
          label="Reset"
          type="reset"
          color="primary"
          flat
          class="q-ml-sm"
        />
      </div>
    </q-form>
  </q-page>
</template>

<script>
import { date } from "quasar";
import Slug from "slug";
// import _ from "lodash";
import LinkField from "src/components/poolcreation/link-field.vue";
import { mapGetters, mapActions } from "vuex";
import { accountName } from "src/store/account/getters";
Slug.defaults.mode = "rfc3986";

export default {
  // components: { LinkField },
  data() {
    return {
      // poolName: "",
      // slug: "",

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
      token_symbol: "STAR",
      token_decimals: 1,
      date: date.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss"),
      accept: false,
      link_index: -1,
      contract_creation_date: date.formatDate(
        Date.now(),
        "YYYY-MM-DDTHH:mm:ss"
      ), // TODO add to contract?

      //Static
      // owner: "",
      pool_type: "fixed",
      // base_token: { sym: "8,PBTC", contract: "btc.ptokens" },
      swap_ratio: {
        quantity: "5000000",
        contract: "token.start"
      },
      soft_cap: "5.0",
      hard_cap: "50.0",
      minimum_swap: "0.001",
      maximum_allocation: "2.50000",
      pool_open: "2021-03-01T17:00:00",
      private_end: "2021-03-02T05:00:00",
      public_end: "2021-03-02T17:00:00",
      title: "T-Starter",
      avatar:
        "https://raw.githubusercontent.com/T-Starter/T-Starter-images/master/icons/STAR.png",
      tag_line:
        "T-Starter is a cross chain token swap platform created to help projects launch on the Telos blockchain",
      description:
        "T-Starter is the place to discover and back new projects coming to Telos. It offers users the oppotunity to become part of those projects very early in their life.",
      web_links: [
        {
          key: "website",
          value: "https://tstarter.io"
        },
        {
          key: "github",
          value: "https://github.com/orgs/T-Starter"
        },
        {
          key: "medium",
          value: "https://t-starter.medium.com"
        },
        {
          key: "telegram",
          value: "https://t.me/tstarterio"
        },
        {
          key: "twitter",
          value: "https://twitter.com/T_StarterToken"
        },
        {
          key: "whitepaper",
          value: "https://whitepaper.com"
        }
      ],
      // web_links: [
      //   {
      //     key: "",
      //     value: ""
      //   }
      // ],
      whitelist: ["rory", "janet"],

      //Dynamic
      remaining_offer: "3501234.5670 START",
      total_raise: "0 PBTC",
      participants: 0
    };
  },
  computed: {
    ...mapGetters("account", ["isAuthenticated", "accountName"]),
    // owner: accountName,
    selected_base_token() {
      return this.base_token_options.find(
        el => el.sym === this.base_token_symbol
      );
    },
    getBaseToken() {
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
          this.swap_ratio.quantity,
          this.token_decimals,
          this.token_symbol
        ),
        contract: this.swap_ratio.contract
      };
    }
  },

  methods: {
    ...mapActions("pools", ["getCurrency", "getTokenPrecision"]),
    // convertName: function() {
    //   return Slug(this.poolName);
    // },
    capitalize(str) {
      return str.charAt(0).toUpperCase() + str.slice(1);
    },
    toUnixTimestamp(timeStamp) {
      return new Date(timeStamp).valueOf();
    },
    toChainString(number, decimals, symbol) {
      console.log(
        String(parseFloat(number).toFixed(decimals)) + String(" " + symbol)
      );
      return (
        String(parseFloat(number).toFixed(decimals)) + String(" " + symbol)
      );
    },
    async checkTokenContract(val) {
      // simulating a delay
      let payload = { address: val, token_symbol: this.token_symbol };
      this.token_decimals = await this.getTokenPrecision(payload);
      console.log(this.token_decimals);

      // return new Promise((resolve, reject) => {
      //   setTimeout(() => {
      //     // call
      //     //  resolve(true)
      //     //     --> content is valid
      //     //  resolve(false)
      //     //     --> content is NOT valid, no error message
      //     //  resolve(error_message)
      //     //     --> content is NOT valid, we have error message
      //     resolve(!!val || "* Required");

      //     // calling reject(...) will also mark the input
      //     // as having an error, but there will not be any
      //     // error message displayed below the input
      //     // (only in browser console)
      //   }, 1000);
      // });
    },
    checkLinks() {},
    async createNewPool() {
      const actions = [
        {
          account: process.env.CONTRACT_ADDRESS,
          name: "newpool",
          data: {
            id: 9,
            owner: this.accountName,
            pool_type: this.pool_type
          }
        }
      ];
      const transaction = await this.$store.$api.signTransaction(actions);
    },
    async updateNewPool() {
      const actions = [
        {
          account: process.env.CONTRACT_ADDRESS,
          name: "updatepool",
          data: {
            id: 9,
            // owner: this.accountName,
            // pool_type: this.pool_type,
            title: this.title,
            avatar: this.avatar,
            tag_line: this.tag_line,
            description: this.description,
            // status: "draft",
            base_token: this.getBaseToken,
            swap_ratio: this.swapRatio,
            soft_cap: this.toChainString(
              this.soft_cap,
              this.selected_base_token.decimals,
              this.selected_base_token.sym
            ),
            hard_cap: this.toChainString(
              this.hard_cap,
              this.selected_base_token.decimals,
              this.selected_base_token.sym
            ),
            minimum_swap: this.toChainString(
              this.minimum_swap,
              this.selected_base_token.decimals,
              this.selected_base_token.sym
            ),
            maximum_allocation: this.toChainString(
              this.maximum_allocation,
              this.selected_base_token.decimals,
              this.selected_base_token.sym
            ),
            remaining_offer: "3501234.5670 START",
            total_raise: "14.98765433 PBTC",
            participants: 0,
            pool_open: this.pool_open,
            private_end: this.private_end,
            public_end: this.public_end,
            whitelist: this.whitelist,
            web_links: this.web_links
          }
        }
      ];
      const transaction = await this.$store.$api.signTransaction(actions);
    },
    onSubmit() {
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
        // this.createNewPool();
        this.updateNewPool();
        this.$q.notify({
          color: "green-4",
          textColor: "white",
          icon: "cloud_done",
          message: "Submitted"
        });
      }
    },

    onReset() {},

    addLinkField() {
      console.log(this.web_links);
      this.web_links.push({ key: "", value: "" });
    },
    deleteThisLink(index) {
      console.log("Delete key:" + index);
      this.$delete(this.web_links, index);
      console.log(this.web_links);
    }
  },

  watch: {
    // poolName: _.debounce(function() {
    //   this.slug = this.convertName();
    // }, 500) // debounce not to cause lag // TODO use quasar's debouce. create API to check if unqiue & custom slug?
  }
};
</script>

<style scoped>
/* .slug-widget {
  display: flex;
  justify-content: flex-start;
  align-items: center;
}
.wrapper {
  margin-left: 8px;
}
.slug {
  background-color: rgb(209, 132, 16);
  padding: 3px 5px;
} */
</style>
