<template>
  <router-link
    class="router-link"
    :to="{ name: 'pooldetails', params: { id: poolID } }"
  >
    <q-card class="col bg-secondary text-black self-stretch">
      <q-item>
        <q-item-section top>
          <q-avatar :size="avatar_size.toString() + 'px'">
            <q-img v-if="pool.avatar" :src="pool.avatar" style="width: 100px">
              <template v-slot:error>
                <div
                  class="transparent"
                  style="padding: 0"
                  v-html="identicon"
                />
              </template>
            </q-img>
            <div v-else v-html="identicon" />
          </q-avatar>
        </q-item-section>
        <q-item-section top side>
          <div class="text-accent column items-end justify-between">
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
import { toSvg } from "jdenticon";
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
  components: { statusBadge, statusCountdown, statusProgress },
  data() {
    return {
      pool: this.$defaultPoolInfo,
      avatar_size: 60, // (px)
      polling: null
    };
  },
  computed: {
    ...mapGetters("pools", ["getAllPools", "getPoolByID", "getAllPoolIDs"]),

    identicon() {
      return toSvg(this.poolID, this.avatar_size);
    },
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
.q-card {
  transition: all 0.3s ease-in-out;
  min-width: 300px;
  max-width: 600px;
  padding: 10px;
  border-radius: $card-corner-radius;
  border-color: $secondary;
  box-shadow: 0 0 35px 0 rgba(0, 0, 0, 0.08);
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
