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

      <div
        v-if="tab === 'all-pools'"
        class=" q-mt-xs row items-start items-center"
      >
        <q-input
          v-model="search.text"
          @input="filterPools()"
          dense
          rounded
          outlined
          class="col"
          label="Search by Name, Token contract, Description"
        >
          <template v-slot:prepend>
            <q-icon name="fas fa-search" />
          </template>
        </q-input>

        <!-- Filter  -->
        <div class="row q-px-xs q-gutter-xs ">
          <q-btn
            outline
            rounded
            :color="search.filter.chain === `all` ? 'accent' : 'primary'"
            @click="filterPools((search.filter.chain = 'all'))"
            label="All"
          />
          <div v-for="chain in possibleChains" :key="chain.NETWORK_NAME">
            <q-btn
              outline
              rounded
              :color="
                search.filter.chain === chain.NETWORK_NAME
                  ? 'accent'
                  : 'primary'
              "
              @click="filterPools((search.filter.chain = chain.NETWORK_NAME))"
            >
              <template v-slot:default>
                <div style="padding: 0px 3px 0px 0px">
                  <token-avatar :token="chain.NETWORK_NAME" :avatarSize="20" />
                </div>
                {{ chain.NETWORK_NAME }}
              </template>
            </q-btn>
          </div>
        </div>
      </div>

      <!-- Status filter -->
      <div class=" q-mt-xs row items-start items-center q-gutter-x-sm">
        <a
          href="javascript:void(0);"
          @click="filterPools((search.filter.status = 'all'))"
          >All Status</a
        >
        <a
          href="javascript:void(0);"
          @click="filterPools((search.filter.status = 'open'))"
          >Open</a
        >
        <a
          href="javascript:void(0);"
          @click="filterPools((search.filter.status = 'upcoming'))"
          >Upcoming</a
        >
      </div>

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
            v-for="pool in joinedIdChains_sorted"
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
import tokenAvatar from "src/components/TokenAvatar";

export default {
  components: { Poolcard, tokenAvatar },
  data() {
    return {
      tab: "all-pools",
      joinedIdChains: [],
      featuredPoolIdChains: [],
      claimableIDs: [],
      claimable: false,
      polling: null,
      currentPage: 1,
      page: 1,
      // filterOptions: ["All", "Open", "Upcoming", "Chain"],
      chainFilterOptions: ["TELOS", "EOS", "WAX"],
      search: { text: "", filter: { chain: "all", status: "all" } },
      filteredPools: []
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
      "getPoolByIDChain",
      "getAllPools"
    ]),
    ...mapGetters("account", ["isAuthenticated", "accountName"]),
    ...mapGetters("blockchains", ["currentChain"]),
    ...mapGetters("blockchains", ["currentChain", "allBlockchains"]),

    possibleChains() {
      let blockchains = this.allBlockchains;
      let possibleChains = blockchains.filter(
        a => String(a.TEST_NETWORK) === process.env.TESTNET
      );
      return possibleChains;
    },

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
      if (
        this.search.text.length > 0 ||
        this.search.filter.chain !== "all" ||
        this.search.filter.status !== "all"
      ) {
        return this.sortPools(this.filteredPools);
      }
      return this.sortPools(this.getPublishedPools);
    },
    joinedIdChains_sorted() {
      return this.sortPools(this.joinedIdChains);
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
      let order = [
        "open",
        "upcoming",
        "completed",
        "filled",
        "cancelled",
        "draft"
      ];
      pools.sort((a, b) => {
        return order.indexOf(a.pool_status) - order.indexOf(b.pool_status);
      });
      // console.log(result);
      return pools.map(a => ({ id: a.id, chain: a.chain }));
    },

    filterPools(filter) {
      if (
        this.search.filter.chain != "all" ||
        this.search.filter.status != "all"
      ) {
        this.filteredPools = this.getPublishedPools.filter(pool => {
          // status filter
          if (
            pool.pool_status
              .toLowerCase()
              .indexOf(this.search.filter.status.toLowerCase()) != "-1" &&
            this.search.filter.chain.toLowerCase() === "all"
          ) {
            return pool;
          }
          //chain filter
          if (
            pool.chain
              .toLowerCase()
              .indexOf(this.search.filter.chain.toLowerCase()) != "-1" &&
            this.search.filter.status.toLowerCase() === "all"
          ) {
            return pool;
          }
          // both filter
          if (
            pool.pool_status
              .toLowerCase()
              .indexOf(this.search.filter.status.toLowerCase()) != "-1" &&
            pool.chain
              .toLowerCase()
              .indexOf(this.search.filter.chain.toLowerCase()) != "-1"
          ) {
            return pool;
          }
        });
        if (this.search.text.length > 0) {
          console.log("text with filter");
          this.filterByText(this.filteredPools);
        }
      } else {
        this.filterByText(this.getAllPools);
      }
    },

    filterByText(pools) {
      this.filteredPools = pools.filter(pool => {
        if (
          pool.title.toLowerCase().indexOf(this.search.text.toLowerCase()) !=
          "-1"
        ) {
          return pool;
        }
        if (
          pool.swap_ratio.contract
            .toLowerCase()
            .indexOf(this.search.text.toLowerCase()) != "-1"
        ) {
          return pool;
        }
        if (
          pool.tag_line.toLowerCase().indexOf(this.search.text.toLowerCase()) !=
          "-1"
        ) {
          return pool;
        }
      });
    },

    // If any joined pools claimable on current chain, show alert
    async findClaimable() {
      for (const id of this.joinedIdChains.map(a => a.id)) {
        const joined_pool = this.getPoolByIDChain(
          id,
          this.currentChain.NETWORK_NAME
        );
        let payload = { account: this.accountName, poolID: id };
        let allocation = await this.getAllocationByPool(payload);
        if (
          Object.keys(allocation).length > 0 &&
          (joined_pool.pool_status === "filled" ||
            joined_pool.pool_status === "completed" ||
            joined_pool.pool_status === "cancelled")
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
    this.joinedIdChains = await this.getJoinedChainPools(this.accountName);
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
      this.joinedIdChains = await this.getJoinedChainPools(this.accountName);
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
