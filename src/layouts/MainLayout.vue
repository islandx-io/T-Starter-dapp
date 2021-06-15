<template>
  <q-layout
    view="hhh Lpr lff"
    :class="`chain-${currentChain.NETWORK_NAME.toLowerCase()}`"
  >
    <q-header class="bg-transparent q-pt-xs">
      <q-toolbar class="toolbar items-center">
        <q-toolbar-title>
          <div class="row items-center">
            <router-link
              :to="{ path: `/${currentChain.NETWORK_NAME.toLowerCase()}` }"
              class="router-link"
            >
              <img
                class="header-logo"
                src="~assets/logo/logo-light.svg"
                alt="logo"
                height="50px"
              />
            </router-link>
          </div>
        </q-toolbar-title>
        <div class="gt-sm row items-center">
          <q-btn
            v-if="accountName === admin_address"
            class="hover-accent"
            color="secondary"
            flat
            :to="{ name: 'createpool' }"
            label="Create pool"
          />
          <q-btn
            class="hover-accent"
            color="secondary"
            flat
            :to="{ name: 'allpools' }"
            label="Pools"
          />
          <q-btn
            v-if="isAuthenticated"
            class="hover-accent"
            color="secondary"
            flat
            @click="openStaking()"
            label="Staking"
          />
          <q-btn
            v-if="isAuthenticated"
            class="hover-accent"
            color="secondary"
            flat
            :to="{ name: 'wallet', params: { accountName: accountName } }"
            label="Wallet"
          />
          <login-button class="q-pl-sm" />
          <chain-selector class="q-pl-md" />
        </div>
        <!-- Mobile menu -->
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
                :to="{ name: 'createpool' }"
                outline
                class="hover-accent"
              />
              <q-btn
                label="Pools"
                color="secondary"
                text-color="black"
                outline
                :to="{ name: 'allpools' }"
                class="hover-accent"
              />
              <q-btn
                v-if="isAuthenticated"
                color="secondary"
                text-color="black"
                @click="openStaking()"
                label="Staking"
                outline
                class="hover-accent"
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
            <chain-selector />
          </div>
        </q-dialog>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
      <!-- Staking dialog -->
      <!-- <staking /> -->
    </q-page-container>

    <section class="foot-bg row items-stretch">
      <div class="footer-container row items-end justify-center">
        <div class="col-12 row justify-between ">
          <div class="col-sm-4">
            <router-link to="/" class="router-link q-pb-sm">
              <img
                src="~assets/logo/logo-light.svg"
                alt="logo"
                height="50px"
                id="foot-logo"
              />
            </router-link>
            <p class="text-body1">
              The place to discover and back projects building on
              {{ currentChain.NETWORK_DISPLAY_NAME }}
            </p>
          </div>
          <div class="col-sm-3 column items-start content-end">
            <q-btn
              class="hover-accent text-h6"
              color="accent"
              style="margin-left: -10px"
              flat
              type="a"
              href="https://docs.google.com/forms/d/e/1FAIpQLSeQE7zDFlxxWmAN-pKDfik6OcgtReJ8oiviIpCUkOAGk6Ez7Q/viewform"
              label="List project"
              no-caps
              padding="5px 10px"
            />
            <div class="text-h6">Contact Us</div>
            <div class="row justify-start">
              <a
                v-for="site in socialLinks"
                :key="site.name"
                :href="site.link"
                class="social-link"
                target="_blank"
              >
                <q-icon size="24px" :name="site.icon" />
              </a>
            </div>
          </div>
        </div>
        <p class="text-center">
          Version: {{ siteVersion }}<br />
          Copyright 2021. T-STARTER. All Rights Reserved
        </p>
      </div>
    </section>
  </q-layout>
</template>

<script>
import LoginButton from "components/LoginButton.vue";
import ChainSelector from "components/ChainSelector.vue";
import Staking from "components/Staking.vue";
import { mapGetters, mapActions } from "vuex";
import { Dialog } from "quasar";

export default {
  name: "MainLayout",
  components: { LoginButton, ChainSelector },
  data() {
    return {
      // prettier-ignore
      socialLinks: [
        {name: "web", icon: "fas fa-globe", link: "https://tstarter.io/"},
        {name: "telegram", icon: "fab fa-telegram-plane", link: "https://t.me/tstarterio"},
        {name: "medium", icon: "fab fa-medium-m", link: "https://medium.com/@t-starter"},
        {name: "twitter", icon: "fab fa-twitter", link: "https://twitter.com/T_StarterToken"},
        {name: "github", icon: "fab fa-github", link: "https://github.com/T-Starter"},
      ],
      showMenu: false,
      siteVersion: process.env.SITE_VERSION
    };
  },

  computed: {
    ...mapGetters("account", ["isAuthenticated", "accountName"]),
    ...mapGetters("blockchains", ["currentChain"]),
    admin_address() {
      return process.env.ADMIN_ADDRESS;
    }
  },
  methods: {
    async openStaking() {
      this.$q
        .dialog({
          component: Staking,
          parent: this
        })
        .onOk(() => {
          console.log("OK");
        })
        .onCancel(() => {
          console.log("Cancel");
        })
        .onDismiss(() => {
          console.log("Called on OK or Cancel");
        });
    }
  }
};
</script>

<style lang="scss" scoped>
@media only screen and (max-width: 360px) {
  .header-logo {
    height: 42px;
  }
  #foot-logo {
    height: 45px;
  }
}
.foot-bg {
  height: 450px;
  padding-top: 100px;
  color: $secondary;
}
.q-page-container {
  padding-top: 0 !important;
  padding-bottom: 40px;
}
.social-link {
  padding: 5px 20px 10px 0;
  text-decoration: none;
  transition: all 0.15s ease-in-out;
  color: $secondary;
  &:hover {
    color: $accent;
  }
}
</style>
