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
          <router-link class="router-link " to="/pools">
            <q-btn class="hover-accent" color="secondary" outline
              >VIEW ALL POOLS</q-btn
            >
          </router-link>
        </div>
        <div class="gt-sm rocket col row justify-center">
          <img
            class="col q-pt-md"
            src="~assets/index/tstarter-rocket.svg"
            width="80%"
            alt="Illustration"
          />
        </div>
      </div>
    </section>
    <div class="body-container">
      <section class="row justify-center q-gutter-md">
        <h2 class="col-12 text-center">Upcoming Pools</h2>
        <div class="poolcard-container col" v-if="upcomingIDs.length !== 0">
          <Poolcard
            v-for="id in upcomingIDs"
            :key="'upcoming-' + id"
            :poolID="id"
          />
        </div>
        <Poolcard v-else class="col-shrink" :poolID="-1" />
        <h2 class="col-12 text-center q-pt-xl">Featured Pools</h2>
        <div class="poolcard-container col" v-if="featuredIDs.length !== 0">
          <Poolcard
            class="col"
            v-for="id in featuredIDs"
            :key="'featured-' + id"
            :poolID="id"
          />
        </div>
        <Poolcard v-else class="col-shrink" :poolID="-1" />
        <router-link
          to="/pools"
          class="router-link col-12 text-center row justify-center q-pt-md"
        >
          <q-btn outline color="accent" class="hover-accent">
            VIEW ALL POOLS
          </q-btn>
        </router-link>
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
    };
  },
  computed: {
    ...mapGetters("pools", ["getAllPoolIDs", "getPoolIDsByStatus"]),
    upcomingPools: function() {
      let pools = this.getPoolIDsByStatus("upcoming");
      if (pools === undefined) return [];
      else return pools;
    }
  },
  methods: {
    ...mapActions("pools", ["getAllChainPools", "getFeaturedChainPools", "getUpcomingChainPools"])
  },
  async mounted() {
    // await this.getAllChainPools();
    this.upcomingIDs = await this.getUpcomingChainPools();
    this.featuredIDs = await this.getFeaturedChainPools();
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
}
.header-container h2 span {
  color: $accent;
}
.rocket {
  min-width: 250px;
}
.rocket img {
  max-width: 300px;
}
.body-container {
  padding-top: 50px;
}
</style>
