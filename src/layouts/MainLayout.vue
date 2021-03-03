<template>
  <q-layout view="hhh Lpr lff">
    <q-header elevated reveal class="head">
      <q-toolbar class="toolbar text-black">
        <q-toolbar-title>
          <router-link to="/" class="default-logo">
            <img src="~assets/logo/logo-dark.svg" alt="logo" height="33px" />
          </router-link>
        </q-toolbar-title>
        <div class="gt-sm row">
          <router-link class="q-pr-md" to="/pools"
            ><q-btn outline color="primary">Pools</q-btn></router-link
          >
          <router-link to="/createpool" class=""
            ><q-btn outline color="primary">Create Pool</q-btn></router-link
          >
          <login-button></login-button>
        </div>
        <q-btn-dropdown class="lt-md" icon="menu" align="right">
          <q-list class="column items-end">
            <q-item clickable v-close-popup>
              <router-link to="/pools"
                ><q-btn outline color="primary">Pools</q-btn></router-link
              >
            </q-item>
            <q-item clickable v-close-popup>
              <router-link to="/createpool"
                ><q-btn outline color="primary">Create Pool</q-btn></router-link
              >
            </q-item>
            <q-item clickable v-close-popup>
              <login-button></login-button>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>

    <section class="foot column items-center content-center justify-end">
      <div class="foot-top col-xl-4 row items-center justify-between ">
        <div class="col-sm-4">
          <router-link to="/" class="default-logo">
            <img src="~assets/logo/logo-light.svg" alt="logo" height="33px" />
          </router-link>
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
  background-color: $secondary;
  color: $dark;
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
