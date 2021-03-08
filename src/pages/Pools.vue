<template>
  <q-page>
    <title>T-STARTER - Pools</title>
    <section class="page-banner row content-center justify-center">
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
        <q-tab-panel name="all-pools" class="row  q-gutter-md">
          <!-- <div class="col row  q-gutter-md"> -->
          <Poolcard v-for="id in poolIDs" :key="id" :poolID="id"></Poolcard>
          <!-- </div> -->
        </q-tab-panel>

        <q-tab-panel name="featured-pools">
          <div class="row  q-gutter-md">
            <Poolcard v-for="id in poolIDs" :key="id" :poolID="id"></Poolcard>
          </div>
        </q-tab-panel>

        <q-tab-panel name="joined-pools">
          <div class="row  q-gutter-md"></div>
        </q-tab-panel>

        <q-tab-panel name="created-pools">
          <div class="row  q-gutter-md">
            <Poolcard v-for="id in createdPoolIDs" :key="id" :poolID="id" :created="true"></Poolcard>
          </div>
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
      tab: "all-pools"
    };
  },
  computed: {
    ...mapGetters("pools", ["getAllPoolIDs", "getCreatedPoolIDs"]),
    ...mapGetters("account", ["isAuthenticated", "accountName"]),
    poolIDs() {
      return this.getAllPoolIDs;
    },
    createdPoolIDs() {
      return this.getCreatedPoolIDs(this.accountName);
    }
  },
  methods: {
    ...mapActions("pools", ["getAllChainPools", 'getCreatedChainPools'])
  },
  async mounted() {
    await this.getAllChainPools();
    await this.getCreatedChainPools(this.accountName);
  }
};
</script>

<style lang="scss" scoped>
.page-banner {
  background-image: url("~assets/index/clouds-head.png");
  height: 200px;
}
.tab-panel-container {
  background-color: $secondary;
}
</style>
