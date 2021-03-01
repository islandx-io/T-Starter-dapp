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
      <div class="row">
        <div class="q-gutter-y-md column" style="max-width: 300px">
          <q-input
            color="primary"
            v-model="owner"
            label="Owner address"
            lazy-rules
            :rules="[val => (val && val.length > 0) || 'Please type something']"
          >
          </q-input>
        </div>
        <div class="q-pa-md">
          <div class="q-gutter-sm">
            Pool type:
            <q-radio v-model="pool_type" val="Fixed" label="Fixed" />
          </div>
        </div>
      </div>
      <div class="row">
        <q-input
          color="primary"
          v-model="swap_ratio.contract"
          label="Token contract address"
        >
        </q-input>
      </div>
      <div class="row">
        <q-input color="primary" v-model="token_shorthand" label="Token">
        </q-input>
        To
        <q-select
          v-model="base_token_name"
          :options="base_token_options"
          label="Standard"
        />
      </div>
      <h3>Swap ratio</h3>
      <div class="row">
        1 {{ base_token_name }} =
        <q-input color="primary" v-model="swap_ratio.quantity" label="Ratio">
        </q-input>
      </div>
      <h3>Quantities</h3>
      <div class="class row">
        <div>
          <q-input color="primary" v-model="soft_cap" label="Soft cap">
          </q-input>
          <q-input color="primary" v-model="hard_cap" label="Hard cap">
          </q-input>
        </div>
        <div>
          <q-input
            color="primary"
            v-model="minimum_swap"
            label="minimum swap amount"
          >
          </q-input>
          <q-input
            color="primary"
            v-model="maximum_allocation"
            label="maximum swap per wallet"
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
      <div class=" row">
        <q-input color="primary" v-model="title" label="Title"> </q-input>
        <q-input color="primary" v-model="avatar" label="Avatar image link">
        </q-input>
        <q-avatar size="50px">
          <img :src="avatar" width="20px" alt="image" />
        </q-avatar>
      </div>
      <div class="q-pa-md" style="max-width: 500px">
        <q-input v-model="tag_line" filled autogrow label="Tag line" />
      </div>
      <div class="q-pa-md" style="max-width: 500px">
        <q-input v-model="description" filled autogrow label="Description" />
      </div>

      <!-- web links -->
      <div>
        <link-field
          v-for="(link, link_index) in web_links"
          :key="link_index"
          :link.sync="link"
          :index.sync="link_index"
          v-on:deleteThisLink="deleteThisLink"
        ></link-field>
        <q-btn round color="primary" icon="add" @click="addLinkField" />
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

      <q-toggle v-model="accept" label="I accept the license and terms" />

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
import _ from "lodash";
import LinkField from "src/components/poolcreation/link-field.vue";
Slug.defaults.mode = "rfc3986";

export default {
  components: { LinkField },
  data() {
    return {
      poolName: "",
      slug: "",

      base_token_name: "PETH",
      base_token_options: ["PETH", "PBTC", "USDT", "TLOS"],
      token_shorthand: "START",
      date: date.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss"),
      accept: false,
      link_index: -1,

      //Static
      owner: "",
      pool_type: "Fixed",
      base_token: { sym: "8,PBTC", contract: "btc.ptokens" },
      swap_ratio: {
        quantity: "5000000.0000 START",
        contract: "token.start"
      },
      soft_cap: "5.00000000 PBTC",
      hard_cap: "50.00000000 PBTC",
      minimum_swap: "0.00100000 PBTC",
      maximum_allocation: "2.50000000 PBTC",
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
      // web_links: [
      //   {
      //     key: "github",
      //     value: "https://github.com/orgs/T-Starter"
      //   },
      //   {
      //     key: "medium",
      //     value: "https://t-starter.medium.com"
      //   },
      //   {
      //     key: "telegram",
      //     value: "https://t.me/tstarterio"
      //   },
      //   {
      //     key: "twitter",
      //     value: "https://twitter.com/T_StarterToken"
      //   }
      // ],
      web_links: [
        {
          key: "",
          value: ""
        }
      ],
      whitelist: ["rory", "janet"],

      //Dynamic
      remaining_offer: "3501234.5670 START",
      total_raise: "14.98765433 PBTC",
      participants: 72
    };
  },
  computed: {},

  methods: {
    convertName: function() {
      return Slug(this.poolName);
    },
    toUnixTimestamp(timeStamp) {
      return date.formatDate(timeStamp, "X");
    },
    onSubmit() {
      if (this.accept !== true) {
        this.$q.notify({
          color: "red-5",
          textColor: "white",
          icon: "warning",
          message: "You need to accept the license and terms first"
        });
      } else {
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
      // TODO check fields first
      this.web_links.push({ key: "", value: "" });
    },
    deleteThisLink(index) {
      console.log("Delete key:" + index);
      this.$delete(this.web_links, index);
      console.log(this.web_links);
    }
  },

  watch: {
    poolName: _.debounce(function() {
      this.slug = this.convertName();
    }, 500) // debounce not to cause lag // TODO use quasar's debouce. create API to check if unqiue & custom slug?
  }
};
</script>

<style scoped>
.slug-widget {
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
}
</style>
