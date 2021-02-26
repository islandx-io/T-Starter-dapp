<template>
  <div>
    <div>Access type: {{ access_type }}</div>
    <div>Sale open: {{ start_date }}</div>
    <div>Private sale end: {{ end_private_date }}</div>
    <div>Public sale end: {{ end_public_date }}</div>
    <div>Min investement per wallet: {{ minimum_allocation_per_wallet }}</div>
    <div>Max investement per wallet: {{ max_eth_allocation }}</div>
  </div>
</template>

<script>
export default {
  name: "tab-details",
  props: {
    poolObject: {
      required: true
    }
  },
  data() {
    return {
      access_type: "Loading",
      start_date: "Loading",
      end_private_date: "Loading",
      end_public_date: "Loading",
      minimum_allocation_per_wallet: "Loading",
      max_eth_allocation: "Loading"
    };
  },
  computed: {
    epochTimeToDate() {
      return "";
    }
  },
  watch: {
    // to reload info if changed
    poolObject: function() {
      this.access_type = this.poolObject.access_type,
      this.start_date = this.poolObject.start_date,
      this.end_private_date = this.poolObject.end_private_date,
      this.end_public_date = this.poolObject.end_public_date,
      this.minimum_allocation_per_wallet = this.poolObject.minimum_allocation_per_wallet,
      this.max_eth_allocation = this.poolObject.max_eth_allocation
    }
  }
};
</script>
