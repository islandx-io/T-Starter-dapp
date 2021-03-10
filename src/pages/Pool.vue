<template>
  <!-- NOTE lifecycle hooks of the component will not be called -->
  <!-- TODO Page not found -->
  <q-page>
    <section class="header-bg" />
    <div class="body-container">
      <q-card class="card row justify-between content-start q-mb-lg">
        <div class="join-pane col column">
          <q-item>
            <q-item-section top class="col-shrink">
              <q-avatar size="80px">
                <img
                  v-if="pool.avatar"
                  :src="pool.avatar"
                  width="100px"
                  alt="image"
                />
                <div v-else v-html="identicon" />
              </q-avatar>
            </q-item-section>
            <q-item-section top class="q-pl-sm">
              <div class="row justify-between content-start items-start">
                <div>
                  <div class="text-h3 q-pb-md q-pt-sm">{{ pool.title }}</div>
                  <p>
                    Contract: <a href="#">{{ pool.swap_ratio.contract }}</a>
                  </p>
                </div>
                <status-badge :poolStatus="pool.pool_status"></status-badge>
              </div>
            </q-item-section>
          </q-item>
          <q-item>
            <p>
              {{ pool.tag_line }}
            </p>
          </q-item>
          <q-item>
            <div
              class="col row justify-between items-center"
              v-if="pool.pool_status === 'upcoming'"
            >
              <div>Opens in:</div>
              <status-countdown :deadline="pool.pool_open"></status-countdown>
            </div>
            <div
              class="col row justify-between items-center"
              v-else-if="pool.pool_status === 'open'"
            >
              <div>Closes in:</div>
              <status-countdown :deadline="pool.public_end"></status-countdown>
            </div>
          </q-item>
          <q-item>
            <q-btn
              class="col"
              :to="{ name: 'joinpool', params: {} }"
              :color="pool.pool_status === 'upcoming' ? 'grey-4' : 'primary'"
              label="Join pool"
              :disable="pool.pool_status === 'upcoming'"
              v-if="pool.pool_status !== 'closed'"
            />
          </q-item>
        </div>
        <q-item class="token-info col">
          <div class="border col column ">
            <div class="row justify-between">
              <div>Hard cap:</div>
              <p>{{ pool.hard_cap }}</p>
              <!-- TODO Format decimal places -->
            </div>
            <div class="row justify-between">
              <div>Soft cap:</div>
              <p>{{ pool.soft_cap }}</p>
            </div>
            <div class="row justify-between">
              <div>Swap ratio:</div>
              <p>1 {{ getBaseSymbol }} = {{ pool.swap_ratio.quantity }}</p>
            </div>
            <div class="row justify-between" v-if="pool.pool_status === 'open'">
              <div>Participants:</div>
              <p>{{ pool.participants }}</p>
            </div>
            <div class="row justify-between" v-if="pool.pool_status === 'open'">
              <div>Sale progress:</div>
              <p>{{ pool.progress }}</p>
            </div>
            <q-btn outline label="View on bloks.io" />
          </div>
        </q-item>
      </q-card>
      <q-card class="body-container card">
        <q-tabs
          v-model="tab"
          dense
          class="text-grey"
          active-color="primary"
          indicator-color="primary"
          align="left"
          narrow-indicator
        >
          <q-tab name="details" label="DETAILS"></q-tab>
          <q-tab name="overview" label="OVERVIEW"></q-tab>
          <q-tab name="allocations" label="YOUR ALLOCATIONS"></q-tab>
        </q-tabs>

        <q-separator></q-separator>

        <q-tab-panels
          v-model="tab"
          animated
          swipeable
          class="tab-panel-container"
        >
          <q-tab-panel name="details" @mousedown.stop>
            <tab-details :pool="pool" />
          </q-tab-panel>
          <q-tab-panel name="overview" @mousedown.stop>
            <tab-overview :pool="pool" />
          </q-tab-panel>

          <q-tab-panel name="allocations"> </q-tab-panel>
        </q-tab-panels>
        <!-- <section class="q-py-md q-gutter-md">
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
        > -->
      </q-card>
      <!-- <q-card class="card">
        <keep-alive>
          <component
            v-bind:is="currentTabComponent"
            class="tab"
            :poolObject.sync="pool"
          ></component>
        </keep-alive>
      </q-card> -->
    </div>

    <!-- <div>Params: {{ this.$route.params }} Query: {{ this.$route.query }}</div>
      <div v-if="isAuthenticated">{{ accountName }} is authenticated</div>
      <div v-else>Please login to do a transfer!</div> -->
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
    // tabAllocations,
    tabDetails,
    statusCountdown,
    statusBadge
  },
  data() {
    return {
      //page info
      tab: "details",
      // currentTab: "Details",

      //pool info
      poolID: Number(this.$route.params.id),
      pool: this.$defaultPoolInfo,
      polling: null
    };
  },
  computed: {
    ...mapGetters("account", ["isAuthenticated", "accountName"]),
    ...mapGetters("pools", ["getPoolByID"]),
    // currentTabComponent: function() {
    //   return "tab-" + this.currentTab.toLowerCase();
    // },
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
    ...mapActions("pools", ["getChainPoolByID", "updatePoolSettings"]),
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
    this.updatePoolSettings(this.poolID);
    this.getPoolInfo();
    // Start polling
    this.polling = setInterval(() => {
      this.updatePoolSettings(this.poolID);
      this.getPoolInfo();
    }, 60000);
  },
  beforeDestroy() {
    clearInterval(this.polling);
  }
};
</script>

<style lang="scss" scoped>
.header-bg {
  height: 120px;
  margin-bottom: -50px;
  background-position-y: 50%;
}
.join-pane {
  min-width: 350px;
}
.token-info {
  min-width: 400px;
}
.token-info .border {
  border: 1px solid gray;
  border-radius: $card-corner-radius;
  padding: 20px;
  margin: 0;
}
.tab-button {
  background-color: white;
}
.active {
  color: $primary;
}
</style>
