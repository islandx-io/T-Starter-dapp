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
        <q-tab name="all-pools" label="ALL"></q-tab>
        <q-tab name="featured-pools" label="FEATURED"></q-tab>
        <q-tab
          name="joined-pools"
          label="JOINED"
          :alert="claimable ? 'accent' : claimable"
        ></q-tab>
        <q-tab name="created-pools" label="CREATED"></q-tab>
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
      <q-card
        outline
        flat
        class="column items-center text-secondary q-gutter-y-md"
        id="notify-banner"
      >
        <h1 class="text-center">Stay Updated</h1>
        <div class="text-h6 text-center" style="max-width: 570px">
          Subscribe to receive anouncements about new pools and other relevant
          events.
        </div>
        <q-btn label="Subscribe" outline class="hover-accent" />
      </q-card>
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
      claimableIDs: [],
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
      return this.getCreatedPoolIDs(this.accountName); // TODO do like joined, maybe slower?
    },
    publishedPoolIDs() {
      return this.sortPools(this.getPublishedPoolIDs);
    },
    joinedIDs_sorted() {
      return this.sortPools(this.joinedIDs);
    },
    featuredIDs_sorted() {
      //check if published
      let new_featured_ids = [];
      for (const id of this.featuredIDs) {
        const temp_pool = this.getPoolByID(id);
        if (temp_pool.status !== "draft") {
          new_featured_ids.push(id);
        }
      }
      return this.sortPools(new_featured_ids);
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
      let result = [];
      let open = this.getPoolIDsByStatus("open");
      let upcoming = this.getPoolIDsByStatus("upcoming");
      let completed = this.getPoolIDsByStatus("completed");
      let filled = this.getPoolIDsByStatus("filled");
      let failed = this.getPoolIDsByStatus("failed");
      result = result.concat(
        this.claimableIDs,
        open,
        upcoming,
        completed,
        filled,
        failed
      );
      result = result.filter(value => id_list.includes(value));
      result = [...new Set(result)]; // remove duplicates
      // console.log(result);
      return result;
    },

    // If any joined pools claimable, show alert
    async findClaimable() {
      for (const id of this.joinedIDs) {
        const joined_pool = this.getPoolByID(id);
        let payload = { account: this.accountName, poolID: id };
        let allocation = await this.getAllocationByPool(payload);
        if (
          Object.keys(allocation).length > 0 &&
          joined_pool.status === ("success" || "fail")
        ) {
          this.claimable = true;
          this.claimableIDs.push(id);
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
  },

  watch: {
    async accountName() {
      await this.getAllChainPools();
      await this.getCreatedChainPools(this.accountName);
      this.joinedIDs = await this.getJoinedChainPools(this.accountName);
      this.featuredIDs = await this.getFeaturedChainPools();
      await this.findClaimable();
    }
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
#notify-banner {
  background-image: url("~assets/index/clouds-head.png");
  // height: 550px;
  padding-top: 50px;
  padding-bottom: 50px;
  margin: 0 30px 0 30px;
  & h1 {
    font-weight: 600;
    font-size: 80px;
    padding: 0;
    margin: 0;
    @media only screen and (max-width: 610px) {
      font-size: 12vw;
      line-height: 16vw;
    }
  }
}
</style>
