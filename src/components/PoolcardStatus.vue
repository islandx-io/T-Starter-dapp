<template>
  <div class="text-caption">Live in 5 days</div>
  <!-- <q-badge :color="statusColor">{{ statusMessage }}</q-badge> -->
</template>

<script>
export default {
  name: "poolcard-status"
  // props: {
  //   poolStatus: {
  //     type: String, //
  //     required: true
  //   }
  // },
  // computed: {
  //   statusColor: function() {
  //     switch (this.poolStatus.toLowerCase()) {
  //       case "loading":
  //         return "blue-grey";
  //       case "open":
  //         return "primary";
  //       case "closed":
  //         return "warning";
  //       case "upcoming":
  //         return "accent";
  //       case "filled":
  //         return "positive";
  //       case "canceled":
  //         return "warning";
  //       default:
  //         return "blue-grey";
  //     }
  //   },
  //   statusMessage() {
  //     return this.poolStatus[0].toUpperCase() + this.poolStatus.slice(1);
  //   }
  // }
};
</script>
