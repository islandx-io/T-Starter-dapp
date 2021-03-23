<template>
  <!-- And do not be conformed to this world, but be transformed by the renewing of your mind, 
that you may prove what is that good and acceptable and perfect will of God. - Romans 12:2 -NKJV -->
  <q-page>
    <section class="header-bg row content-start">
      <div class="header-container row reverse-wrap justify-between">
        <div class="column justify-start">
          <h2>
            The place to discover and
            <span>back projects</span>
            building on Telos
          </h2>

          <div>
            <q-btn
              class="hover-accent"
              color="secondary"
              outline
              to="/pools"
              label="VIEW ALL POOLS"
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
      <section class="row justify-center q-gutter-md">
        <!-- Featured pools -->
        <h2 class="col-12 text-center">Featured Pools</h2>
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

        <!-- Upcoming pools -->
        <h2 class="col-12 text-center q-pt-xl">Upcoming Pools</h2>
        <p class="col-12 text-center" v-if="noUpcomingPools">
          There are no upcoming pools at the moment.
        </p>
        <div
          class="poolcard-container col"
          v-else-if="upcomingIDs.length !== 0"
        >
          <Poolcard
            v-for="id in upcomingIDs"
            :key="'upcoming-' + id"
            :poolID="id"
          />
        </div>
        <Poolcard v-else class="col-shrink" :poolID="-1" />

        <!-- Open pools -->
        <h2 class="col-12 text-center q-pt-xl">Open Pools</h2>
        <p class="col-12 text-center" v-if="openIDs">
          There are no open pools at the moment.
        </p>
        <div class="poolcard-container col" v-else-if="openIDs.length !== 0">
          <Poolcard v-for="id in openIDs" :key="'open-' + id" :poolID="id" />
        </div>
        <Poolcard v-else class="col-shrink" :poolID="-1" />

        <div class="col-12 text-center row justify-center q-pt-md">
          <q-btn
            class="hover-accent"
            color="accent"
            outline
            to="/pools"
            label="VIEW ALL POOLS"
          />
        </div>
      </section>
    </div>
  </q-page>
</template>

<script>
import Poolcard from "src/components/Poolcard.vue";
import { mapGetters, mapActions } from "vuex";
export default {
  components: { Poolcard },
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
      "getPoolByID"
    ]),
    openIDs: function() {
      let pools = this.getPoolIDsByStatus("open");
      if (pools === undefined) return [];
      else return pools;
    },

    featuredIDs_sorted() {
      //check if published
      let new_featured_ids = [];
      console.log("featured");
      console.log(this.featuredIDs);
      for (const id of this.featuredIDs) {
        const temp_pool = this.getPoolByID(id);
        if (temp_pool.status !== "draft") {
          new_featured_ids.push(id);
        }
      }
      console.log("new feat sort");
      console.log(new_featured_ids);
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

    beforeAppear: function(el) {
      console.log("beforeAppear");
    },
    appear: function(el) {
      console.log("appear!");
    },
    afterAppear: function(el) {
      console.log("afterAppear!");
    }
  },
  async mounted() {
    await this.getAllChainPools();
    this.upcomingIDs = await this.getUpcomingChainPools();
    if (this.upcomingIDs.length === 0) this.noUpcomingPools = true;
    this.featuredIDs = await this.getFeaturedChainPools();
    if (this.featuredIDs.length === 0) this.noFeaturedPools = true;
  }
};
</script>

<style lang="scss" scoped>
.header-bg {
  // background-image: $header-background-url;
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
</style>
