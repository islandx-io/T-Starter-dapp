<template>
  <div :class="poolStatus + '-badge'">
    <div>{{ statusMessage }}</div>
  </div>
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
.base-badge {
  border-radius: 15px;
  max-height: 30px;
  padding: 5px 10px;
  color: white;
  font-weight: bolder;
}
.upcoming-badge {
  @extend .base-badge;
  background-color: $accent;
}
.open-badge {
  @extend .base-badge;
  background-color: $positive;
}
.closed-badge {
  @extend .base-badge;
  background-color: $warning;
}
.loading-badge {
  @extend .base-badge;
  background-color: $loading;
}
</style>
