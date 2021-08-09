<template>
  <div v-if="moonpayActive === true && Object.keys(moonpayTx).length > 0">
    <!-- {{ moonpayActive }}
    {{ Object.keys(moonpayTx).length > 0 }} -->
    <h3>Transaction status:</h3>
    <!-- TODO Loading icon -->
    <div>{{ status }}</div>
  </div>
</template>

<script>
export default {
  // name: "moonpay-processing",
  props: {
    moonpayTx: {
      default: {}
    },
    moonpayActive: {
      default: false
    }
  },

  data() {
    return {};
  },

  computed: {
    status() {
      if (Object.keys(this.moonpayTx).length > 0) {
        return this.capitalize(this.moonpayTx.status);
      } else {
        return "";
      }
    },
    stages() {
      if (Object.keys(this.moonpayTx).length > 0) {
        return this.moonpayTx.stages;
      } else {
        return "";
      }
    }
  },

  methods: {
    capitalize(str) {
      return str.charAt(0).toUpperCase() + str.slice(1);
    }
  }
};
</script>
