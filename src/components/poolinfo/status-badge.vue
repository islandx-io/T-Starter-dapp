<template>
  <q-badge :color="statusColor">{{ statusMessage }}</q-badge>
</template>

<script>
export default {
  name: "status-badge",
  props: {
    poolStatus: {
      type: String, //
      required: true
    }
  },
  computed: {
    statusColor: function() {
      switch (this.poolStatus.toLowerCase()) {
        case "open":
          return "primary";
        case "closed":
          return "warning";
        case "filled":
          return "positive";
        case "canceled":
          return "warning";
        case "upcoming":
          return "accent";
        default:
          return "primary";
      }
    },
    statusMessage() {
      return this.poolStatus[0].toUpperCase() + this.poolStatus.slice(1);
    }
  }
};
</script>
