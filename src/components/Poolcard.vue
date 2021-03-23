<template>
  <router-link
    class="router-link"
    :to="{ name: 'pooldetails', params: { id: poolID } }"
    :event="clickable ? '' : 'click'"
  >
    <q-card
      :class="
        `col bg-secondary text-black self-stretch ` +
          `${claimable ? 'claimable' : ''}`
      "
    >
      <q-item>
        <q-item-section top>
          <token-avatar :avatar="pool.avatar" :avatarSize="60" />
        </q-item-section>
        <q-item-section top side>
          <div class="text-accent column items-end justify-between">
            <status-badge :poolStatus="pool.pool_status" />
            <status-countdown
              v-if="pool.pool_status === 'upcoming'"
              :deadline="pool.pool_open"
              mini
              @countdown-finished="getPoolInfo"
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
          v-if="['open', 'completed'].includes(pool.pool_status)"
        >
          <div class="text-h6 q-py-xs">Progress</div>
          <status-progress :progress="pool.progress" />
        </div>
      </q-card-section>
      <!-- if owner of pool -->
      <q-card-section v-if="created === true" class="row justify-center">
        <q-btn
          outline
          color="primary"
          :to="{ name: 'updatepool', params: { id: poolID } }"
          label="Update pool"
        />
      </q-card-section>
      <q-inner-loading :showing="poolID === -1">
        <q-spinner-puff size="50px" color="primary" />
      </q-inner-loading>
    </q-card>
  </router-link>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import tokenAvatar from "src/components/TokenAvatar";
import statusBadge from "src/components/poolinfo/status-badge";
import statusCountdown from "src/components/poolinfo/status-countdown";
import statusProgress from "src/components/poolinfo/status-progress";

export default {
  name: "Poolcard",
  props: {
    poolID: {
      type: Number,
      default: 0,
      required: true
    },
    created: {
      default: false,
      required: false
    }
  },
  components: { statusBadge, statusCountdown, statusProgress, tokenAvatar },
  data() {
    return {
      pool: this.$defaultPoolInfo,
      polling: null,
      claimable: false
    };
  },
  computed: {
    ...mapGetters("pools", ["getAllPools", "getPoolByID", "getAllPoolIDs"]),
    ...mapGetters("account", ["isAuthenticated", "accountName"]),

    hardCap() {
      if (this.pool.hard_cap === "Loading") {
        return this.pool.hard_cap;
      } else {
        return (
          parseFloat(this.pool.hard_cap).toFixed(2) +
          " " +
          this.pool.base_token.sym.split(",")[1]
        );
      }
    },
    clickable() {
      return this.poolID === -1;
    }
  },
  methods: {
    ...mapActions("pools", ["getAllocationByPool"]),

    getPoolInfo: function() {
      const pool = this.getPoolByID(this.poolID);
      if (pool !== undefined) {
        this.pool = pool;
      }
    },

    hasAllocations(data) {
      return Object.keys(data).length > 0;
    },

    async getClaimStatus() {
      let payload = { account: this.accountName, poolID: this.pool.id };
      let allocation = await this.getAllocationByPool(payload);
      if (this.hasAllocations(allocation) && this.pool.status === ("success" || "fail")) {
        this.claimable = true
      }
    },
  },
  async mounted() {
    this.getPoolInfo();
    await this.getClaimStatus();
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
.q-card {
  transition: all 0.3s ease-in-out;
  min-width: 300px;
  max-width: 600px;
  padding: 10px;
  border-radius: $card-corner-radius;
  border-color: $secondary;
  box-shadow: 0 0 35px 0 rgba(0, 0, 0, 0.08);
  &.claimable {
    border: 1px solid $accent;
  }
}
.q-card:hover {
  transform: scale(1.05);
  z-index: 2;
}
.q-card .bottom-section {
  padding-bottom: 8px;
}

.q-card .title-section {
  min-height: 48px;
}
.q-card .title {
  margin: 0;
  padding: 0;
}
.q-card .info-value {
  line-height: 30px;
  font-size: 20px;
  color: $primary;
  margin-bottom: 0px;
}
</style>
