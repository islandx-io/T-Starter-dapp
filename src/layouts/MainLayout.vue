<template>
  <q-layout view="hhh Lpr lff">
    <q-header class="bg-transparent q-pt-xs">
      <q-toolbar class="toolbar items-center">
        <q-toolbar-title>
          <div class="row">
            <router-link to="/" class="router-link">
              <img src="~assets/logo/logo-light.svg" alt="logo" height="50px" />
            </router-link>
          </div>
        </q-toolbar-title>
        <div class="gt-xs row">
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
        <!-- TODO Make mobile friendly -->
        <q-btn-dropdown
          class="lt-sm"
          align="right"
          dropdown-icon="menu"
          content-style="background-color: transparent; width: 400px"
          size="md"
          menu-anchor="bottom right"
          stretch
        >
          <div class="column items-end q-gutter-y-sm">
            <q-btn
              v-if="accountName === admin_address"
              color="accent"
              to="/createpool"
              label="Create pool"
            />
            <q-btn color="accent" to="/pools" label="Pools" />
            <q-btn
              v-if="isAuthenticated"
              color="accent"
              :to="{ name: 'wallet', params: { accountName: accountName } }"
              label="Wallet"
            />
            <login-button></login-button>
          </div>
          <!-- <q-list class="column items-end">
            <q-item clickable v-close-popup>
              <q-btn
                class="hover-accent"
                color="secondary"
                flat
                to="/pools"
                label="Pools"
              />
            </q-item>
            <q-item clickable v-close-popup>
              <q-btn
                class="hover-accent"
                color="secondary"
                flat
                to="/createpool"
                label="Create pool"
                v-if="accountName === admin_address"
              />
            </q-item>
            <q-item clickable v-close-popup>
              <login-button></login-button>
            </q-item>
          </q-list> -->
        </q-btn-dropdown>
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
      ]
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
.foot-bg {
  background-image: url("~assets/main/clouds-foot.png");
  height: 450px;
  padding-top: 100px;
  color: $secondary;
}
.q-page-container {
  padding-top: 0 !important;
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
