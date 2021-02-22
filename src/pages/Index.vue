<template>
  <q-page>
    <!--=====================================-->
    <!--=         Main Banner Start         =-->
    <!--=====================================-->
    <section class="main-banner-wrap-layout1 bg-gradient-layout1 has-animation">
      <ul class="animated-figure">
        <li>
          <div
            class="translate-left-75 opacity-animation transition-200 transition-delay-10"
          >
            <svg width="678px" height="575px">
              <defs>
                <linearGradient
                  id="shape-gradient1"
                  x1="0%"
                  x2="50%"
                  y1="86.603%"
                  y2="0%"
                >
                  <stop
                    offset="0%"
                    stop-color="rgb(87,26,255)"
                    stop-opacity="0.21"
                  />
                  <stop
                    offset="100%"
                    stop-color="rgb(1,0,53)"
                    stop-opacity="0.21"
                  />
                </linearGradient>
              </defs>
              <path
                fill="url(#shape-gradient1)"
                d="M57.512,28.844 C41.937,43.215 29.659,61.585 21.596,80.726 C10.238,107.690 5.415,136.934 2.113,166.013 C-8.559,260.013 20.528,368.419 121.400,397.331 C189.062,416.723 262.433,396.867 324.343,368.126 C415.304,325.900 543.497,194.454 436.347,96.738 C378.745,44.207 285.697,64.026 217.602,35.418 C185.699,22.011 155.662,-2.674 119.276,0.267 C95.545,2.187 74.555,13.118 57.512,28.844 Z"
              />
            </svg>
          </div>
        </li>
        <li>
          <div
            class="translate-right-75 opacity-animation transition-200 transition-delay-500"
          >
            <svg width="478px" height="406px">
              <defs>
                <linearGradient
                  id="shape-gradient2"
                  x1="0%"
                  x2="50%"
                  y1="86.603%"
                  y2="0%"
                >
                  <stop
                    offset="0%"
                    stop-color="rgb(87,26,255)"
                    stop-opacity="0.21"
                  />
                  <stop
                    offset="100%"
                    stop-color="rgb(1,0,53)"
                    stop-opacity="0.21"
                  />
                </linearGradient>
              </defs>
              <path
                fill="url(#shape-gradient2)"
                d="M57.512,28.844 C41.937,43.215 29.659,61.585 21.596,80.726 C10.238,107.690 5.415,136.934 2.113,166.013 C-8.559,260.013 20.528,368.419 121.400,397.331 C189.062,416.723 262.433,396.867 324.343,368.126 C415.304,325.900 543.497,194.454 436.347,96.738 C378.745,44.207 285.697,64.026 217.602,35.418 C185.699,22.011 155.662,-2.674 119.276,0.267 C95.545,2.187 74.555,13.118 57.512,28.844 Z"
              />
            </svg>
          </div>
        </li>
      </ul>
      <div class="container-fluid">
        <div class="row">
          <div
            class="col-lg-5 order-lg-2 d-flex align-items-center justify-content-center"
          >
            <div
              class="translate-right-75 opacity-animation transition-150 transition-delay-2600"
            >
              <div class="main-banner-box-layout1">
                <div class="item-figure">
                  <img
                    src="~assets/img/tstarter-rocket.svg"
                    width="60%"
                    alt="Illustration"
                  />
                </div>
              </div>
            </div>
          </div>
          <div
            class="col-lg-7 order-lg-1 compress-left-side d-flex align-items-center"
          >
            <div class="main-banner-box-layout1">
              <div
                class="translate-bottom-75 opacity-animation transition-150 transition-delay-1800"
              >
                <h2 class="item-main-title">
                  The place to discover and<br /><span
                    class="banner-text-heading"
                  >
                    back projects</span
                  >
                  building on Telos
                </h2>
                <div
                  class="translate-bottom-75 opacity-animation transition-150 transition-delay-2400"
                >
                  <div class="banner-btns">
                    <a href="pools" class="item-btn btn-ghost btn-light-main"
                      >VIEW ALL POOLS</a
                    >
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    <!--=====================================-->
    <!--=           Main Banner End         =-->
    <!--=====================================-->

    <!--=====================================-->
    <!--=   Upcoming Pools Area Start       =-->
    <!--=====================================-->
    <section
      class="service-wrap-layout1 section-padding-md-equal bg-color-accent2 position-relative"
      id="tokensale"
    >
      <div class="container">
        <div class="section-heading heading-dark heading-layout1 has-animation">
          <h2 class="heading-main-title">Upcoming Pools</h2>
          <div class="heading-icon">
            <svg class="dash-left" width="100" height="20">
              <g fill="none" stroke-width="4">
                <path
                  class="dashed1"
                  stroke="rgba(78, 7, 234, 0.9)"
                  stroke-dasharray="5, 5"
                  d="M5 20 l215 0"
                />
                <path
                  class="dashed2"
                  stroke="white"
                  stroke-dasharray="5, 5"
                  d="M5 20 l215 0"
                />
              </g>
            </svg>
            <img src="~assets/img/flaticonrocket.svg" alt="rocket" />
            <svg class="dash-right" width="100" height="20">
              <g fill="none" stroke-width="4">
                <path
                  class="dashed1"
                  stroke="rgba(78, 7, 234, 0.9)"
                  stroke-dasharray="5, 5"
                  d="M5 20 l215 0"
                />
                <path
                  class="dashed2"
                  stroke="white"
                  stroke-dasharray="5, 5"
                  d="M5 20 l215 0"
                />
              </g>
            </svg>
          </div>
        </div>
        <div class="row gutters-2">
          <Poolcard></Poolcard>
          <Poolcard></Poolcard>
        </div>
      </div>
    </section>
    <!--=====================================-->
    <!--=   Upcoming Pools Area End         =-->
    <!--=====================================-->

    <!--=====================================-->
    <!--=   Featured Pools Area Start       =-->
    <!--=====================================-->
    <section
      class="service-wrap-layout1 section-padding-md-equal bg-color-accent2 position-relative"
      id="tokensale"
    >
      <div class="container">
        <div class="section-heading heading-dark heading-layout1 has-animation">
          <h2 class="heading-main-title">Featured Pools</h2>
          <div class="heading-icon">
            <svg class="dash-left" width="100" height="20">
              <g fill="none" stroke-width="4">
                <path
                  class="dashed1"
                  stroke="rgba(78, 7, 234, 0.9)"
                  stroke-dasharray="5, 5"
                  d="M5 20 l215 0"
                />
                <path
                  class="dashed2"
                  stroke="white"
                  stroke-dasharray="5, 5"
                  d="M5 20 l215 0"
                />
              </g>
            </svg>
            <img src="~assets/img/flaticonrocket.svg" alt="rocket" />
            <svg class="dash-right" width="100" height="20">
              <g fill="none" stroke-width="4">
                <path
                  class="dashed1"
                  stroke="rgba(78, 7, 234, 0.9)"
                  stroke-dasharray="5, 5"
                  d="M5 20 l215 0"
                />
                <path
                  class="dashed2"
                  stroke="white"
                  stroke-dasharray="5, 5"
                  d="M5 20 l215 0"
                />
              </g>
            </svg>
          </div>
        </div>
        <div class="row gutters-2">
          <Poolcard></Poolcard>
          <Poolcard></Poolcard>
        </div>
        <div class="center">
          <br /><br />
          <a href="pools" class="item-btn btn-fill2">VIEW ALL POOLS</a>
        </div>
      </div>
    </section>
  </q-page>
</template>

<script>
import Poolcard from "src/components/Poolcard.vue";
export default {
  components: { Poolcard }
  // name: "Index"
};
</script>

<style lang="sass" scoped></style>
