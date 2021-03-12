<template>
  <q-layout view="hhh Lpr lff">
    <q-header class="bg-transparent q-pt-sm">
      <q-toolbar class="toolbar items-center">
        <q-toolbar-title>
          <router-link to="/" class="router-link">
            <img src="~assets/logo/logo-light.svg" alt="logo" height="50px" />
          </router-link>
        </q-toolbar-title>
        <div class="gt-sm row">
          <router-link to="/pools" class="router-link">
            <q-btn flat color="secondary" class="hover-accent">
              Pools ⛲
            </q-btn>
          </router-link>
          <router-link to="/createpool" class="router-link">
            <q-btn
              flat
              color="secondary"
              class="hover-accent"
              v-if="accountName === admin_address"
            >
              Create Pool
            </q-btn>
          </router-link>
          <login-button class="q-pl-md"></login-button>
        </div>
        <!-- TODO Make mobile friendly -->
        <!-- <q-btn-dropdown class="lt-md" icon="menu" align="right">
          <q-list class="column items-end">
            <q-item clickable v-close-popup>
              <router-link to="/pools" class="router-link"
                ><q-btn outline color="primary">View Pools</q-btn></router-link
              >
            </q-item>
            <q-item clickable v-close-popup>
              <router-link to="/createpool" class="router-link"
                ><q-btn outline color="primary">Create Pool</q-btn></router-link
              >
            </q-item>
            <q-item clickable v-close-popup>
              <login-button></login-button>
            </q-item>
          </q-list>
        </q-btn-dropdown> -->
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>

    <section class="foot-bg row items-stretch">
      <div class="footer-container row items-end justify-center">
        <div class="col-12 row justify-between ">
          <div class="col-sm-4">
            <router-link to="/" class="router-link">
              <img src="~assets/logo/logo-light.svg" alt="logo" height="33px" />
            </router-link>
            <p class="text-body1">
              The place to discover and back projects building on Telos
            </p>
          </div>
          <div class="col-sm-3 column items-center content-end">
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
      </div>
    </section>
  </q-layout>
</template>

<script>
import LoginButton from "components/LoginButton.vue";
import { mapGetters, mapActions } from "vuex";

export default {
  name: "MainLayout",
  components: { LoginButton },
  computed: {
    ...mapGetters("account", ["isAuthenticated", "accountName"]),
    admin_address() {
      return process.env.ADMIN_ADDRESS; // Check if undefined
    }
  }
};
</script>

<style lang="scss" scoped>
.foot-bg {
  background-image: url("~assets/main/clouds-foot.png");
  height: 450px;
  padding-top: 100px;
  color: $secondary;
}
.q-page-container {
  padding-top: 0 !important;
}
</style>
