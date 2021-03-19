<template>
  <q-page>
    <section class="header-bg row content-center justify-center">
      <h2 class="text-white q-pt-xl">Pools</h2>
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
        <q-tab
          name="joined-pools"
          label="POOLS JOINED"
          :alert="claimable ? 'accent' : claimable"
        ></q-tab>
        <q-tab name="created-pools" label="POOLS CREATED"></q-tab>
      </q-tabs>

      <q-separator></q-separator>

      <q-tab-panels
        v-model="tab"
        animated
        swipeable
        class="tab-panel-container"
      >
        <q-tab-panel
          name="all-pools"
          class="poolcard-container"
          @mousedown.stop
        >
          <Poolcard v-for="id in publishedPoolIDs" :key="id" :poolID="id" />
        </q-tab-panel>

        <q-tab-panel
          name="featured-pools"
          class="poolcard-container"
          @mousedown.stop
        >
          <Poolcard v-for="id in featuredIDs_sorted" :key="id" :poolID="id" />
        </q-tab-panel>

        <q-tab-panel
          name="joined-pools"
          class="poolcard-container"
          @mousedown.stop
        >
          <Poolcard v-for="id in joinedIDs_sorted" :key="id" :poolID="id" />
        </q-tab-panel>

        <q-tab-panel
          name="created-pools"
          class="poolcard-container"
          @mousedown.stop
        >
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
      featuredIDs: [],
      claimable: false
    };
  },
  computed: {
    ...mapGetters("pools", [
      "getAllPoolIDs",
      "getCreatedPoolIDs",
      "getPublishedPoolIDs",
      "getPoolIDsByStatus",
      "getPoolByID"
    ]),
    ...mapGetters("account", ["isAuthenticated", "accountName"]),
    poolIDs() {
      return this.getAllPoolIDs;
    },
    createdPoolIDs() {
      return this.sortPools(this.getCreatedPoolIDs(this.accountName)); // TODO do like joined, maybe slower?
    },
    publishedPoolIDs() {
      return this.sortPools(this.getPublishedPoolIDs);
    },
    joinedIDs_sorted() {
      return this.sortPools(this.joinedIDs);
    },
    featuredIDs_sorted() {
      return this.sortPools(this.featuredIDs);
    }
  },
  methods: {
    ...mapActions("pools", [
      "getAllChainPools",
      "getCreatedChainPools",
      "getJoinedChainPools",
      "getFeaturedChainPools",
      "getUpcomingPools",
      "getChainPoolByID",
      "getAllocationByPool"
    ]),

    sortPools(id_list) {
      let new_id_list = [];
      let open_pools = this.getPoolIDsByStatus("open");
      let upcoming_pools_ids = this.getPoolIDsByStatus("upcoming");
      let closed_pools = this.getPoolIDsByStatus("closed");
      new_id_list = new_id_list.concat(open_pools);
      new_id_list = new_id_list.concat(upcoming_pools_ids);
      new_id_list = new_id_list.concat(closed_pools);
      new_id_list = new_id_list.filter(value => id_list.includes(value));
      // console.log(new_id_list);
      return new_id_list;
    },

    async findClaimable() {
      for (const id of this.joinedIDs) {
        const joined_pool = this.getPoolByID(id);
        let payload = { account: this.accountName, poolID: id};
        let allocation = await this.getAllocationByPool(payload);
        if (
          Object.keys(allocation).length > 0 &&
          joined_pool.status === ("success" || "fail")
        ) {
          this.claimable = true;
        }
      }
    }
  },
  async mounted() {
    await this.getAllChainPools();
    await this.getCreatedChainPools(this.accountName);
    this.joinedIDs = await this.getJoinedChainPools(this.accountName);
    this.featuredIDs = await this.getFeaturedChainPools();
    await this.findClaimable();
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
