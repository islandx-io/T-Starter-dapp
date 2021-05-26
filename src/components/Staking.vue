<template>
  <q-dialog ref="dialog" @hide="onDialogHide">
    <q-card class="col-shrink column items-center">
      <div class="text-h2 q-py-sm text-center">Staking Rewards</div>
      <div class="col-shrink row">
        <div class="col-sm col-xs-12 column items-center q-pa-md q-gutter-y-sm">
          <!-- START balance  -->
          <div class="text-center">
            <span class="text-weight-light text-subtitle2">START Balance</span>
            <br />{{ balanceSTARTstr }}
          </div>
          <!-- Stake input -->
          <q-input outlined v-model="amountStake">
            <template v-slot:append>
              <q-btn
                class="col-shrink"
                label="Max"
                @click="setStakeMax"
                color="positive"
                outline
              />
            </template>
          </q-input>
          <q-btn
            class="hover-accent"
            color="primary"
            label="Stake"
            @click="tryStake()"
          />
        </div>
        <div class="col-sm col-xs-12 column items-center q-pa-md q-gutter-y-sm">
          <!-- Staked amount -->
          <div class="text-center">
            <span class="text-weight-light text-subtitle2">START Staked</span>
            <br />{{ stakedSTARTstr }}
          </div>
          <!-- Unstake input -->
          <q-input outlined v-model="amountUnstake">
            <template v-slot:append>
              <q-btn
                class="col-shrink"
                label="Max"
                @click="setUnstakeMax"
                color="positive"
                outline
              />
            </template>
          </q-input>
          <q-btn
            class="hover-accent"
            color="primary"
            label="Unstake"
            @click="tryUnstake()"
          />
        </div>
      </div>
      <div class="text-bold">Claimable rewards:</div>
      <div v-if="claimableRewards.length === 0">
        No rewards to claim yet.
      </div>
      <div
        v-else
        v-for="token in claimableRewards"
        :key="'balance-' + token.sym"
      >
        {{ token.balance }}
      </div>
      <div v-if="lifetimeTotal.length > 0">
        <div class="text-bold">Lifetime Total:</div>
        <div v-for="token in lifetimeTotal" :key="'lifetime-' + token.sym">
          {{ token.lifetime_total }}
        </div>
      </div>
      <q-btn class="hover-accent" color="primary" label="Claim Rewards" />
      <!-- buttons example -->
      <!-- <q-card-actions align="right">
            <q-btn color="primary" label="OK" @click="onOKClick" />
            <q-btn color="primary" label="Cancel" @click="onCancelClick" />
          </q-card-actions> -->
    </q-card>
  </q-dialog>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

export default {
  props: {
    // ...your custom props
  },
  data() {
    return {
      amountStake: 0,
      amountUnstake: 0
    };
  },

  computed: {
    ...mapGetters("account", [
      "isAuthenticated",
      "accountName",
      "loading",
      "isAutoLoading",
      "wallet",
      "stakeWallet"
    ]),

    START_info() {
      return this.wallet.find(el => (el.sym = "START"));
    },

    balanceSTARTstr() {
      if (this.START_info.balance != 0) {
        return this.$toChainString(
          this.START_info.balance,
          this.START_info.decimals,
          this.START_info.sym
        );
      } else {
        return "0.0000 START";
      }
    },

    stakedSTARTstr() {
      if (this.START_info.staked != 0) {
        return this.$toChainString(
          this.START_info.staked,
          this.START_info.decimals,
          this.START_info.sym
        );
      } else {
        return "0.0000 START";
      }
    },

    claimableRewards() {
      return this.stakeWallet.filter(
        token => this.$chainToQty(token.balance) > 0
      );
    },
    lifetimeTotal() {
      return this.stakeWallet.filter(
        token => this.$chainToQty(token.lifetime_total) > 0
      );
    }
  },

  methods: {
    ...mapActions("account", [
      "login",
      "logout",
      "autoLogin",
      "getChainSTART",
      "getChainStakeWalletTable"
    ]),
    ...mapActions("pools", ["getBalanceFromChain"]),
    // following method is REQUIRED
    // (don't change its name --> "show")
    show() {
      this.$refs.dialog.show();
    },

    // following method is REQUIRED
    // (don't change its name --> "hide")
    hide() {
      this.$refs.dialog.hide();
    },

    onDialogHide() {
      // required to be emitted
      // when QDialog emits "hide" event
      this.$emit("hide");
    },

    onOKClick() {
      // on OK, it is REQUIRED to
      // emit "ok" event (with optional payload)
      // before hiding the QDialog
      this.$emit("ok");
      // or with payload: this.$emit('ok', { ... })

      // then hiding dialog
      this.hide();
    },

    onCancelClick() {
      // we just need to hide dialog
      this.hide();
    },

    setStakeMax() {
      console.log("Stake max");
      this.amountStake = this.START_info.balance;
    },

    setUnstakeMax() {
      console.log("UnStake max");
      this.amountUnstake = this.START_info.staked;
    },

    balanceAvailable(balance) {
      return this.$chainToQty(balance) > 0;
    },

    async reclaimStake(amount_str) {
      const actions = [
        {
          account: process.env.CONTRACT_ADDRESS,
          name: "reclaimstake",
          data: {
            account: this.accountName,
            quantity: amount_str
          }
        }
      ];
      const transaction = await this.$store.$api.signTransaction(actions);
    },

    async updateStake() {
      const actions = [
        {
          account: process.env.CONTRACT_ADDRESS,
          name: "updatestake",
          data: {
            account: this.accountName
          }
        }
      ];
      const transaction = await this.$store.$api.signTransaction(actions);
    },

    async stake(amount_str) {
      let actions = [];
      if (this.amountStake >= this.START_info.liquid) {
        let amountNeeded = this.amountStake - this.START_info.liquid;

        // if not enough in liquid, take from balance
        actions.push({
          account: this.START_info.token_contract,
          name: "transfer",
          data: {
            from: this.accountName,
            to: process.env.CONTRACT_ADDRESS,
            quantity: this.$toChainString(
              amountNeeded,
              this.START_info.decimals,
              this.START_info.sym
            ),
            memo: `Send ${this.START_info.sym} to liquid`
          }
        });
      }
      // stake amount
      actions.push({
        account: process.env.CONTRACT_ADDRESS,
        name: "stake",
        data: {
          account: this.accountName,
          quantity: amount_str
        }
      });
      const transaction = await this.$store.$api.signTransaction(actions);
    },

    async unstake(amount_str) {
      const actions = [
        {
          account: process.env.CONTRACT_ADDRESS,
          name: "unstake",
          data: {
            account: this.accountName,
            quantity: amount_str
          }
        }
      ];
      const transaction = await this.$store.$api.signTransaction(actions);
    },

    async tryStake() {
      try {
        let amount_str = this.$toChainString(
          this.amountStake,
          this.START_info.decimals,
          this.START_info.sym
        );
        await this.stake(amount_str);
        this.$q.notify({
          color: "green-4",
          textColor: "white",
          icon: "cloud_done",
          message: "Staked"
        });
        this.hide();
      } catch (error) {
        this.$q.notify({
          color: "red-5",
          textColor: "white",
          icon: "warning",
          message: `${error}`
        });
      }
    },

    async tryUnstake() {
      try {
        let amount_str = this.$toChainString(
          this.amountUnstake,
          this.START_info.decimals,
          this.START_info.sym
        );
        await this.unstake(amount_str);
        this.$q.notify({
          color: "green-4",
          textColor: "white",
          icon: "cloud_done",
          message: "Unstaking"
        });
        this.hide();
      } catch (error) {
        this.$q.notify({
          color: "red-5",
          textColor: "white",
          icon: "warning",
          message: `${error}`
        });
      }
    }
  },

  async mounted() {
    await this.getChainSTART(this.accountName);
    await this.getChainStakeWalletTable(this.accountName);
  }
};
</script>

<style lang="scss" scoped>
.text-h2 {
  line-height: 3rem;
}
</style>
