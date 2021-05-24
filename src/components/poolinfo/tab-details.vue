<template>
  <div class="details-tab">
    <div>
      <h6>Type:</h6>
      <h5>{{ pool.access_type }}</h5>
    </div>
    <div>
      <h6>Whitelist:</h6>
      <h5>{{ hasWhitelist ? "Yes" : "No" }}</h5>
      <q-btn
        v-if="hasWhitelist && !whitelisted"
        outline
        color="primary"
        label="Apply"
        class="q-ml-sm"
        type="a"
        target="_blank"
        :href="
          pool.web_links.filter(a => a.key === 'whitelist').map(a => a.value)
        "
      />
    </div>
    <div>
      <h6>Opening Time:</h6>
      <h5>{{ this.$toDate(pool.pool_open) }}</h5>
    </div>
    <div v-if="pool.access_type === 'Premium'">
      <h6>Closing Time (Premium):</h6>
      <h5>{{ this.$toDate(pool.private_end) }}</h5>
    </div>
    <div v-if="pool.public_end > pool.private_end">
      <h6>Closing Time (Public):</h6>
      <h5>{{ this.$toDate(pool.public_end) }}</h5>
    </div>
    <div>
      <h6>Minimum Allocation:</h6>
      <h5>{{ this.$chainStrReformat(pool.minimum_swap) }}</h5>
    </div>
    <div>
      <h6>Maximum Allocation:</h6>
      <h5>{{ this.$chainStrReformat(pool.maximum_swap) }}</h5>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
export default {
  name: "tab-details",
  props: {
    pool: {
      required: true
    }
  },
  created() {
    // console.log("tab created");
  },
  computed: {
    ...mapGetters("account", ["isAuthenticated", "accountName"]),
    hasWhitelist() {
      return this.pool.whitelist.length > 0;
    },
    whitelisted() {
      if (this.pool.whitelist.includes(this.accountName)) {
        return true;
      } else {
        return false;
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.details-tab div {
  display: flex;
  justify-content: space-between;
  font-weight: 500;
  flex-wrap: wrap;
  align-items: center;
  padding-bottom: 8px;
}
.details-tab div h6 {
  min-width: 200px;
}
.details-tab div h5 {
  flex-grow: 4;
  display: flex;
  @media screen and (max-width: 550px) {
    justify-content: flex-start;
    line-height: 24px;
  }
  @media screen and (min-width: 551px) {
    justify-content: flex-end;
  }
}
</style>
