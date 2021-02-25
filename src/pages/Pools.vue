<template>
  <q-page>
    <title>T-STARTER - Pools</title>
    <section class="page-banner row content-center justify-center">
      <h2 class="text-white">Pools</h2>
    </section>

    <section>
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

      <q-tab-panels v-model="tab" animated>
        <q-tab-panel name="all-pools">
          <div class="row featuredContainer q-gutter-md">
            <Poolcard />
            <Poolcard />
            <Poolcard />
          </div>
        </q-tab-panel>

        <q-tab-panel name="featured-pools">
          <div class="row featuredContainer q-gutter-md">
            <Poolcard />
            <Poolcard />
          </div>
        </q-tab-panel>

        <q-tab-panel name="joined-pools">
          <div class="row featuredContainer q-gutter-md">
            <Poolcard />
          </div>
        </q-tab-panel>

        <q-tab-panel name="created-pools">
          <div class="row featuredContainer q-gutter-md">
            <Poolcard />
            <Poolcard />
          </div>
        </q-tab-panel>
      </q-tab-panels>
    </section>
  </q-page>
</template>

<script>
import Poolcard from "src/components/Poolcard.vue";
export default {
  components: { Poolcard },
  // name: 'Pools',
  data() {
    return {
      tab: "all-pools"
    };
  }
};
</script>

<style lang="scss" scoped>
.page-banner {
  background-image: url("~assets/index/clouds-head.png");
  height: 200px;
}
</style>
