<template>
  <!-- NOTE lifecycle hooks of the component will not be called -->
  <!-- TODO Page not found -->
  <q-page>
    <section class="header-bg" />
    <div class="body-container">
      <q-card class="row justify-between content-start q-mb-lg">
        <div class="join-pane col-xs-12 col-sm-7 ">
          <q-item>
            <q-item-section top class="col-shrink">
              <token-avatar :avatar="pool.avatar" :avatarSize="80" />
            </q-item-section>
            <q-item-section top class="q-pl-sm">
              <div class="row justify-between content-start items-start ">
                <div>
                  <div class="text-h3 q-pb-md q-pt-sm">{{ pool.title }}</div>
                  <p style="margin-bottom: 0">
                    Contract:
                    <a target="_blank" :href="contractURL">{{
                      pool.swap_ratio.contract
                    }}</a>
                  </p>
                </div>
                <div class="row col-xs-10 col-sm-shrink">
                  <status-badge
                    :poolStatus="pool.pool_status"
                    style="margin-left: 0"
                  />
                </div>
              </div>
            </q-item-section>
          </q-item>
          <q-item class="row justify-between">
            <p>
              {{ pool.tag_line }}
            </p>
            <div class="row items-center q-gutter-x-sm">
              <q-btn
                outline
                flat
                padding="6px 8px"
                icon="fas fa-thumbs-up"
                class="hover-accent"
              >
                <q-tooltip>Like</q-tooltip>
              </q-btn>
              <div>{{ sentimentValue("upvote") }}</div>
              <q-btn
                outline
                flat
                padding="6px 8px"
                icon="fas fa-thumbs-down"
                class="hover-accent"
              >
                <q-tooltip>Dislike</q-tooltip>
              </q-btn>
              <div>{{ sentimentValue("downvote") }}</div>
            </div>
          </q-item>
          <q-item v-if="['open', 'upcoming'].includes(pool.pool_status)">
            <div
              class="col row justify-between items-center"
              v-if="pool.pool_status === 'upcoming'"
            >
              <div>Opens in:</div>
              <status-countdown
                :deadline="pool.pool_open"
                :poolID="poolID"
                @countdown-finished="getPoolInfo"
              />
            </div>
            <div
              class="col row justify-between items-center"
              v-else-if="pool.pool_status === 'open'"
            >
              <div>Closes in:</div>
              <status-countdown
                :deadline="pool.public_end"
                :poolID="poolID"
                @countdown-finished="getPoolInfo"
              />
            </div>
          </q-item>
          <q-item
            v-if="
              !['completed', 'filled', 'cancelled'].includes(
                pool.pool_status
              ) || pool.owner === accountName
            "
          >
            <q-btn
              class="col"
              :to="{ name: 'joinpool', params: {} }"
              :color="pool.pool_status === 'upcoming' ? 'grey-4' : 'primary'"
              :label="isAuthenticated ? 'Join pool' : 'Login to join'"
              :disable="
                pool.pool_status === 'upcoming' ||
                  !isAuthenticated ||
                  !isWhitelisted
              "
              v-if="['open', 'upcoming'].includes(pool.pool_status)"
            />
            <q-btn
              v-if="pool.owner === accountName"
              label="Update"
              outline
              color="primary"
              :to="{ name: 'updatepool', params: { id: poolID } }"
              class="q-ml-sm"
            />
            <q-tooltip v-if="!isAuthenticated">
              Connect wallet
            </q-tooltip>
            <q-tooltip v-if="!isWhitelisted">
              Not whitelisted. Apply now!
            </q-tooltip>
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
              <h6>Progress:</h6>
            </div>
            <status-progress :progress="pool.progress" />
            <div class="row justify-between">
              <h5>{{ progressToPercentage }}</h5>
              <h5>{{ progressLabel }}</h5>
            </div>
          </div>
        </q-item>

        <q-inner-loading :showing="pool.title === 'Loading'">
          <q-spinner-puff size="50px" color="primary" />
        </q-inner-loading>
      </q-card>
      <q-card class="body-container">
        <q-tabs
          v-model="tab"
          dense
          class="text-grey"
          active-color="primary"
          indicator-color="primary"
          align="left"
          narrow-indicator
        >
          <q-tab name="details" label="DETAILS" />
          <q-tab name="overview" label="OVERVIEW" />
          <q-tab
            name="allocations"
            label="YOUR ALLOCATION"
            class="allocation-tab"
            :alert="claimable ? 'accent' : claimable"
          />
        </q-tabs>

        <q-separator />

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
            <tab-allocations :pool="pool" />
          </q-tab-panel>
        </q-tab-panels>

        <q-inner-loading :showing="pool.title === 'Loading'">
          <q-spinner-puff size="50px" color="primary" />
        </q-inner-loading>
      </q-card>
    </div>
  </q-page>
</template>

<script>
import statusCountdown from "src/components/poolinfo/status-countdown";
import statusBadge from "src/components/poolinfo/status-badge";
import tabOverview from "src/components/poolinfo/tab-overview.vue";
import tabAllocations from "src/components/poolinfo/tab-allocations.vue";
import tabDetails from "src/components/poolinfo/tab-details.vue";
import statusProgress from "src/components/poolinfo/status-progress";
import tokenAvatar from "src/components/TokenAvatar";
import { mapGetters, mapActions } from "vuex";
import { date } from "quasar";

export default {
  components: {
    tabOverview,
    tabAllocations,
    tabDetails,
    statusCountdown,
    statusBadge,
    statusProgress,
    tokenAvatar
  },
  data() {
    return {
      tab: "details",
      poolID: Number(this.$route.params.id),
      pool: this.$defaultPoolInfo,
      polling: null,
      claimable: false
    };
  },
  computed: {
    ...mapGetters("account", ["isAuthenticated", "accountName"]),
    ...mapGetters("pools", ["getPoolByID"]),
    ...mapGetters("blockchains", ["currentChain"]),

    progressToPercentage() {
      return (this.pool.progress * 100).toFixed(0) + "%";
    },

    isWhitelisted() {
      if (
        this.pool.whitelist.length > 0 &&
        this.pool.whitelist.includes(this.accountName)
      ) {
        return true;
      } else if (this.pool.whitelist.length === 0) {
        return true;
      } else {
        return false;
      }
    },

    contractURL() {
      let contractName = this.pool.swap_ratio.contract;
      if (contractName === "Loading" || contractName === "") return "#";
      else {
        try {
          return `${this.currentChain.NETWORK_EXPLORER}/account/${contractName}`;
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
          return `1 ${baseSym} = ${parseFloat(quantity)} ${sym}`;
        }
      } catch (error) {
        return "Error";
      }
    },
    progressLabel() {
      if (this.pool.total_raise === "Loading") return "Loading";
      else {
        let totalRaise = this.$chainToQty(this.pool.total_raise);
        let hardCap = this.$chainToQty(this.pool.hard_cap, 0);
        return `${totalRaise} / ${hardCap}`;
      }
    }
  },
  methods: {
    ...mapActions("pools", ["getChainPoolByID", "getAllocationByPool"]),
    getPoolInfo() {
      this.pool = this.getPoolByID(this.poolID);
    },
    hasAllocations(data) {
      return Object.keys(data).length > 0;
    },

    async getClaimStatus() {
      let payload = { account: this.accountName, poolID: this.pool.id };
      let allocation = await this.getAllocationByPool(payload);
      if (
        this.hasAllocations(allocation) &&
        this.pool.status === ("success" || "fail")
      ) {
        this.claimable = true;
      }
    },
    async loadChainData() {
      await this.getChainPoolByID(this.poolID);
    },
    sentimentValue(key) {
      if (this.pool.sentiment.length > 0)
        return this.pool.sentiment.find(el => el.key === key).value;
      else return 0;
    }
  },
  async mounted() {
    // get data from chain, write to store, get from store
    await this.loadChainData();
    this.getPoolInfo();
    await this.getClaimStatus();
    // Start polling
    this.polling = setInterval(() => {
      this.getPoolInfo();
    }, 60000);
    // if rerouting with tab
    if (this.$route.query.tab == "allocations") {
      this.tab = "allocations";
    } else {
      this.tab = "details";
    }
  },
  beforeDestroy() {
    clearInterval(this.polling);
  }
};
</script>

<style lang="scss" scoped>
.header-bg {
  height: 160px;
  margin-bottom: -50px;
  // background-position-y: 50%;
}
.join-pane {
  display: grid;
  grid-template-rows: min-content auto;
  grid-auto-rows: min-content min-content;
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
.text-h3 {
  line-height: 22px;
}
@media only screen and (max-width: 375px) {
  .q-card {
    padding: 5px;
  }
  .body-container {
    padding-left: 8px;
    padding-right: 8px;
  }
}
</style>
