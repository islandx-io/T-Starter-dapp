<template>
  <div class="progress-bar">
    <div
      role="progressbar"
      :style="{ width: progressToPercentage }"
      :aria-valuenow="progress"
      aria-valuemin="0"
      aria-valuemax="1"
    >
      {{ progressToPercentage }}
    </div>
  </div>
</template>

<script>
export default {
  name: "status-progress",
  props: {
    progress: {
      required: true
    }
  },
  computed: {
    progressToPercentage() {
      var result = Number.parseFloat(this.progress) * 100;
      if (isNaN(result)) result = 0;
      if (result <= 0) {
        result = "";
      } else {
        result = result.toFixed(0) + "%";
      }
      return result;
    }
  }
};
</script>

<style lang="scss" scoped>
.progress-bar {
  color: $dark;
  display: flex;
  height: 1rem;
  overflow: hidden;
  font-size: 0.75rem;
  background-color: #e9ecef;
  border-radius: 0.25rem;
}
.progress-bar div {
  display: flex;
  flex-direction: column;
  justify-content: center;
  color: white;
  text-align: center;
  background-color: $primary;
  transition: width 0.6s ease;
}
</style>
