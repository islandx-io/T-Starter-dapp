<template>
  <div v-if="isCurrent" class="current-tier" id="idCurrentTier">
    <svg
      :width="`${badgeSize}px`"
      :height="`${badgeSize}px`"
      aria-hidden="true"
      focusable="false"
      data-icon="certificate"
      role="img"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
    >
      <linearGradient id="goldenGradient" gradientTransform="rotate(120)">
        <stop offset="0%" stop-color="#f2d00f" />
        <stop offset="80%" stop-color="#d19f21" />
      </linearGradient>
      <path
        d="M458.622 255.92l45.985-45.005c13.708-12.977 7.316-36.039-10.664-40.339l-62.65-15.99 17.661-62.015c4.991-17.838-11.829-34.663-29.661-29.671l-61.994 17.667-15.984-62.671C337.085.197 313.765-6.276 300.99 7.228L256 53.57 211.011 7.229c-12.63-13.351-36.047-7.234-40.325 10.668l-15.984 62.671-61.995-17.667C74.87 57.907 58.056 74.738 63.046 92.572l17.661 62.015-62.65 15.99C.069 174.878-6.31 197.944 7.392 210.915l45.985 45.005-45.985 45.004c-13.708 12.977-7.316 36.039 10.664 40.339l62.65 15.99-17.661 62.015c-4.991 17.838 11.829 34.663 29.661 29.671l61.994-17.667 15.984 62.671c4.439 18.575 27.696 24.018 40.325 10.668L256 458.61l44.989 46.001c12.5 13.488 35.987 7.486 40.325-10.668l15.984-62.671 61.994 17.667c17.836 4.994 34.651-11.837 29.661-29.671l-17.661-62.015 62.65-15.99c17.987-4.302 24.366-27.367 10.664-40.339l-45.984-45.004z"
      />
      <text
        x="50%"
        y="32%"
        dominant-baseline="central"
        text-anchor="middle"
        :fill="textColor"
        class="svg-text"
        :style="`font-size: ${16 * (512 / badgeSize)}px; font-weight: 800;`"
      >
        VIP
      </text>
      <text
        x="50%"
        y="64%"
        dominant-baseline="central"
        text-anchor="middle"
        :fill="textColor"
        class="svg-text"
        :style="`font-size: ${28 * (512 / badgeSize)}px; font-weight: 800;`"
      >
        {{ tier }}
      </text>
    </svg>
  </div>
  <div
    v-else
    class="tier"
    :style="`width: ${badgeSize - 15}px; height: ${badgeSize - 15}px;`"
  >
    {{ tier }}
    <q-tooltip v-if="tier > 0" :offset="[0, 5]"
      >Stake {{ vipStakeAmount }} START</q-tooltip
    >
  </div>
</template>

<script>
export default {
  props: {
    tier: Number,
    isCurrent: Boolean,
    badgeSize: { type: Number, default: 60 }
  },
  data() {
    return {
      textColor: "#f9fbfe"
    };
  },
  computed: {
    vipStakeAmount() {
      switch (this.tier) {
        case 1:
          return "6,250";
          break;
        case 2:
          return "12,500";
          break;
        case 3:
          return "25,000";
          break;
        case 4:
          return "50,000";
          break;
        case 5:
          return "100,000";
          break;
        default:
          return "0";
          break;
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.tier,
.current-tier {
  font-size: 0;
}
.tier {
  font-weight: 500;
  margin: 5px;
  font-size: 32px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: $loading;
  color: $secondary;
  border-radius: 50%;
}
.current-tier {
  text-shadow: 0px 0.5px 0px rgba(0, 0, 0, 0.3);
  font-size: 0;
}
#idCurrentTier path {
  fill: url(#goldenGradient);
}
</style>
