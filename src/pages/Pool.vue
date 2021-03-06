<template>
  <!-- NOTE lifecycle hooks of the component will not be called -->
  <!-- TODO Page not found -->
  <q-page class="row justify-center q-gutter-md">
    <div
      class="col content column justify-start items-stretch content-stretch q-gutter-md"
    >
      <q-card class="card row justify-between content-start">
        <q-item class="col column">
          <q-item-section class="col row justify-left q-gutter-md">
            <q-avatar size="80px">
              <img
                v-if="pool.avatar"
                :src="pool.avatar"
                width="50px"
                alt="image"
              />
              <div v-else v-html="identicon" />
            </q-avatar>
            <div class="row q-gutter-md">
              <div class="text-h3">{{ pool.title }}</div>
              <status-badge :poolStatus="pool.status"></status-badge>
            </div>
          </q-item-section>
          <q-item-section>
            <p>
              {{ pool.tag_line }}
            </p>
          </q-item-section>
          <q-item-section>
            <div
              class="row justify-between items-center"
              v-if="pool.status === 'upcoming'"
            >
              <div>Opens in:</div>
              <status-countdown :deadline="pool.pool_open"></status-countdown>
            </div>
            <div
              class="row justify-between items-center"
              v-else-if="pool.status === 'open'"
            >
              <div>Closes in:</div>
              <status-countdown :deadline="pool.public_end"></status-countdown>
            </div>
          </q-item-section>

          <q-btn
            :to="{ name: 'joinpool', params: {} }"
            :color="pool.status === 'upcoming' ? 'grey-4' : 'primary'"
            label="Join pool"
            :disable="pool.status === 'upcoming'"
            v-if="pool.status !== 'closed'"
          />
        </q-item>
        <q-item class="col-6 row justify-center">
          <div class="col join-pane column q-gutter-md">
            <div class="row justify-between">
              <div>Hard cap:</div>
              <p>{{ pool.hard_cap }}</p>
            </div>
            <div class="row justify-between">
              <div>Soft cap:</div>
              <p>{{ pool.soft_cap }}</p>
            </div>
            <div class="row justify-between">
              <div>Swap ratio:</div>
              <p>1 {{ getBaseSymbol }} = {{ pool.swap_ratio.quantity }}</p>
            </div>
            <div class="row justify-between" v-if="pool.status === 'open'">
              <div>Participants:</div>
              <p>{{ pool.participants }}</p>
            </div>
            <div class="row justify-between" v-if="pool.status === 'open'">
              <div>Sale progress:</div>
              <p>{{ pool.progress }}</p>
            </div>
            <q-btn outline label="View on bloks.io" />
          </div>
        </q-item>
      </q-card>
      <div class="q-gutter-md">
        <q-btn
          v-bind:class="['tab-button', { active: currentTab === 'Details' }]"
          v-on:click="currentTab = 'Details'"
          >Details</q-btn
        >
        <q-btn
          v-bind:class="['tab-button', { active: currentTab === 'Overview' }]"
          v-on:click="currentTab = 'Overview'"
          >Overview</q-btn
        >
        <q-btn
          v-if="isAuthenticated"
          v-bind:class="[
            'tab-button',
            { active: currentTab === 'Allocations' }
          ]"
          v-on:click="currentTab = 'Allocations'"
          >Your Allocations</q-btn
        >
      </div>
      <q-card class="card">
        <keep-alive>
          <component
            v-bind:is="currentTabComponent"
            class="tab"
            :poolObject.sync="pool"
          ></component>
        </keep-alive>
      </q-card>

      <!-- <div>Params: {{ this.$route.params }} Query: {{ this.$route.query }}</div>
      <div v-if="isAuthenticated">{{ accountName }} is authenticated</div>
      <div v-else>Please login to do a transfer!</div> -->
    </div>
  </q-page>
</template>

// TODO reroute to this page if logged out
<script>
import statusCountdown from "src/components/poolinfo/status-countdown";
import statusBadge from "src/components/poolinfo/status-badge";
import tabOverview from "src/components/poolinfo/tab-overview.vue";
import tabAllocations from "src/components/poolinfo/tab-allocations.vue";
import tabDetails from "src/components/poolinfo/tab-details.vue";
import { mapGetters, mapActions } from "vuex";
import { toSvg } from "jdenticon";
import { date } from "quasar";

export default {
  components: {
    tabOverview,
    tabAllocations,
    tabDetails,
    statusCountdown,
    statusBadge
  },
  data() {
    return {
      //page info
      currentTab: "Details",

      //pool info
      poolID: Number(this.$route.params.id),
      pool: {
        title: "Loading",
        slug: "loading",
        soft_cap: "Loading",
        hard_cap: "Loading",
        swap_ratio: { quantity: "Loading", contract: "token.start" },
        type: "Fixed",
        access_type: "Private",
        progress: 0,
        participants: 0,
        avatar: "",
        tag_line: "Loading",
        description: "Loading",
        web_links: {},
        status: "loading",
        pool_open: "Loading", // TODO Reconsider best init
        private_end: "Loading",
        public_end: "Loading",
        white_listed_addresses: {},
        contract_address: "",
        token_address: "",
        maximum_allocation: "0",
        minimum_swap: "0",
        base_token: { sym: "8,Loading", contract: "btc.ptokens" }
      },
      polling: null
    };
  },
  computed: {
    ...mapGetters("account", ["isAuthenticated", "accountName"]),
    ...mapGetters("pools", ["getPoolByID"]),
    currentTabComponent: function() {
      return "tab-" + this.currentTab.toLowerCase();
    },
    progressToPercentage() {
      return (this.progress * 100).toFixed(2) + "%";
    },
    identicon() {
      return toSvg(this.poolID, 80);
    },
    getBaseSymbol() {
      try {
        let str = this.pool.base_token.sym;
        let idx = str.indexOf(",") + 1;
        return str.slice(idx);
      } catch (error) {
        return "Error";
      }
    }
  },
  methods: {
    ...mapActions("pools", ["getChainPoolByID","updatePoolStatus"]),
    toDate(timeStamp) {
      return date.formatDate(timeStamp, "DD MMMM YYYY, HH:mm UTC");
    },
    getPoolInfo() {
      this.pool = this.getPoolByID(this.poolID);
    },
    async loadChainData() {
      await this.getChainPoolByID(this.poolID);
    }
  },
  async mounted() {
    // get data from chain, write to store, get from store
    await this.loadChainData();
    this.updatePoolStatus(this.poolID);
    this.getPoolInfo();
    // Start polling
    this.polling = setInterval(() => {
      this.updatePoolStatus(this.poolID);
      this.getPoolInfo();
    }, 60000);
  },
  beforeDestroy() {
    clearInterval(this.polling);
  }
};
</script>

<style lang="scss" scoped>
.content {
  max-width: 1000px;
}
.join-pane {
  border: 1px solid gray;
  border-radius: $card-corner-radius;
  padding: 20px;
}
.tab-button {
  background-color: white;
}
.active {
  color: $primary;
}
</style>
