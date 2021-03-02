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
                v-if="image_link"
                :src="image_link"
                width="50px"
                alt="image"
              />
              <div v-else v-html="identicon" />
            </q-avatar>
            <div class="row q-gutter-md">
              <div class="text-h3">{{ title }}</div>
              <status-badge :poolStatus="pool_status"></status-badge>
            </div>
          </q-item-section>
          <q-item-section>
            <p>
              {{ short_description }}
            </p>
          </q-item-section>
          <status-countdown
            v-if="pool_status === 'upcoming'"
            :deadline="start_date"
          ></status-countdown>
          <status-countdown
            v-else-if="pool_status === 'open'"
            :deadline="end_public_date"
          ></status-countdown>
        </q-item>
        <q-item class="col-6 row justify-center">
          <div class="col join-pane column q-gutter-md">
            <div class="row justify-between items-center">
              <div class="text-h6">Total raise</div>
              <p class="item-price">300000</p>
            </div>
            <q-btn outline label="View on bloks.io" />
            <q-btn
              :to="{ name: 'joinpool', params: {} }"
              color="primary"
              label="Join pool"
            />
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
            :poolObject="poolObject"
          ></component>
        </keep-alive>
      </q-card>

      <div>Params: {{ this.$route.params }} Query: {{ this.$route.query }}</div>
      <div v-if="isAuthenticated">{{ accountName }} is authenticated</div>
      <div v-else>Please login to do a transfer!</div>
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
      title: "No Project",
      slug: "no-project",
      price: 0,
      minimum: "TBA",
      maximum: "TBA",
      type: "Fixed",
      access_type: "Private",
      progress: 0,
      participants: 0,
      image_link: "",
      short_description: "Short description",
      long_description: "Long description",
      web_links: {},
      pool_status: "loading",
      start_date: new Date(), // TODO Reconsider best init
      end_private_date: new Date(),
      end_public_date: new Date(),
      poolObject: {},
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
    }
  },
  methods: {
    toDate(timeStamp) {
      return date.formatDate(timeStamp, "DD MMMM YYYY, HH:mm UTC");
    },
    getPoolInfo: function() {
      const poolJSON = this.getPoolByID(this.poolID);

      this.title = poolJSON.title;
      this.price = poolJSON.price;
      this.minimum = poolJSON.minimum_allocation_per_wallet;
      this.maximum = poolJSON.max_eth_allocation;
      this.type = poolJSON.type;
      this.access_type = poolJSON.access_type;
      this.participants = poolJSON.participants;
      this.image_link = poolJSON.image_link;
      this.short_description = poolJSON.short_description;
      this.long_description = poolJSON.long_description;
      this.web_links = poolJSON.web_links;
      // this.pool_status = poolJSON.status.toLowerCase();
      // TODO Check timezone & date format
      this.start_date = poolJSON.start_date;
      this.end_public_date = poolJSON.end_public_date;
      this.poolObject = poolJSON;

      // Update pool status
      const currentDate = Date.now();
      if (currentDate < this.start_date) {
        this.pool_status = "upcoming";
      } else if (currentDate > this.end_public_date) {
        this.pool_status = "closed";
      } else {
        this.pool_status = "open";
      }
    },
    pollPoolInfo() {
      this.polling = setInterval(this.getPoolInfo, 3000);
    }
  },
  mounted() {
    //TODO if not in store, load chain?
    this.getPoolInfo();
    this.pollPoolInfo();
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
