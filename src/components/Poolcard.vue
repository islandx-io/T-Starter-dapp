<template>
  <!-- TODO class joined, featured, created, all -->
  <router-link
    class="router-link pool-card row"
    :to="{ name: 'pooldetails', params: { id: poolID } }"
  >
    <q-card flat class="col bg-secondary text-black">
      <q-item>
        <q-item-section top>
          <q-avatar :size="avatar_size.toString() + 'px'">
            <img v-if="avatar" :src="avatar" width="100px" alt="image" />
            <div v-else v-html="identicon" />
          </q-avatar>
        </q-item-section>
        <q-item-section top side>
          <div class="text-accent column items-center justify-between">
            <status-badge :poolStatus="pool_status" />
            <status-countdown
              v-if="pool_status === 'upcoming'"
              :deadline="pool_open"
              mini
            />
          </div>
        </q-item-section>
      </q-item>
      <q-card-section class="title-section">
        <h3 class="title">{{ title }}</h3>
      </q-card-section>
      <q-card-section class="row content-end">
        <div class="col-12 row justify-between">
          <div>
            <div class="text-h6">Hard cap</div>
            <p class="info-value">{{ parseFloat(hard_cap).toFixed(2) }}</p>
          </div>
          <div>
            <div class="text-h6">Access</div>
            <p class="info-value">{{ access_type }}</p>
          </div>
        </div>
        <div class="col-12" v-if="['open', 'closed'].includes(pool_status)">
          <div class="text-h6 q-pb-xs">Sale progress</div>
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
        </div>
      </q-card-section>
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
      avatar_size: 60, // (px)
      title: "Loading",
      slug: "loading",
      hard_cap: 0,
      minimum: "TBA",
      maximum: "TBA",
      type: "Fixed",
      access_type: "Private",
      progress: 0.4,
      participants: 0,
      avatar: "",
      pool_status: "loading",
      pool_open: new Date(),
      polling: null
    };
  },
  computed: {
    ...mapGetters("pools", ["getAllPools", "getPoolByID", "getAllPoolIDs"]),
    progressToPercentage() {
      return this.progress * 100 + "%";
    },
    identicon() {
      return toSvg(this.poolID, this.avatar_size);
    }
  },
  methods: {
    ...mapActions("pools", ["updatePoolStatus"]),
    getPoolInfo: function() {
      const poolJSON = this.getPoolByID(this.poolID);

      this.title = poolJSON.title;
      this.slug = poolJSON.slug;
      this.hard_cap = poolJSON.hard_cap;
      this.minimum = poolJSON.minimum_swap;
      this.maximum = poolJSON.maximum_allocation;
      this.type = poolJSON.type;
      // this.access_type = poolJSON.access_type;
      this.participants = poolJSON.participants;
      this.avatar = poolJSON.avatar;
      this.pool_status = poolJSON.status;
      this.pool_open = poolJSON.pool_open;
    }
  },
  mounted() {
    this.updatePoolStatus(this.poolID);
    this.getPoolInfo();
    // Start polling every 2min for any updates
    this.polling = setInterval(() => {
      this.updatePoolStatus(this.poolID);
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
  margin-bottom: 10px;
}
</style>
