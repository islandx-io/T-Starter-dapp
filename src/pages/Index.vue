<template>
  <q-page>
    <section class="banner-main row reverse-wrap content-center">
      <div class="banner-container">
        <div class="column justify-evenly">
          <h2 class="banner-title">
            The place to discover and<br />
            <span class="banner-title-accent">back projects</span>
            building on Telos
          </h2>
        </div>
        <q-btn outline color="secondary">VIEW ALL POOLS</q-btn>
      </div>
      <div class="banner-rocket col row justify-center">
        <img
          src="~assets/index/tstarter-rocket.svg"
          width="60%"
          alt="Illustration"
        />
      </div>
    </section>
    <section class="column items-center">
      <h2>Upcoming Pools</h2>
      <div class="q-pa-md row items-start justify-center q-gutter-md">
        <Poolcard></Poolcard>
        <Poolcard></Poolcard>
      </div>
    </section>
    <section class="column items-center">
      <h2>Featured Pools</h2>
      <div class="q-pa-md row items-start justify-center q-gutter-md">
        <Poolcard></Poolcard>
        <Poolcard></Poolcard>
      </div>
    </section>
  </q-page>
</template>

<script>
import Poolcard from "src/components/Poolcard.vue";
export default {
  components: { Poolcard }
  // name: "Index"
};
</script>

<style lang="scss" scoped>
.banner-main {
  background-image: url("~assets/index/clouds-head.png");
  height: 550px;
}
.banner-container {
  padding-left: 50px;
}
.banner-title {
  color: $secondary;
  line-height: 60px;
  font-family: poppins-regular;
}
.banner-title-accent {
  color: $accent;
}
.banner-rocket {
  min-width: 400px;
  max-width: 600px;
}
</style>
