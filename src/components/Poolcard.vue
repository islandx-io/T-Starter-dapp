<template>
  <div class="col-lg-4 col-sm-6 col-12 all created">
    <div class="pricing-box-layout2">
      <div class="row">
        <div class="col-lg-6 col-sm-6 col-12">
          <img src="~assets/prog-1.png" width="50px" alt="image" />
        </div>
        <div class="col-lg-6 col-sm-6 col-12" style="text-align: end;">
          <!-- FIXME should be h7 according to css, but errors with vue -->
          <h6>
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
        <!-- <q-linear-progress
          size="25px"
          :value="progress"
          color="accent"
          class="progress-bar"
        > 
          <div class="absolute-full flex flex-center">
            <q-badge
              color="white"
              text-color="accent"
              :label="progressToPercentage"
            />
          </div>
        </q-linear-progress>  -->
        <div
          class="progress-bar"
          role="progressbar"
          :style="{width: progressToPercentage}"
          :aria-valuenow="progress"
          aria-valuemin="0"
          aria-valuemax="1"
        >
          {{progressToPercentage}}%
        </div>
      </div>
      <div class="center btn-pad-t">
        <!-- <a href="#" class="item-btn btn-ghost">VIEW POOL</a> -->
        <q-btn class="item-btn btn-ghost" label="VIEW POOl" />
      </div>
    </div>
  </div>
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
      access_type: 'Public',
      progress: 0.75,
    };
  },
  computed: {
    progressToPercentage() {
      return (this.progress * 100).toFixed(2) + '%';
    }
  }
};
</script>

// example scss or sass, remove later
<style lang="scss" scoped>
</style>
