<template>
  <router-link
    class="router-link pool-card row"
    :to="{ name: 'pooldetails', params: { id: poolID } }"
  >
    <q-card flat class="col bg-secondary text-black relative-position">
      <q-item>
        <q-item-section top>
          <q-avatar :size="avatar_size.toString() + 'px'">
            <img
              v-if="pool.avatar"
              :src="pool.avatar"
              width="100px"
              alt="image"
            />
            <div v-else v-html="identicon" />
          </q-avatar>
        </q-item-section>
        <q-item-section top side>
          <div class="text-accent column items-center justify-between">
            <status-badge :poolStatus="pool.pool_status" />
            <status-countdown
              v-if="pool.pool_status === 'upcoming'"
              :deadline="pool.pool_open"
              mini
            />
          </div>
        </q-item-section>
      </q-item>
      <q-card-section class="title-section">
        <h3 class="title">{{ pool.title }}</h3>
      </q-card-section>
      <q-card-section class="bottom-section row content-end">
        <div class="col-12 row justify-between">
          <div>
            <div class="text-h6">Hard cap</div>
            <p class="info-value">{{ hardCap }}</p>
          </div>
          <div>
            <div class="text-h6">Access</div>
            <p class="info-value">{{ pool.access_type }}</p>
          </div>
        </div>
        <div
          class="col-12"
          v-if="['open', 'closed'].includes(pool.pool_status)"
        >
          <div class="text-h6 q-py-xs">Sale progress</div>
          <div class="progress-bar">
            <div
              role="progressbar"
              :style="{ width: progressToPercentage }"
              :aria-valuenow="pool.progress"
              aria-valuemin="0"
              aria-valuemax="1"
            >
              {{ progressToPercentage }}
            </div>
          </div>
        </div>
      </q-card-section>

      <q-inner-loading :showing="poolID === -1">
        <q-spinner-puff size="50px" color="primary" />
      </q-inner-loading>
    </q-card>
  </router-link>
</template>

<script>
import { date } from "quasar";
import { mapGetters, mapActions } from "vuex";
import { toSvg } from "jdenticon";
import statusBadge from "src/components/poolinfo/status-badge";
import statusCountdown from "src/components/poolinfo/status-countdown";

export default {
  name: "Poolcard",
  props: {
    poolID: {
      type: Number,
      default: 0,
      required: true
    }
  },
  components: { statusBadge, statusCountdown },
  data() {
    return {
      pool: this.$defaultPoolInfo,
      avatar_size: 60, // (px)
      polling: null
    };
  },
  computed: {
    ...mapGetters("pools", ["getAllPools", "getPoolByID", "getAllPoolIDs"]),
    progressToPercentage() {
      var progress = Number(this.pool.progress);
      if (isNaN(progress)) progress = 0;
      if (progress <= 0) {
        progress = "";
      } else {
        progress = progress * 100 + "%";
      }
      return progress;
    },
    identicon() {
      return toSvg(this.poolID, this.avatar_size);
    },
    hardCap() {
      if (this.pool.hard_cap === "Loading") {
        return this.pool.hard_cap;
      } else {
        return parseFloat(this.pool.hard_cap).toFixed(2);
      }
    }
  },
  methods: {
    getPoolInfo: function() {
      const pool = this.getPoolByID(this.poolID);
      if (pool !== undefined) {
        this.pool = pool;
      }
    }
  },
  mounted() {
    this.getPoolInfo();
    // Start polling every 2min for any updates
    this.polling = setInterval(() => {
      this.getPoolInfo();
    }, 120000);
  },
  beforeDestroy() {
    clearInterval(this.polling);
  }
};
</script>

<style lang="scss" scoped>
.pool-card {
  transition: all 0.3s ease-in-out;
  min-width: 300px;
  max-width: 600px;
  padding: 10px;
  border-radius: $card-corner-radius;
  border-color: $secondary;
  box-shadow: 0 0 35px 0 rgba(0, 0, 0, 0.08);
}
.pool-card:hover {
  transform: scale(1.05);
  z-index: 2;
}
.pool-card .bottom-section {
  padding-bottom: 8px;
}
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

.pool-card .title-section {
  min-height: 48px;
}
.pool-card .title {
  margin: 0;
  padding: 0;
}
.pool-card .info-value {
  line-height: 30px;
  font-size: 20px;
  color: $primary;
  margin-bottom: 0px;
}
</style>
