<template>
  <!-- TODO class joined, featured, created, all -->
  <q-card class="card pool bg-secondary text-black" :class="filterClass">
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
      <div class="q-col-gutter-xl row justify-between">
        <div>
          <div class="text-h6">Minimum</div>
          <p class="item-value">{{ minimum }}</p>
        </div>
        <div>
          <div class="text-h6">Maximum</div>
          <p class="item-value">{{ maximum }}</p>
        </div>
        <div>
          <div class="text-h6">Type</div>
          <p class="item-value">{{ type }}</p>
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
export default {
  name: "Poolcard",
  props: {},
  data() {
    return {
      title: "The Unkown Project",
      slug: "theunkownproject",
      poolID: 1,
      price: 5000,
      minimum: 0,
      maximum: 0.3,
      type: "Fixed",
      accessType: "Public",
      progress: 0.4,
      filterClass: "created joined"
    };
  },
  computed: {
    progressToPercentage() {
      return this.progress * 100 + "%";
    }
  },
  methods: {
    getInfo: function() {
      console.log("Hi");
    }
  },
  mounted() {
    this.getInfo();
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
