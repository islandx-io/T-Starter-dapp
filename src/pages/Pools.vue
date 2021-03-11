<template>
  <q-page>
    <title>T-STARTER - Pools</title>
    <section class="header-bg row content-center justify-center">
      <h2 class="text-white">Pools</h2>
    </section>

    <section class="body-container">
      <q-tabs
        v-model="tab"
        dense
        class="text-grey"
        active-color="primary"
        indicator-color="primary"
        align="justify"
        narrow-indicator
      >
        <q-tab name="all-pools" label="ALL POOLS"></q-tab>
        <q-tab name="featured-pools" label="FEATURED POOLS"></q-tab>
        <q-tab name="joined-pools" label="POOLS JOINED"></q-tab>
        <q-tab name="created-pools" label="POOLS CREATED"></q-tab>
      </q-tabs>

      <q-separator></q-separator>

      <q-tab-panels
        v-model="tab"
        animated
        swipeable
        class="tab-panel-container"
      >
        <q-tab-panel name="all-pools" class="poolcard-container">
          <Poolcard v-for="id in getPublishedPoolIDs" :key="id" :poolID="id" />
        </q-tab-panel>

        <q-tab-panel name="featured-pools" class="poolcard-container">
          <Poolcard v-for="id in featuredIDs" :key="id" :poolID="id" />
        </q-tab-panel>

        <q-tab-panel name="joined-pools" class="poolcard-container">
          <Poolcard v-for="id in joinedIDs" :key="id" :poolID="id" />
        </q-tab-panel>

        <q-tab-panel name="created-pools" class="poolcard-container">
          <Poolcard
            v-for="id in createdPoolIDs"
            :key="id"
            :poolID="id"
            :created="true"
          />
        </q-tab-panel>
      </q-tab-panels>
    </section>
  </q-page>
</template>

<script>
import Poolcard from "src/components/Poolcard.vue";
import { mapGetters, mapActions } from "vuex";
export default {
  components: { Poolcard },
  data() {
    return {
      tab: "all-pools",
      joinedIDs: [],
      featuredIDs: []
    };
  },
  computed: {
    ...mapGetters("pools", ["getAllPoolIDs", "getCreatedPoolIDs", "getPublishedPoolIDs"]),
    ...mapGetters("account", ["isAuthenticated", "accountName"]),
    poolIDs() {
      return this.getAllPoolIDs;
    },
    createdPoolIDs() {
      return this.getCreatedPoolIDs(this.accountName);
    }
  },
  methods: {
    ...mapActions("pools", [
      "getAllChainPools",
      "getCreatedChainPools",
      "getJoinedChainPools",
      "getFeaturedChainPools"
    ])
  },
  async mounted() {
    await this.getAllChainPools();
    await this.getCreatedChainPools(this.accountName);
    this.joinedIDs = await this.getJoinedChainPools(this.accountName);
    this.featuredIDs = await this.getFeaturedChainPools();
  }
};
</script>

<style lang="scss" scoped>
.header-bg {
  height: 200px;
}
.poolcard-container {
  padding: 30px;
  min-height: 400px;
}
.body-container {
  padding-left: 0;
  padding-right: 0;
}
</style>
