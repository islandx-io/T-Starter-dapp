<template>
  <div
    v-if="moonpayActive === true && Object.keys(moonpayTx).length > 0"
    class="row justify-start items-center content-center"
  >
    <!-- {{ moonpayActive }}
    {{ Object.keys(moonpayTx).length > 0 }} -->
    <!-- <div class="text-weight-bold">Transaction status:</div> -->
    <div class="q-pt-md col-auto ">
      <q-spinner-gears size="30px" color="primary" />
    </div>
    <div class="q-pt-md q-pl-sm col-auto">{{ status }}</div>
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
