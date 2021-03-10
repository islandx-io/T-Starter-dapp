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
                    Contract:
                    <a :href="contractURL">{{ pool.swap_ratio.contract }}</a>
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
          <div class="border col column justify-between">
            <div class="row justify-between">
              <h6>Hard cap:</h6>
              <h5>{{ this.$chainStrReformat(pool.hard_cap, 2) }}</h5>
            </div>
            <div class="row justify-between">
              <h6>Soft cap:</h6>
              <h5>{{ this.$chainStrReformat(pool.soft_cap, 2) }}</h5>
            </div>
            <div class="row justify-between">
              <h6>Swap ratio:</h6>
              <h5>
                {{ swapRatio }}
              </h5>
            </div>
            <div class="row justify-between">
              <h6>Participants:</h6>
              <h5>{{ pool.participants }}</h5>
            </div>
            <div class="row justify-between">
              <h6>Sale progress:</h6>
              <h5>{{ progressLabel }}</h5>
            </div>
            <status-progress :progress="pool.progress" />
          </div>
        </q-item>

        <q-inner-loading :showing="pool.title === 'Loading'">
          <q-spinner-puff size="50px" color="primary" />
        </q-inner-loading>
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

          <q-tab-panel name="allocations" @mousedown.stop>
            <tab-allocations :pool="pool"
          /></q-tab-panel>
        </q-tab-panels>

        <q-inner-loading :showing="pool.title === 'Loading'">
          <q-spinner-puff size="50px" color="primary" />
        </q-inner-loading>
      </q-card>
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
import statusProgress from "src/components/poolinfo/status-progress";
import { mapGetters, mapActions } from "vuex";
import { toSvg } from "jdenticon";
import { date } from "quasar";

export default {
  components: {
    tabOverview,
    tabAllocations,
    tabDetails,
    statusCountdown,
    statusBadge,
    statusProgress
  },
  data() {
    return {
      tab: "details",
      poolID: Number(this.$route.params.id),
      pool: this.$defaultPoolInfo,
      polling: null
    };
  },
  computed: {
    ...mapGetters("account", ["isAuthenticated", "accountName"]),
    ...mapGetters("pools", ["getPoolByID"]),
    progressToPercentage() {
      return (this.progress * 100).toFixed(2) + "%";
    },
    identicon() {
      return toSvg(this.poolID, 80);
    },
    contractURL() {
      let contractName = this.pool.swap_ratio.contract;
      if (contractName === "Loading" || contractName === "") return "#";
      else {
        try {
          return `${process.env.NETWORK_EXPLORER}/account/${contractName}`;
        } catch (error) {
          return "Error";
        }
      }
    },
    swapRatio() {
      try {
        if (this.pool.swap_ratio.quantity === "Loading") return "Loading";
        else {
          let baseSym = this.pool.base_token.sym.split(",")[1];
          let [quantity, sym] = this.pool.swap_ratio.quantity.split(" ");
          return `1 ${baseSym} = ${parseFloat(quantity).toFixed(0)} ${sym}`;
        }
      } catch (error) {
        return "Error";
      }
    },
    progressLabel() {
      if (this.pool.total_raise === "Loading") return "Loading";
      else {
        let totalRaise = this.$chainToQty(this.pool.total_raise, 0);
        let hardCap = this.$chainToQty(this.pool.hard_cap, 0);
        return `${totalRaise} / ${hardCap}`;
      }
    }
  },
  methods: {
    ...mapActions("pools", ["getChainPoolByID"]),
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
    this.getPoolInfo();
    // Start polling
    this.polling = setInterval(() => {
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
  min-width: 180px;
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
a {
  text-decoration: none;
  color: $primary;
}
</style>
