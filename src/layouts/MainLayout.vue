<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar class="text-black bg-secondary">
        <q-toolbar-title>
          <a href="/" class="default-logo">
            <img src="~assets/logo/logo-dark.svg" alt="logo" height="33px" />
          </a>
        </q-toolbar-title>

        <login-button></login-button>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>

    <section class="foot column items-center content-center justify-end">
      <div class="foot-top col-xl-4 row items-center justify-between ">
        <div class="col-sm-4">
          <a href="/" class="default-logo">
            <img src="~assets/logo/logo-light.svg" alt="logo" height="33px" />
          </a>
          <p class="text-body1">
            The place to discover and back projects building on Telos
          </p>
        </div>
        <div class="col-sm-3">
          <p class="text-weight-bolder">Contact Us</p>
          <div class="row justify-start">
            <q-btn type="a" href="https://t.me/tstarterio">
              <q-icon size="sm" name="fab fa-telegram-plane" />
            </q-btn>
            <q-btn type="a" href="https://medium.com/@t-starter">
              <q-icon size="sm" name="fab fa-medium-m" />
            </q-btn>
          </div>
        </div>
      </div>
      <p>Copyright 2021. T-STARTER. All Rights Reserved</p>
    </section>
  </q-layout>
</template>

<script>
import LoginButton from "components/LoginButton.vue";

export default {
  name: "MainLayout",
  components: { LoginButton }
};
</script>

<style lang="scss" scoped>
.head {
  color: $secondary;
}
.foot {
  background-image: url("~assets/main/clouds-foot.png");
  height: 450px;
  color: $secondary;
}
.foot-top {
  padding-bottom: 100px;
}
</style>
