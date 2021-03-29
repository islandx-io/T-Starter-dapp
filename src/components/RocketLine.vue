<template>
  <div class="row items-start justify-center">
    <svg class="dash-left" width="100" height="20" style="margin-right: 30px">
      <g fill="none" stroke-width="4">
        <path class="dashed1" stroke-dasharray="5, 5" d="M5 20 l215 0" />
        <path class="dashed2" stroke-dasharray="5, 5" d="M5 20 l215 0" />
      </g>
    </svg>
    <img src="~/assets/logo/flaticonrocket.svg" alt="rocket" />
    <svg
      class="dash-right"
      width="100"
      height="20"
      style="margin-left: 20px; margin-right: 10px"
    >
      <g fill="none" stroke-width="4">
        <path class="dashed1" stroke-dasharray="5, 5" d="M5 20 l215 0" />
        <path class="dashed2" stroke-dasharray="5, 5" d="M5 20 l215 0" />
      </g>
    </svg>
  </div>
</template>

<script>
export default {};
</script>

<style lang="scss" scoped>
$stroke-dashoffset: 100;

@keyframes dash_animation {
  to {
    stroke-dashoffset: 0;
  }
}
.dashed1 {
  animation-iteration-count: 1;
  animation: dash_animation 1.5s linear forwards;
  stroke: $primary;
  stroke-dashoffset: $stroke-dashoffset;
  stroke-dasharray: $stroke-dashoffset;
  text-align: center;
}
.dash-right .dashed1 {
  stroke-dashoffset: -$stroke-dashoffset;
}
.dashed2 {
  stroke: $secondary;
  stroke-dasharray: 4px;
}
</style>
