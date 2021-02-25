<template>
  <!-- NOTE lifecycle hooks of the component will not be called -->
  <!-- TODO Page not found -->
  <q-page>
    <!-- content -->
    <div>Params: {{ this.$route.params }} Query: {{ this.$route.query }}</div>
    <q-btn
      :to="{ name: 'joinpool', params: {} }"
      class="current nav-item"
      label="Join pool"
    />
    <q-btn class="current nav-item" label="View on bloks.io" />

    <div v-if="isAuthenticated">
      <q-btn
        v-for="tab in tabs"
        v-bind:key="tab"
        v-bind:class="['tab-button', { active: currentTab === tab }]"
        v-on:click="currentTab = tab"
      >
        {{ tab }}
      </q-btn>
    </div>
    <component
      v-if="isAuthenticated"
      v-bind:is="currentTabComponent"
      class="tab"
    ></component>

    <div v-if="isAuthenticated">
      hey
    </div>
    <div v-else>Please login to do a transfer!</div>
  </q-page>
</template>

<script>
import tabAbout from "src/components/poolinfo/tab-about.vue";
import tabAllocations from "src/components/poolinfo/tab-allocations.vue";
import tabDetails from "src/components/poolinfo/tab-details.vue";
import { mapGetters, mapActions } from "vuex";

export default {
  components: { tabAbout, tabAllocations, tabDetails },
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
