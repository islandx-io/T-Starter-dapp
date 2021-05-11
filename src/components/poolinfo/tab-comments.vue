<template>
  <div class="comments-tab">
    Comments
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
export default {
  name: "tab-comments",
  props: {
    pool: {
      required: true
    }
  },
  computed: {
    ...mapGetters("account", ["isAuthenticated", "accountName"]),
    hasWhitelist() {
      return this.pool.whitelist.length > 0;
    }
  }
};
</script>

<style lang="scss" scoped></style>
