<template>
  <!-- And do not be conformed to this world, but be transformed by the renewing of your mind, 
that you may prove what is that good and acceptable and perfect will of God. - Romans 12:2 -NKJV -->
  <q-page>
    <section class="space-bg">
      <div class="header-container row reverse-wrap justify-between">
        <div class="column justify-evenly">
          <h2>
            The place to discover and<br />
            <span>back projects</span>
            building on Telos
          </h2>
          <router-link to="/pools">
            <q-btn outline color="secondary">VIEW ALL POOLS</q-btn>
          </router-link>
        </div>
        <div class="rocket col row justify-center">
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
        <Poolcard
          class="col"
          v-for="id in poolIDs"
          :key="'upcoming-' + id"
          :poolID="id"
        ></Poolcard>
        <h2 class="col-12 text-center q-pt-xl">Featured Pools</h2>
        <Poolcard
          class="col"
          v-for="id in poolIDs"
          :key="'featured-' + id"
          :poolID="id"
        ></Poolcard>
        <router-link to="/pools" class="col-12">
          <q-btn outline color="accent">VIEW ALL POOLS</q-btn>
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
    return {};
  },
  computed: {
    ...mapGetters("pools", ["getAllPoolIDs"]),
    poolIDs: function() {
      return this.getAllPoolIDs;
    }
  },
  methods: {
    ...mapActions("pools", ["getAllChainPools"])
  },
  async mounted() {
    await this.getAllChainPools();
  }
};
</script>

<style lang="scss" scoped>
.space-bg {
  background-image: url("~assets/index/clouds-head.png");
  height: 550px;
}
.header-container h2 {
  color: $secondary;
  line-height: 60px;
  font-family: poppins-regular;
  margin-top: 0px;
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
</style>
