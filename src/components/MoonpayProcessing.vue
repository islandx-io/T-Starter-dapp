<template>
  <div>
    {{ moonpayActive }}
    {{ Object.keys(moonpayTx).length > 0 }}
    <!-- <div
      v-if="moonpayActive == true && Object.keys(moonpayTx).length > 0"
      class="q-pt-sm self-center"
    >
      Awaiting Moonpay transaction.
      <div v-if="moonpayTx.stages.length > 0" class="q-pt-sm self-center">
        Tokens ordered
      </div>
      <div
        v-if="moonpayTx.stages[3].status === 'success'"
        class="q-pt-sm self-center"
      >
        Delivery successfull
      </div>
    </div> -->
    
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
    },
  },

  data() {
    return {

    };
  }
};
</script>
