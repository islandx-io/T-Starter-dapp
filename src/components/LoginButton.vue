<template>
  <div>
    <q-btn
      v-if="!isAuthenticated"
      @click="showLogin = true"
      class="hover-accent"
      :flat="!mobileView"
      color="accent"
      :outline="mobileView"
      label="Login"
    />
    <q-btn-group
      :outline="mobileView"
      class="q-pa-xs bg-secondary"
      v-if="isAuthenticated"
    >
      <q-btn-group class="row justify-end items-center">
        <q-btn
          class="account-badge"
          @click="copyAccountName"
          :label="accountName"
          padding="3px 5px"
        >
          <q-tooltip>
            Copy
          </q-tooltip>
        </q-btn>
        <q-btn
          class="account-badge"
          icon="far fa-times-circle"
          padding="0"
          style="font-size: 12px; padding: 0 5px 0 2px"
          @click="logout()"
        >
          <q-tooltip>
            Logout
          </q-tooltip>
        </q-btn>
      </q-btn-group>
      <div
        class="self-center text-center text-black"
        style="min-width: 130px; font-weight: 500 "
      >
        {{ balanceSTR }}
      </div>
    </q-btn-group>
    <q-dialog v-model="showLogin" content-style="background-color: #000000aa">
      <div style="box-shadow: none">
        <q-carousel
          v-model="dialogSlide"
          transition-prev="jump-down"
          transition-next="jump-up"
          animated
          control-color="primary"
          class="column flex-center"
          style="background: transparent; overflow-x: hidden;"
        >
          <q-carousel-slide
            name="loginSlide"
            class="column flex-center q-gutter-y-sm q-pa-md"
          >
            <q-list class="shadow-5">
              <q-item
                v-for="(wallet, idx) in $ual.authenticators"
                :key="wallet.getStyle().text"
                v-ripple
                :style="{
                  background: wallet.getStyle().background,
                  color: wallet.getStyle().textColor
                }"
              >
                <q-item-section
                  class="cursor-pointer"
                  avatar
                  @click="onLogin(idx)"
                >
                  <img :src="wallet.getStyle().icon" width="30" />
                </q-item-section>
                <q-item-section class="cursor-pointer" @click="onLogin(idx)">
                  {{ wallet.getStyle().text }}
                </q-item-section>
                <q-item-section class="flex" avatar>
                  <q-spinner
                    v-if="loading === wallet.getStyle().text"
                    :color="wallet.getStyle().textColor"
                    size="2em"
                  />
                  <q-btn
                    v-else
                    :color="wallet.getStyle().textColor"
                    icon="get_app"
                    @click="openUrl(wallet.getOnboardingLink())"
                    target="_blank"
                    dense
                    flat
                    size="12px"
                  >
                    <q-tooltip>
                      Get app
                    </q-tooltip>
                  </q-btn>
                </q-item-section>
              </q-item>
              <q-item
                v-if="error"
                :active="!!error"
                active-class="bg-red-1 text-grey-8"
              >
                <q-item-section>
                  {{ error }}
                </q-item-section>
              </q-item>
            </q-list>
            <q-btn
              label="Create New Account"
              class="hover-accent text-secondary"
              outline
              flat
              @click="dialogSlide = 'createSlide'"
            />
          </q-carousel-slide>
          <q-carousel-slide class="column flex-center" name="createSlide">
            <q-card>
              <p>
                Create a Telos account through the official telos.net portal and
                then login with the wallet of your choice. We recommend using
                Anchor for desktop and Wombat for mobile.
              </p>
              <div class="row justify-between">
                <q-btn
                  label="Create account"
                  class="hover-accent text-accent"
                  outline
                  type="a"
                  href="https://telos.net/create-account/"
                  target="_blank"
                />
                <q-btn
                  label="Back"
                  class="text-black"
                  flat
                  outline
                  @click="dialogSlide = 'loginSlide'"
                />
              </div>
            </q-card>
          </q-carousel-slide>
        </q-carousel>
      </div>
    </q-dialog>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import { copyToClipboard } from "quasar";

export default {
  data() {
    return {
      showLogin: false,
      error: null,
      showLogout: false,
      balanceSTR: "0 START",
      dialogSlide: "loginSlide"
    };
  },
  props: {
    mobileView: { default: false, type: Boolean }
  },
  computed: {
    ...mapGetters("account", [
      "isAuthenticated",
      "accountName",
      "loading",
      "isAutoLoading"
    ])
  },
  methods: {
    ...mapActions("account", ["login", "logout", "autoLogin"]),
    ...mapActions("pools", ["getBalanceFromChain"]),
    copyAccountName() {
      copyToClipboard(this.accountName).then(() => {
        this.$q.notify({
          color: "green-4",
          textColor: "secondary",
          message: "Copied account name to clipboard",
          timeout: 1000
        });
      });
    },
    async onLogin(idx) {
      this.error = null;
      const error = await this.login({ idx });
      if (!error) {
        this.showLogin = false;
      } else {
        this.error = error;
      }
      await this.getBalance();
    },

    openUrl(url) {
      window.open(url);
    },

    goToAccountPage() {
      const accountPath = `/account/${this.accountName}`;
      if (this.$router.currentRoute.path !== accountPath) {
        this.$router.push({ path: accountPath });
      }
    },

    async getBalance() {
      if (this.isAuthenticated) {
        let payload = {
          address: "token.start",
          sym: "START",
          accountName: this.accountName
        };
        this.balanceSTR = this.$chainStrReformat(
          await this.getBalanceFromChain(payload)
        );
      }
    }
  },
  async mounted() {
    await this.autoLogin(this.$route.query.returnUrl);
    await this.getBalance();
  }
};
</script>

<style lang="scss" scoped>
.account-badge {
  padding: 0;
  background-color: $space;
  font-weight: bold;
  color: $secondary;
  transition: all 0.15s ease-in-out;
  &:hover {
    background-color: $accent !important;
    border-color: $accent !important;
    color: $secondary !important;
  }
  &:hover .q-btn__wrapper::before {
    background-color: $accent;
    border-color: $accent;
  }
  &:hover .q-btn__wrapper .q-btn__content {
    color: $secondary;
  }
}
.q-carousel__slide {
  overflow-x: hidden;
  width: 300px;
}
</style>
