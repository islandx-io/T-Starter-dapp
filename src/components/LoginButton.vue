<template>
  <div>
    <q-btn
      v-if="!isAuthenticated"
      @click="showLogin = true"
      class="hover-accent"
      flat
      color="secondary"
      label="Login"
      outline
    />
    <q-btn-group outline>
      <q-btn
        class="hover-accent"
        text-color="secondary"
        color="secondary"
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
        color="secondary"
        class="login row justify-end items-center"
        padding="4px xs"
        @click="showLogout = !showLogout"
      >
        <div class="account-badge">
          <div>
            {{ accountName }}
          </div>
        </div>
        <div class="q-px-sm text-black">{{ balanceSTR }}</div>
      </q-btn>
    </q-btn-group>
    <q-dialog v-model="showLogin">
      <q-list>
        <q-item
          v-for="(wallet, idx) in $ual.authenticators"
          :key="wallet.getStyle().text"
          v-ripple
          :style="{
            background: wallet.getStyle().background,
            color: wallet.getStyle().textColor
          }"
        >
          <q-item-section class="cursor-pointer" avatar @click="onLogin(idx)">
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
    </q-dialog>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

export default {
  data() {
    return { showLogin: false, error: null, showLogout: false, 
    balanceSTR: 0,
    };
  },
  computed: {
    ...mapGetters("account", [
      "isAuthenticated",
      "accountName",
      "loading",
      "isAutoLoading"
    ]),
  },
  methods: {
    ...mapActions("account", ["login", "logout", "autoLogin"]),
    ...mapActions("pools", ["getBalanceFromChain"]),

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

    // TODO get all base tokens dynamically, also show START tokens
    async getBalance() {
      let payload = {
        address: "token.start",
        sym: "START",
        accountName: this.accountName
      };
      this.balanceSTR =  this.$chainStrReformat((await this.getBalanceFromChain(payload)))
    },

  },
  async mounted() {
    await this.autoLogin(this.$route.query.returnUrl);
    await this.getBalance();
  }
};
</script>

<style lang="scss" scoped>
// .account-badge {
//   border-radius: 16px;
//   max-height: 32px;
//   padding: 4px 10px;
//   background-color: $primary;
//   font-size: 14px;
//   font-weight: bold;
//   color: $secondary;
// }
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
</style>
