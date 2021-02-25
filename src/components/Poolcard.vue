<template>
  <!-- TODO class joined, featured, created, all -->
  <q-card class="bg-secondary text-black" :class="filterClass">
    <q-item class="row items-center">
      <q-item-section avatar>
        <q-avatar>
          <img src="~assets/pools/prog-1.png" width="50px" alt="image" />
        </q-avatar>
      </q-item-section>
      <q-item-section top>
        <div class="text-accent row items-center">
          <q-icon name="circle" color="accent" size="15px" />
          <div class="text-caption">Live in 5 days</div>
        </div>
      </q-item-section>
    </q-item>
    <q-card-section>
      <h3 class="item-title ">{{ title }}</h3>
      <div class="text-h6">Total raise</div>
      <p class="item-price">{{ price }}</p>
      <div class="row justify-between">
        <div>
          <div class="text-h6">Minimum</div>
          <p class="item-value">{{ minimum }}</p>
        </div>
        <div>
          <div class="text-h6">Maximum</div>
          <p class="item-value">{{ maximum }}</p>
        </div>
        <div>
          <div class="text-h6">Access</div>
          <p class="item-value">{{ accessType }}</p>
        </div>
      </div>
    </q-card-section>
    <!-- <q-card-section>
      <q-linear-progress :value="progress" color="primary" size="20px" rounded>
        <div class="absolute-full flex flex-center">
          <q-badge
            rounded
            color="primary"
            text-color="white"
            :label="progressToPercentage"
          />
        </div>
      </q-linear-progress>
    </q-card-section>

    <q-card-actions vertical align="center">
      <q-btn outline color="primary">VIEW POOL</q-btn>
    </q-card-actions> -->

    <h6 class="btn-pad-b">Sale progress</h6>
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

    <div class="center btn-pad-t">
      <router-link
        :to="{ name: 'pooldetails', params: { slug: slug, id: poolID } }"
        class="item-btn btn-ghost"
        >VIEW POOL</router-link
      >
    </div>
  </q-card>
</template>

<script>
import { date } from "quasar";
import { mapGetters, mapActions } from "vuex";
export default {
  name: "Poolcard",
  props: {
    poolID: {
      type: Number,
      default: 0,
      required: true
    }
  },
  data() {
    return {
      title: "The Unknown Project",
      slug: "theunknownproject",
      price: 0,
      minimum: "TBA",
      maximum: "TBA",
      type: "Fixed",
      accessType: "Private",
      progress: 0.4,
      participants: 100,
      filterClass: "created joined"
    };
  },
  computed: {
    ...mapGetters("pools", ["getAllPools", "getPoolByID"]),
    progressToPercentage() {
      return (this.progress * 100).toFixed(2) + "%";
    }
  },
  methods: {
    getPoolInfo: function() {
      console.log("Mounted");
      const poolJSON = this.getPoolByID(this.poolID);
      console.log(poolJSON);

      this.title = poolJSON.title;
      this.price = poolJSON.price;
      this.minimum = poolJSON.minimum;
      this.maximum = poolJSON.maximum;
      this.type = poolJSON.type;
      this.accessType = poolJSON.accessType;
      this.participants = poolJSON.participants;
    }
  },
  mounted() {
    this.getPoolInfo();
  }
};
</script>

<style lang="scss" scoped>
.item-title {
  margin-top: 0;
}
.item-price {
  line-height: 30px;
  font-size: 26px;
  color: $primary;
  margin-bottom: 10px;
}
.item-value {
  line-height: 30px;
  font-size: 20px;
  color: $primary;
  margin-bottom: 10px;
}
.progress-bar {
  display: -ms-flexbox;
  display: flex;
  -ms-flex-direction: column;
  flex-direction: column;
  -ms-flex-pack: center;
  justify-content: center;
  color: #ffffff;
  text-align: center;
  white-space: nowrap;
  background-color: #571aff;
  transition: width 0.6s ease;
}
</style>
