<template>
  <div>
    <div>Access type: {{ access_type }}</div>
    <div>Sale open: {{ toDate(pool_open) }}</div>
    <div>Private sale end: {{ toDate(private_end) }}</div>
    <div>Public sale end: {{ toDate(public_end) }}</div>
    <div>Min investement per wallet: {{ minimum_swap }}</div>
    <div>Max investement per wallet: {{ maximum_allocation }}</div>
  </div>
</template>

<script>
import { date } from 'quasar';

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
      pool_open: "Loading",
      private_end: "Loading",
      public_end: "Loading",
      minimum_swap: "Loading",
      maximum_allocation: "Loading"
    };
  },
  computed: {
    epochTimeToDate() {
      return "";
    },
  },
  methods: {
    toDate(timeStamp){
      return date.formatDate(timeStamp, 'DD MMMM YYYY, HH:mm UTC');
    }
  },
  watch: {
    // to reload info if changed
    poolObject: function() {
      // this.access_type = this.poolObject.access_type,
      this.pool_open = this.poolObject.pool_open,
      this.private_end = this.poolObject.private_end,
      this.public_end = this.poolObject.public_end,
      this.minimum_swap = this.poolObject.minimum_swap,
      this.maximum_allocation = this.poolObject.maximum_allocation
    }
  }
};
</script>
