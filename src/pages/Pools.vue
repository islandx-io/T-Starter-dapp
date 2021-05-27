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
          <Poolcard
            v-for="pool in pagedPublishedPools"
            :key="`${pool.chain}+${pool.id}`"
            :poolID="pool.id"
            :chain="pool.chain"
          />
        </q-tab-panel>

        <q-tab-panel
          name="featured-pools"
          class="poolcard-container"
          @mousedown.stop
        >
          <Poolcard
            v-for="pool in featuredPoolIdChains_sorted"
            :key="`${pool.chain}+${pool.id}`"
            :poolID="pool.id"
            :chain="pool.chain"
          />
        </q-tab-panel>

        <q-tab-panel
          name="joined-pools"
          class="poolcard-container"
          @mousedown.stop
        >
          <Poolcard
            v-for="pool in joinedPools_sorted"
            :key="`${pool.chain}+${pool.id}`"
            :poolID="pool.id"
            :chain="pool.chain"
          />
        </q-tab-panel>

        <q-tab-panel
          name="created-pools"
          class="poolcard-container"
          @mousedown.stop
        >
          <Poolcard
            v-for="pool in createdPools"
            :key="`${pool.chain}+${pool.id}`"
            :poolID="pool.id"
            :chain="pool.chain"
            :created="true"
          />
        </q-tab-panel>
      </q-tab-panels>

      <!-- Page controller -->
      <q-pagination
        v-if="tab === 'all-pools'"
        class="q-pa-lg flex flex-center"
        v-model="page"
        :min="currentPage"
        :max="totalPages"
        direction-links
      />

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
        <q-btn
          label="Subscribe"
          outline
          class="hover-accent"
          type="a"
          target="_blank"
          href="https://t.me/joinchat/WgQUJEvd0jRmM2Q0"
        />
      </q-card>
    </section>
  </q-page>
</template>

<script>
import Poolcard from "src/components/Poolcard.vue";
import { mapGetters, mapActions } from "vuex";
import { Api, JsonRpc } from "eosjs";

export default {
  components: { Poolcard },
  data() {
    return {
      tab: "all-pools",
      joinedPools: [],
      featuredPoolIdChains: [],
      claimableIDs: [],
      claimable: false,
      polling: null,
      currentPage: 1,
      page: 1
    };
  },
  computed: {
    ...mapGetters("pools", [
      "getAllPoolIDs",
      "getCreatedPoolIDs",
      "getCreatedPools",
      "getPublishedPoolIDs",
      "getPoolIDsByStatus",
      "getPoolByID",
      "getAllPools",
      "getPublishedPools",
      "getPoolByIDChain"
    ]),
    ...mapGetters("account", ["isAuthenticated", "accountName"]),
    ...mapGetters("blockchains", ["currentChain"]),

    poolIDs() {
      return this.getAllPoolIDs;
    },
    createdPools() {
      return this.getCreatedPools(
        this.accountName,
        this.currentChain.NETWORK_NAME
      );
    },
    publishedPools() {
      return this.sortPools(this.getPublishedPools);
    },
    joinedPools_sorted() {
      return this.sortPools(this.joinedPools);
    },
    featuredPoolIdChains_sorted() {
      if (this.featuredPoolIdChains.length > 0) {
        let featuredPools = [];
        for (const id_chain of this.featuredPoolIdChains) {
          var temp_pool = this.getPoolByIDChain(id_chain.id, id_chain.chain);
          if (
            temp_pool.status !== undefined &&
            (temp_pool.status === "published" || temp_pool.status === "success")
          ) {
            featuredPools.push(temp_pool);
          }
        }
        return this.sortPools(featuredPools);
      } else {
        return [];
      }
    },
    totalPages() {
      // amount of pools / 9 ceil
      return Math.ceil(this.publishedPools.length / 9);
    },
    pagedPublishedPools() {
      return this.publishedPools.slice(
        (this.page - 1) * this.totalPages,
        (this.page - 1) * this.totalPages + 9
      );
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

    sortPools(pools) {
      // TODO claimable
      let order = ["open", "upcoming", "completed", "filled", "cancelled"];
      pools.sort((a, b) => {
        return order.indexOf(a.pool_status) - order.indexOf(b.pool_status);
      });
      // console.log(result);
      return pools.map(a => ({ id: a.id, chain: a.chain }));
    },

    // If any joined pools claimable, show alert
    async findClaimable() {
      for (const id of this.joinedPools.map(a => a.id)) {
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
    this.joinedPools = await this.getJoinedChainPools(this.accountName);
    this.featuredPoolIdChains = await this.getFeaturedChainPools();
    await this.findClaimable();
    // Start polling every 1min for any updates
    this.polling = setInterval(async () => {
      await this.getAllChainPools();
    }, 30000);
  },

  watch: {
    async accountName() {
      await this.getAllChainPools();
      await this.getCreatedChainPools(this.accountName);
      this.joinedPools = await this.getJoinedChainPools(this.accountName);
      this.featuredPoolIdChains = await this.getFeaturedChainPools();
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
