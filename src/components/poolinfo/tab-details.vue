<template>
  <div>
    <!-- <div>Access type: {{ access_type }}</div> -->
    <div>Sale open: {{ toDate(poolObject.pool_open) }}</div>
    <div>Private sale end: {{ toDate(poolObject.private_end) }}</div>
    <div>Public sale end: {{ toDate(poolObject.public_end) }}</div>
    <div>Min investement per wallet: {{ poolObject.minimum_swap }}</div>
    <div>Max investement per wallet: {{ poolObject.maximum_allocation }}</div>
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
  },
  methods: {
    toDate(timeStamp){
      return date.formatDate(timeStamp, 'DD MMMM YYYY, HH:mm UTC');
    }
  },
  watch: {
  }
};
</script>
