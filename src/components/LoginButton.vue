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
    <q-btn-group outline>
      <q-btn
        class="hover-accent"
        :text-color="mobileView ? 'black' : 'secondary'"
        outline
        label="Logout"
        v-if="showLogout"
        @click="
          showLogout = false;
          logout();
        "
      />
      <q-btn
        v-if="isAuthenticated"
        :color="mobileView ? 'black' : 'secondary'"
        :outline="mobileView"
        class="login row justify-end items-center"
        padding="4px xs"
        @click="showLogout = !showLogout"
      >
        <div class="account-badge" @click="copyAccountName">
          <div>
            {{ accountName }}
          </div>
          <q-tooltip>
            Tap to copy
          </q-tooltip>
        </div>
        <div class="q-px-sm text-black" style="min-width: 130px">
          {{ balanceSTR }}
        </div>
      </q-btn>
    </q-btn-group>
    <q-dialog v-model="showLogin">
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
                Anchor.
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
          message: "Copied to clipboard",
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
.login {
  padding-right: 0;
}
.login .account-badge {
  display: flex;
  align-items: center;
  border-radius: 10px;
  max-height: 28px;
  padding: 4px 10px;
  background-color: $space;
  font-size: 14px;
  font-weight: bold;
  color: $secondary;
}
.q-carousel__slide {
  overflow-x: hidden;
  width: 300px;
}
</style>
