<template>
  <div class="details-tab">
    <div>
      <p>Type:</p>
      <p>{{ pool.access_type }}</p>
    </div>
    <div>
      <p>Sale open:</p>
      <p>{{ this.$toDate(pool.pool_open) }}</p>
    </div>
    <div v-if="pool.access_type === 'Private'">
      <p>Private sale end:</p>
      <p>{{ this.$toDate(pool.private_end) }}</p>
    </div>
    <div>
      <p>Public sale end:</p>
      <p>{{ this.$toDate(pool.public_end) }}</p>
    </div>
    <div>
      <p>Minimum allocation:</p>
      <p>{{ pool.minimum_swap }}</p>
    </div>
    <div>
      <p>Maximum allocation:</p>
      <p>{{ pool.maximum_allocation }}</p>
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
}
.details-tab div p {
  min-width: 200px;
}
.details-tab div p + p {
  color: $primary;
  font-size: 20px;
  flex-grow: 4;
  // min-width: 500px;
  display: flex;
  @media screen and (max-width: 550px) {
    justify-content: flex-start;
  }
  @media screen and (min-width: 580px) {
    justify-content: flex-end;
  }
}
</style>
