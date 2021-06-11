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
          style="padding-left: 4px"
          no-caps
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
        class="self-center text-center text-black q-px-sm"
        style="min-width: 130px; font-weight: 500"
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
          <q-carousel-slide
            class="column flex-center q-pa-none"
            name="createSlide"
          >
            <q-card>
              <p>
                Create a {{ currentChain.NETWORK_DISPLAY_NAME }} account through
                an official portal and then login with the wallet of your
                choice.
              </p>
              <p>
                We recommend the
                {{
                  currentChain.NETWORK_NAME === "WAX"
                    ? "WAX Cloud Wallet"
                    : "Anchor wallet"
                }}.
              </p>
              <div class="row justify-center q-gutter-x-sm">
                <q-btn
                  label="Create account"
                  class="hover-accent text-accent"
                  outline
                  type="a"
                  :href="currentChain.CREATE_ACCOUNT"
                  target="_blank"
                />
                <q-btn
                  label="Back"
                  class="text-black"
                  outline
                  @click="dialogSlide = 'loginSlide'"
                />
              </div>
            </q-card>
          </q-carousel-slide>
        </q-carousel>
      </div>
    </q-dialog>
    <q-dialog v-model="ramLow">
      <q-card style="max-width: 400px">
        <q-card-section class="row items-center">
          <q-icon
            name="fas fa-exclamation-circle"
            size="lg"
            class="q-pr-sm"
            color="primary"
          />
          <div class="col text-h6">Insufficient RAM</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <p>
            You have {{ ramAvail / 1000 }} KB of RAM available, which may not be
            enough for transactions on this app.
          </p>
          <div class="text-caption text-grey-7">
            <q-icon name="fas fa-info-circle" class="q-pr-xs" />
            {{ ramThres / 1000 }} KB of RAM would cost about
            {{ (ramPrice * ramThres).toFixed(4) }}
            {{ currentChain.NAITIVE_TOKEN }}.
          </div>
          <div class="text-caption text-grey-7" v-if="!canPayForRAM">
            <q-icon name="fas fa-exclamation-triangle" class="q-pr-xs" />
            Transfer {{ currentChain.NAITIVE_TOKEN }} to your account to buy
            more RAM.
          </div>
        </q-card-section>

        <q-card-actions class="q-pt-none" align="center">
          <q-btn
            outline
            label="Buy 1 KB of RAM"
            color="accent"
            class="hover-accent"
            @click="buyRAM"
            :disable="!canPayForRAM"
          />
          <q-btn
            outline
            class="hover-accent"
            label="Skip"
            color="primary"
            v-close-popup
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import { copyToClipboard } from "quasar";
import { Platform } from "quasar";

export default {
  data() {
    return {
      showLogin: false,
      error: null,
      showLogout: false,
      balanceSTR: "0 START",
      dialogSlide: "loginSlide",
      ramThres: 1000,
      ramAvail: 0,
      ramLow: false,
      ramPrice: 0,
      naitiveTokenBalance: 0
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
    ]),
    ...mapGetters("blockchains", ["currentChain"]),
    isMobile() {
      return Platform.is.mobile;
    },
    PlatformInfo() {
      return Platform;
    },
    canPayForRAM() {
      return this.naitiveTokenBalance > this.ramPrice * this.ramThres;
    }
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
      this.getBalance();
      this.checkResources();
    },

    async checkResources() {
      await this.getNaitiveTokenBalance();
      await this.getRamPrice();
      let account = await this.$store.$api.getAccount(this.accountName);
      this.ramAvail = account.ram_quota - account.ram_usage;
      if (this.ramAvail < this.ramThres) this.ramLow = true;
    },

    async buyRAM() {
      const actions = [];
      actions.push({
        account: "eosio",
        name: "buyrambytes",
        data: {
          payer: this.accountName,
          receiver: this.accountName,
          bytes: 1000
        }
      });
      let transaction = false;
      try {
        transaction = await this.$store.$api.signTransaction(actions);
      } catch (error) {
        this.$errorNotification(error);
      }
      if (transaction) this.ramLow = false;
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

    async getNaitiveTokenBalance() {
      if (this.isAuthenticated) {
        let payload = {
          address: "eosio.token",
          sym: this.currentChain.NAITIVE_TOKEN,
          accountName: this.accountName
        };
        this.naitiveTokenBalance = this.$chainToQty(
          await this.getBalanceFromChain(payload)
        );
      }
    },

    async getRamPrice() {
      const res = await this.$store.$api.getTableRows({
        code: "eosio",
        scope: "eosio",
        table: "rammarket",
        limit: 1,
        show_payer: false
      });
      let ramInfo = res.rows[0];
      this.ramPrice =
        this.$chainToQty(ramInfo.quote.balance) /
        this.$chainToQty(ramInfo.base.balance);
      // TODO Check formula and incorporate weight: parseFloat(ramInfo.quote.weight)
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
    // await this.autoLogin(this.$route.query.returnUrl); // FIXME this causes telos sign to pop up, not good on prod
    await this.getBalance();
    // Start polling every 30 seconds for any updates
    this.polling = setInterval(async () => {
      await this.getBalance();
    }, 30000);
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
  max-width: 300px;
}
</style>
