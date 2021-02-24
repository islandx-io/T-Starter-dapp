<template>
  <q-page>
    <!-- content -->
    I'm creating a pool!

    <q-input outlined v-model="poolName" label="Outlined" />

    <div class="slug-widget">
      <div class="icon-wrapper wrapper">
        <i class="fa fa-link"></i>
      </div>

      <div class="url-wrapper wrapper">
        <span class="root-url">http://tstarter.io</span>
        <span class="subdirectory-url">/pools/</span>
        <span class="slug" v-show="slug">{{ slug }}</span>
      </div>

      <div class="button-wrapper wrapper">
        <button class="button is-small">Edit</button>
      </div>
    </div>
  </q-page>
</template>


<script>
import Slug from "slug";
Slug.defaults.mode = "rfc3986";

export default {
  // name: 'PageName',
  data() {
    return {
      poolName: "",
      slug: ""
    };
  },

  methods: {
    convertName: function() {
      return Slug(this.poolName);
    }
  },

  watch: {
    poolName: _.debounce(function() {
      this.slug = this.convertName();
    }, 250) // debounce not to cause lag // TODO create API to check if unqiue & custom slug?
  },
};
</script>

<style scoped>
.slug-widget {
  display: flex;
  justify-content: flex-start;
  align-items: center;
}
.wrapper {
  margin-left: 8px;
}
.slug {
  background-color: rgb(209, 132, 16);
  padding: 3px 5px;
}
</style>
