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
          <div class="text-h6">Type</div>
          <p class="item-value">{{ type }}</p>
        </div>
      </div>
    </q-card-section>
    <q-card-section>
      <q-linear-progress :value="progress" color="primary" size="20px" rounded>
        <div class="absolute-full flex flex-center">
          <q-badge
            rounded
            color="primary"
            text-color="white"
            :label="progressLabel"
          />
        </div>
      </q-linear-progress>
    </q-card-section>

    <q-card-actions vertical align="center">
      <q-btn outline color="primary">VIEW POOL</q-btn>
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
    progressLabel() {
      return this.progress * 100 + "%";
    }
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
</style>
