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
    </q-card-section>

    <!-- <q-card-section>
      {{ lorem }}
    </q-card-section> -->

    <q-card-actions vertical align="center">
      <q-btn outline color="primary">VIEW POOL</q-btn>
    </q-card-actions>
  </q-card>
  <!-- <div class="col-lg-4 col-sm-6 col-12" :class="filterClass">
    <div class="pricing-box-layout2">
      <div class="row">
        <div class="col-lg-6 col-sm-6 col-12">
          <img src="~assets/img/prog-1.png" width="50px" alt="image" />
        </div>
        <div class="col-lg-6 col-sm-6 col-12" style="text-align: end;"> -->

  <!-- FIXME should be h7 according to css, but errors with vue -->

  <!-- <h6>
            <i class="fa fa-circle" aria-hidden="true"></i> Live in 5 days
          </h6>
        </div>
      </div>
      <h3 class="item-title">{{ title }}</h3>
      <h6>Total raise</h6>
      <p class="item-price">${{ price }}</p>
      <div class="row">
        <div class="col-lg-4 col-sm-6">
          <h6>Minimum</h6>
          <p class="item-values">{{ minimum }}</p>
        </div>
        <div class="col-lg-5 col-sm-6">
          <h6>Maximum</h6>
          <p class="item-values">{{ maximum }} ETH</p>
        </div>
        <div class="col-lg-3 col-sm-6">
          <h6>Type</h6>
          <p class="item-values">{{ type }}</p>
        </div>
      </div>
      <h6 class="btn-pad-b">Sale progress</h6>
      <div class="progress"> 
        <div
          class="progress-bar"
          role="progressbar"
          :style="{width: progressToPercentage}"
          :aria-valuenow="progress"
          aria-valuemin="0"
          aria-valuemax="1"
        >
          {{progressToPercentage}}
        </div>
      </div>
      <div class="center btn-pad-t">
        <q-btn class="item-btn btn-ghost" label="VIEW POOl" />
      </div>
    </div>
  </div> -->
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
      progress: 0.75,
      filterClass: "created joined"
    };
  },
  computed: {
    progressToPercentage() {
      return (this.progress * 100).toFixed(2) + "%";
    }
  }
};
</script>

<style lang="scss" scoped>
.item-price {
  line-height: 30px;
  font-size: 26px;
  color: $primary;
  margin-bottom: 10px;
}
.item-title {
  margin-top: 0;
}
</style>
