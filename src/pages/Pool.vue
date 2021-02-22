<template>
  <!-- NOTE lifecycle hooks of the component will not be called -->
  <!-- TODO Page not found -->
  <q-page>
    <!-- content -->
    <div>Params: {{ this.$route.params }} Query: {{ this.$route.query }}</div>
    <q-btn class="current nav-item" data-filter=".all" label="Stuff1" />
    <q-btn class="current nav-item" data-filter=".all" label="Stuff2" />
    <div>  </div>

  </q-page>
</template>

<script>
export default {
  // name: 'PageName',
  data() {
    return {
      // poolID: $route.params.poolID
    }
  }
};
</script>
