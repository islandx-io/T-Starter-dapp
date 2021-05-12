<template>
  <!-- And do not be conformed to this world, but be transformed by the renewing of your mind, 
that you may prove what is that good and acceptable and perfect will of God. - Romans 12:2 -NKJV -->
  <q-page>
    <section class="header-bg row content-start">
      <div
        class="col-12 row justify-between q-px-xl"
        style="z-index: 0; position: absolute"
      >
        <space-bubble class="gt-xs" duration="8s" />
        <space-bubble class="gt-sm" duration="14s" delay="2s" />
        <space-bubble class="gt-lg" duration="12s" delay="1.3s" />
      </div>
      <div
        class="header-container row reverse-wrap justify-between"
        style="z-index: 1"
      >
        <div class="column justify-start">
          <h2>
            The place to discover and
            <span>back projects</span>
            building on {{currentChain.NETWORK_DISPLAY_NAME}}
          </h2>

          <div class="q-gutter-x-sm">
            <q-btn
              class="hover-accent"
              color="secondary"
              outline
              :to="{name: 'allpools'}"
              label="VIEW ALL POOLS"
            />
            <q-btn
              class="hover-accent"
              color="secondary"
              outline
              type="a"
              target="_blank"
              href="https://docs.google.com/forms/d/e/1FAIpQLSeQE7zDFlxxWmAN-pKDfik6OcgtReJ8oiviIpCUkOAGk6Ez7Q/viewform"
              label="List project"
            />
          </div>
        </div>
        <transition
          appear
          appear-active-class="fade-enter-active"
          @before-appear="beforeAppear"
          @appear="appear"
          @after-appear="afterAppear"
        >
          <div class="gt-sm rocket col row justify-center">
            <img
              class="col q-pt-md"
              src="~assets/index/tstarter-rocket.svg"
              width="80%"
              alt="Illustration"
            />
          </div>
        </transition>
      </div>
    </section>
    <div class="body-container">
      <section class="row justify-center q-gutter-lg">
        <!-- Featured pools -->
        <h2 class="col-12 text-center">Featured Pools</h2>
        <rocket-line class="col-12 text-center" />
        <p class="col-12 text-center" v-if="noFeaturedPools">
          There are no featured pools at the moment.
        </p>
        <div
          class="poolcard-container col"
          v-else-if="featuredIDs_sorted.length !== 0"
        >
          <Poolcard
            class="col"
            v-for="id in featuredIDs_sorted"
            :key="'featured-' + id"
            :poolID="id"
          />
        </div>
        <Poolcard v-else class="col-shrink" :poolID="-1" />

        <!-- Open pools -->
        <h2 class="col-12 text-center q-pt-xl">Open Pools</h2>
        <rocket-line class="col-12 text-center" />
        <p class="col-12 text-center" v-if="openIDs.length === 0">
          There are no open pools at the moment.
        </p>
        <div class="poolcard-container col" v-else-if="openIDs.length !== 0">
          <Poolcard v-for="id in openIDs" :key="'open-' + id" :poolID="id" />
        </div>
        <Poolcard v-else class="col-shrink" :poolID="-1" />

        <!-- Upcoming pools -->
        <h2 class="col-12 text-center q-pt-xl">Upcoming Pools</h2>
        <rocket-line class="col-12 text-center" />
        <p class="col-12 text-center" v-if="noUpcomingPools">
          There are no upcoming pools at the moment.
        </p>
        <div
          class="poolcard-container col"
          v-else-if="upcomingIDs_comp.length !== 0"
        >
          <Poolcard
            v-for="id in upcomingIDs_comp"
            :key="'upcoming-' + id"
            :poolID="id"
          />
        </div>
        <Poolcard v-else class="col-shrink" :poolID="-1" />

        <div class="col-12 text-center row justify-center q-pt-md">
          <q-btn
            class="hover-accent"
            color="accent"
            outline
            :to="{name: 'allpools'}"
            label="VIEW ALL POOLS"
          />
        </div>
      </section>
    </div>
  </q-page>
</template>

<script>
import Poolcard from "src/components/Poolcard.vue";
import RocketLine from "src/components/decor/RocketLine.vue";
import SpaceBubble from "src/components/decor/SpaceBubble.vue";
import { mapGetters, mapActions } from "vuex";
export default {
  components: { Poolcard, RocketLine, SpaceBubble },
  data() {
    return {
      featuredIDs: [],
      upcomingIDs: [],
      noUpcomingPools: false,
      noFeaturedPools: false
    };
  },
  computed: {
    ...mapGetters("pools", [
      "getAllPoolIDs",
      "getPoolIDsByStatus",
      "getPoolByID",
      "getPublishedPoolIDs"
    ]),
    ...mapGetters("blockchains", ["currentChain"]),
    openIDs() {
      let open_pools = this.getPoolIDsByStatus("open");
      let published_pools = this.getPublishedPoolIDs;
      open_pools = open_pools.filter(value => published_pools.includes(value));
      if (open_pools === undefined) return [];
      else return open_pools;
    },

    upcomingIDs_comp() {
      let pools = this.getPoolIDsByStatus("upcoming");
      if (pools === undefined) return [];
      else return pools;
    },

    featuredIDs_sorted() {
      //check if published
      let new_featured_ids = [];
      for (const id of this.featuredIDs) {
        const temp_pool = this.getPoolByID(id);
        if (temp_pool === undefined) return [];
        else if (temp_pool.status !== "draft") {
          new_featured_ids.push(id);
        }
      }
      return this.sortPools(new_featured_ids);
    }
  },
  methods: {
    ...mapActions("pools", [
      "getAllChainPools",
      "getFeaturedChainPools",
      "getUpcomingChainPools"
    ]),

    sortPools(id_list) {
      let result = [];
      let open = this.getPoolIDsByStatus("open");
      let upcoming = this.getPoolIDsByStatus("upcoming");
      let completed = this.getPoolIDsByStatus("completed");
      let filled = this.getPoolIDsByStatus("filled");
      let cancelled = this.getPoolIDsByStatus("cancelled");
      result = result.concat(
        this.claimableIDs,
        open,
        upcoming,
        completed,
        filled,
        cancelled
      );
      result = result.filter(value => id_list.includes(value));
      result = [...new Set(result)]; // remove duplicates
      // console.log(result);
      return result;
    },

    beforeAppear: function(el) {
      // console.log("beforeAppear");
    },
    appear: function(el) {
      // console.log("appear!");
    },
    afterAppear: function(el) {
      // console.log("afterAppear!");
    }
  },
  async mounted() {
    console.log("Go to the ant, you sluggard! Consider her ways and be wise,")
    this.featuredIDs = await this.getFeaturedChainPools();
    if (this.featuredIDs.length === 0) this.noFeaturedPools = true;
    await this.getAllChainPools(); // TODO replace with get open pools
    this.upcomingIDs = await this.getUpcomingChainPools();
    if (this.upcomingIDs.length === 0) this.noUpcomingPools = true;
  }
};
</script>

<style lang="scss" scoped>
.header-bg {
  height: 550px;
}
.header-container {
  padding-top: 100px;
}
.header-container h2 {
  color: $secondary;
  line-height: 60px;
  font-family: poppins-regular;
  margin-top: 0px;
  margin-bottom: 15px;
  max-width: 600px;
  @media only screen and (max-width: 390px) {
    font-size: 38px;
    line-height: 50px;
  }
}
.header-container h2 span {
  color: $accent;
}
.body-container {
  padding-top: 50px;
}
h2 {
  margin-bottom: 10px;
}
// Rocket
@keyframes up_down {
  0% {
    transform: translateY(0) translateX(0);
  }
  25% {
    transform: translateY(-30px) translateX(0);
  }
  75% {
    transform: translateY(30px) translateX(0);
  }
}
@keyframes go {
  from {
    transform: translateY(150px) translateX(0);
  }
  to {
    transform: translateY(0) translateX(0);
  }
}
.rocket {
  animation: up_down;
  animation-duration: 15s;
  animation-delay: 1s;
  animation-iteration-count: infinite;
  position: relative;
  min-width: 250px;
}
.rocket img {
  max-width: 300px;
}
.fade-enter-active {
  animation: go 2s;
  animation-timing-function: cubic-bezier(0.32, 0.45, 0.07, 1.03);
}
.space-bubble {
  width: 450px;
  position: relative;
  &:nth-of-type(1) {
    transform: rotate(-20deg) scale(0.85);
  }
  &:nth-of-type(2) {
    top: -80px;
  }
  &:nth-of-type(3) {
    transform: rotate(0deg);
  }
}
</style>
