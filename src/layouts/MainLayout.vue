<template>
  <q-layout view="hhh Lpr lff">
    <q-header class="bg-transparent q-pt-xs">
      <q-toolbar class="toolbar items-center">
        <q-toolbar-title>
          <div class="row">
            <router-link to="/" class="router-link">
              <img
                class="header-logo"
                src="~assets/logo/logo-light.svg"
                alt="logo"
                height="50px"
              />
            </router-link>
          </div>
        </q-toolbar-title>
        <div class="gt-sm row">
          <q-btn
            v-if="accountName === admin_address"
            class="hover-accent"
            color="secondary"
            flat
            to="/createpool"
            label="Create pool"
          />
          <q-btn
            class="hover-accent"
            color="secondary"
            flat
            to="/pools"
            label="Pools"
          />
          <q-btn
            v-if="isAuthenticated"
            class="hover-accent"
            color="secondary"
            flat
            :to="{ name: 'wallet', params: { accountName: accountName } }"
            label="Wallet"
          />
          <login-button :key="$route.fullPath" class="q-pl-md" />
        </div>
        <q-btn
          round
          icon="menu"
          outline
          color="secondary"
          class="lt-md menu-btn hover-accent"
          @click="showMenu = true"
        />
        <q-dialog
          v-model="showMenu"
          transition-show="jump-down"
          transition-hide="jump-up"
          content-style="box-shadow: none"
          position="top"
          full-width
        >
          <div
            class="column items-center justify-start q-gutter-y-sm q-py-md bg-secondary"
          >
            <div class="row justify-center q-gutter-sm">
              <q-btn
                label="Create pool"
                v-if="accountName === admin_address"
                color="secondary"
                text-color="black"
                to="/createpool"
                outline
              />
              <q-btn
                label="Pools"
                color="secondary"
                text-color="black"
                outline
                to="/pools"
              />
              <q-btn
                label="Wallet"
                v-if="isAuthenticated"
                color="secondary"
                text-color="black"
                outline
                :to="{ name: 'wallet', params: { accountName: accountName } }"
                class="hover-accent"
              />
            </div>
            <login-button mobileView />
            <!-- <q-btn
                  round
                  icon="fas fa-times"
                  outline
                  color="secondary"
                  class="lt-md menu-btn hover-accent"
                  @click="showMenu = false"
                /> -->
          </div>
        </q-dialog>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>

    <section class="foot-bg row items-stretch">
      <div class="footer-container row items-end justify-center">
        <div class="col-12 row justify-between ">
          <div class="col-sm-4">
            <router-link to="/" class="router-link q-pb-sm">
              <img src="~assets/logo/logo-light.svg" alt="logo" height="50px" />
            </router-link>
            <p class="text-body1">
              The place to discover and back projects building on Telos
            </p>
          </div>
          <div class="col-sm-3 column items-start content-end">
            <div class="text-h6">Contact Us</div>
            <div class="row justify-start">
              <a
                v-for="site in socialLinks"
                :key="site.name"
                :href="site.link"
                class="social-link"
              >
                <q-icon size="28px" :name="site.icon" />
              </a>
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
  data() {
    return {
      // prettier-ignore
      socialLinks: [
        {name: "telegram", icon: "fab fa-telegram-plane", link: "https://t.me/tstarterio"},
        {name: "medium", icon: "fab fa-medium-m", link: "https://medium.com/@t-starter"},
        {name: "twitter", icon: "fab fa-twitter", link: "https://twitter.com/T_StarterToken"},
        {name: "github", icon: "fab fa-github", link: "https://github.com/T-Starter"},
      ],
      showMenu: false
    };
  },
  components: { LoginButton },
  computed: {
    ...mapGetters("account", ["isAuthenticated", "accountName"]),
    admin_address() {
      return process.env.ADMIN_ADDRESS;
    }
  }
};
</script>

<style lang="scss" scoped>
.header-logo {
  @media only screen and (max-width: 360px) {
    height: 42px;
  }
}
.foot-bg {
  background-image: url("~assets/main/clouds-foot.png");
  height: 450px;
  padding-top: 100px;
  color: $secondary;
}
.q-page-container {
  padding-top: 0 !important;
  padding-bottom: 40px;
}
.social-link {
  padding: 5px 20px 0 0;
  text-decoration: none;
  transition: all 0.15s ease-in-out;
  color: $secondary;
  &:hover {
    color: $accent;
  }
}
</style>
