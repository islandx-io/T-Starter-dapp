<template>
  <!-- TODO class joined, featured, created, all -->
  <q-card class="card pool bg-secondary text-black" :class="filterClass">
    <q-item class="row items-center">
      <q-item-section avatar>
        <q-avatar>
          <img v-if="image_link" :src="image_link" width="50px" alt="image" />
          <div v-else v-html="identicon" />
        </q-avatar>
      </q-item-section>
      <q-item-section top>
        <div class="text-accent column items-end">
          <status-badge :poolStatus="pool_status"></status-badge>
          <status-countdown
            v-if="pool_status === 'upcoming'"
            :deadline="start_date"
            mini
          ></status-countdown>
        </div>
      </q-item-section>
    </q-item>
    <q-card-section>
      <h3 class="item-title ">{{ title }}</h3>
      <div class="text-h6">Total raise</div>
      <p class="item-price">{{ price }}</p>
      <div class="q-col-gutter-xl row justify-between">
        <div>
          <div class="text-h6">Minimum</div>
          <p class="item-value">{{ parseFloat(minimum).toFixed(2) }}</p>
        </div>
        <div>
          <div class="text-h6">Maximum</div>
          <p class="item-value">{{ parseFloat(maximum).toFixed(2) }}</p>
        </div>
        <div>
          <div class="text-h6">Access</div>
          <p class="item-value">{{ access_type }}</p>
        </div>
      </div>
      <div class="text-h6 q-pb-xs">Sale progress</div>
      <div class="progress">
        <div
          class="progress-bar"
          role="progressbar"
          :style="{ width: progressToPercentage }"
          :aria-valuenow="progress"
          aria-valuemin="0"
          aria-valuemax="1"
        >
          {{ progressToPercentage }}
        </div>
      </div>
    </q-card-section>
    <q-card-actions vertical align="center">
      <router-link
        :to="{ name: 'pooldetails', params: { slug: slug, id: poolID } }"
      >
        <q-btn outline color="primary" class="item-btn">VIEW POOL</q-btn>
      </router-link>
    </q-card-actions>
  </q-card>
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
      title: "No Project",
      slug: "noproject",
      price: 0,
      minimum: "TBA",
      maximum: "TBA",
      type: "Fixed",
      access_type: "Private",
      progress: 0.4,
      participants: 0,
      image_link: "",
      filterClass: "created joined",
      pool_status: "loading",
      start_date: new Date(),
      polling: null
    };
  },
  computed: {
    ...mapGetters("pools", ["getAllPools", "getPoolByID", "getAllPoolIDs"]),
    progressToPercentage() {
      return (this.progress * 100).toFixed(2) + "%";
    },
    identicon() {
      return toSvg(this.poolID, 40);
    }
  },
  methods: {
    ...mapActions("pools", ["updatePoolStatus"]),
    getPoolInfo: function() {
      const poolJSON = this.getPoolByID(this.poolID);

      this.title = poolJSON.title;
      this.slug = poolJSON.slug;
      this.price = poolJSON.price;
      this.minimum = poolJSON.minimum_allocation_per_wallet;
      this.maximum = poolJSON.max_eth_allocation;
      this.type = poolJSON.type;
      this.access_type = poolJSON.access_type;
      this.participants = poolJSON.participants;
      this.image_link = poolJSON.image_link;
      this.pool_status = poolJSON.status;
      this.start_date = poolJSON.start_date;
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
.pool {
  transition: all 0.3s ease-in-out;
}
.pool:hover {
  transform: scale(1.05);
  z-index: 2;
}
.progress-bar {
  display: flex;
  flex-direction: column;
  justify-content: center;
  color: white;
  text-align: center;
  background-color: $primary;
  transition: width 0.6s ease;
}
.progress {
  color: $dark;
  display: flex;
  height: 1rem;
  overflow: hidden;
  font-size: 0.75rem;
  background-color: #e9ecef;
  border-radius: 0.25rem;
}
</style>
