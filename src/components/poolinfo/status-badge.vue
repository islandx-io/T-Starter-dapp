<template>
  <q-chip :class="poolStatus + '-badge text-weight-bold'" text-color="secondary"
    >{{ statusMessage }}
  </q-chip>
</template>

<script>
export default {
  name: "status-badge",
  props: {
    poolStatus: {
      type: String,
      required: true
    }
  },
  computed: {
    statusMessage() {
      return this.poolStatus[0].toUpperCase() + this.poolStatus.slice(1);
    }
  }
};
</script>

<style lang="scss" scoped>
.upcoming-badge {
  background-color: $accent;
}
.open-badge {
  background-color: $positive;
}
.closed-badge {
  background-color: $warning;
}
.loading-badge {
  background-color: $loading;
}
</style>
