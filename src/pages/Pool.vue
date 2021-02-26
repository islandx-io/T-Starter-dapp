<template>
  <!-- NOTE lifecycle hooks of the component will not be called -->
  <!-- TODO Page not found -->
  <q-page class="row justify-center q-gutter-md">
    <div
      class="col content column justify-start items-stretch content-stretch q-gutter-md"
    >
      <q-card class="card row justify-between content-start">
        <q-item class="col column">
          <q-item-section class="col row items-center justify-left q-gutter-md">
            <q-avatar size="80px">
              <img
                v-if="image_link"
                :src="image_link"
                width="50px"
                alt="image"
              />
              <div v-else v-html="identicon" />
            </q-avatar>
            <div class="text-h3">{{ title }}</div>
          </q-item-section>
          <q-item-section>
            <p>
              {{ short_description }}
            </p>
          </q-item-section>
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
          v-bind:class="['tab-button', { active: currentTab === 'About' }]"
          v-on:click="currentTab = 'About'"
          >Overview</q-btn
        >
        <q-btn
          v-if="isAuthenticated"
          v-bind:class="['tab-button', { active: currentTab === 'Allocations' }]"
          v-on:click="currentTab = 'Allocations'"
          >Your Allocations</q-btn
        >

      </div>
      <q-card class="card">
        <component
          v-bind:is="currentTabComponent"
          class="tab"
        ></component>
      </q-card>

      <div>Params: {{ this.$route.params }} Query: {{ this.$route.query }}</div>
      <div v-if="isAuthenticated">{{ accountName }} is authenticated</div>
      <div v-else>Please login to do a transfer!</div>
    </div>
  </q-page>
</template>

// TODO reroute to this page if logged out
<script>
import tabAbout from "src/components/poolinfo/tab-about.vue";
import tabAllocations from "src/components/poolinfo/tab-allocations.vue";
import tabDetails from "src/components/poolinfo/tab-details.vue";
import { mapGetters, mapActions } from "vuex";
import { toSvg } from "jdenticon";

export default {
  components: { tabAbout, tabAllocations, tabDetails },
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
      accessType: "Private",
      progress: 0,
      participants: 0,
      image_link: "",
      short_description: "Short description",
      long_description: "Long description"
    };
  },
  computed: {
    ...mapGetters("account", ["isAuthenticated", "accountName"]),
    ...mapGetters("pools", ["getPoolByID"]),
    currentTabComponent: function() {
      return "tab-" + this.currentTab.toLowerCase();
    },
    progressToPercentage() {
      return this.progress * 100 + "%";
    },
    identicon() {
      return toSvg(this.poolID, 80);
    }
  },
  methods: {
    getPoolInfo: function() {
      console.log(this.poolID);
      const poolJSON = this.getPoolByID(this.poolID);
      console.log(poolJSON);

      this.title = poolJSON.title;
      this.price = poolJSON.price;
      this.minimum = poolJSON.minimum_allocation_per_wallet;
      this.maximum = poolJSON.max_eth_allocation;
      this.type = poolJSON.type;
      this.accessType = poolJSON.accessType;
      this.participants = poolJSON.participants;
      this.image_link = poolJSON.image_link;
      this.short_description = poolJSON.short_description;
      this.long_description = poolJSON.long_description;
    }
  },
  mounted() {
    this.getPoolInfo();
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
