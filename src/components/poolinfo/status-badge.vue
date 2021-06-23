<template>
  <q-chip
    :class="
      poolStatus +
        '-badge text-weight-bold' +
        ` ${poolStatus === 'headstart' ? 'glossy' : ''}`
    "
    text-color="secondary"
  >
    {{ statusMessage }}
  </q-chip>
</template>

<script>
export default {
  name: "status-badge",
  props: {
    poolStatus: {
      type: String,
      required: true
    },
    badgeText: {
      type: String,
      default: ""
    }
  },
  computed: {
    statusMessage() {
      if (this.badgeText !== "") return this.badgeText;
      else return this.poolStatus[0].toUpperCase() + this.poolStatus.slice(1);
    }
  }
};
</script>

<style lang="scss" scoped>
.upcoming-badge {
  background-color: $accent;
}
.open-badge,
.success-badge {
  background-color: $positive;
}
.completed-badge,
.published-badge {
  background-color: $warning;
}
.filled-badge {
  background-color: $primary;
}
.cancelled-badge,
.fail-badge {
  background-color: $space;
}
.loading-badge,
.draft-badge {
  background-color: $loading;
}
.headstart-badge {
  background-color: $positive;
}
.voting-badge {
  background-color: $accent;
}
</style>
