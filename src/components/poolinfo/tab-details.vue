<template>
  <div class="details-tab">
    <div>
      <p>Type:</p>
      <h5>{{ pool.access_type }}</h5>
    </div>
    <div>
      <p>Sale open:</p>
      <h5>{{ this.$toDate(pool.pool_open) }}</h5>
    </div>
    <div v-if="pool.access_type === 'Private'">
      <p>Private sale end:</p>
      <h5>{{ this.$toDate(pool.private_end) }}</h5>
    </div>
    <div>
      <p>Public sale end:</p>
      <h5>{{ this.$toDate(pool.public_end) }}</h5>
    </div>
    <div>
      <p>Minimum allocation:</p>
      <h5>{{ pool.minimum_swap }}</h5>
    </div>
    <div>
      <p>Maximum allocation:</p>
      <h5>{{ pool.maximum_allocation }}</h5>
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
