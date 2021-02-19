<template>
  <div class="col-lg-4 col-sm-6 col-12 all created">
    <div class="pricing-box-layout2">
      <div class="row">
        <div class="col-lg-6 col-sm-6 col-12">
          <img src="~assets/prog-1.png" width="50px" alt="image" />
        </div>
        <div class="col-lg-6 col-sm-6 col-12" style="text-align: end;">
          <!-- FIXME should be h7 according to css, but errors with vue -->
          <h6><i class="fa fa-circle" aria-hidden="true"></i> Live in 5 days</h6> 
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
        <q-linear-progress
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
        </q-linear-progress>
        <!-- <div
          class="progress-bar"
          role="progressbar"
          style="width: 25%;"
          aria-valuenow="25"
          aria-valuemin="0"
          aria-valuemax="100"
        >
          25%
        </div> -->
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
      progress: 0.5
    };
  },
  computed: {
    progressToPercentage() {
      return (this.progress * 100).toFixed(2) + "%";
    }
  }
};
</script>

// example scss or sass, remove later
<style lang="scss" scoped>
div .btn-ghost {
  font-weight: 400;
  font-size: 16px;
  position: relative;
  z-index: 2;
  padding: 4px 20px;
  border-radius: 4px;
  display: -webkit-inline-box;
  display: -ms-inline-flexbox;
  display: inline-flex;
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
  -webkit-box-pack: center;
  -ms-flex-pack: center;
  justify-content: center;
  background-color: transparent;
  border: 2px solid;
  border-color: #571aff;
  color: #571aff;
  -webkit-transition: all 0.5s ease-in-out;
  -o-transition: all 0.5s ease-in-out;
  transition: all 0.5s ease-in-out;
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
  background-color: #f10a0a00;
  transition: width 0.6s ease;
}
</style>
