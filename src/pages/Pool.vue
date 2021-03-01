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
              <img src="~assets/pools/prog-1.png" width="50px" alt="image" />
            </q-avatar>
            <div class="text-h3">The Worm Project</div>
          </q-item-section>
          <q-item-section>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut porta
              fringilla euismod. Nulla nulla ligula, ornare a semper ut.
            </p>
          </q-item-section>
          <status-countdown
            :deadline="new Date(new Date().getTime() + 86400000)"
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
      <div v-if="isAuthenticated" class="q-gutter-md">
        <q-btn
          v-for="tab in tabs"
          v-bind:key="tab"
          v-bind:class="['tab-button', { active: currentTab === tab }]"
          v-on:click="currentTab = tab"
        >
          {{ tab }}
        </q-btn>
      </div>
      <q-card class="card">
        <component
          v-if="isAuthenticated"
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

<script>
import statusCountdown from "src/components/poolinfo/status-countdown";
import tabAbout from "src/components/poolinfo/tab-about.vue";
import tabAllocations from "src/components/poolinfo/tab-allocations.vue";
import tabDetails from "src/components/poolinfo/tab-details.vue";
import { mapGetters, mapActions } from "vuex";

export default {
  components: { tabAbout, tabAllocations, tabDetails, statusCountdown },
  data() {
    return {
      currentTab: "Details",
      tabs: ["Details", "About", "Allocations"]
    };
  },
  computed: {
    currentTabComponent: function() {
      return "tab-" + this.currentTab.toLowerCase();
    },
    ...mapGetters("account", ["isAuthenticated", "accountName"])
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
