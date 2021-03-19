<template>
  <div class="details-tab">
    <div>
      <h6>Type:</h6>
      <h5>{{ pool.access_type }}</h5>
    </div>
    <div>
      <h6>Opening Time:</h6>
      <h5>{{ this.$toDate(pool.pool_open) }}</h5>
    </div>
    <div v-if="pool.access_type === 'Private'">
      <h6>Private Closing Time:</h6>
      <h5>{{ this.$toDate(pool.private_end) }}</h5>
    </div>
    <div>
      <h6>Public Closing Time:</h6>
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
export default {
  name: "tab-details",
  props: {
    pool: {
      required: true
    }
  },
  created() {
    console.log("tab created");
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
  }
  @media screen and (min-width: 580px) {
    justify-content: flex-end;
  }
}
</style>
