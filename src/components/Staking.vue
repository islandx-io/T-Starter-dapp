<template>
  <q-dialog ref="dialog" @hide="onDialogHide">
    <q-card class="q-dialog-plugin">
      <div class="row">
        <div class="col">
          <!-- START balance  -->
          START Balance
          {{ balanceSTARTstr }}

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

          <q-btn color="primary" label="Stake" @click="tryStake()" />
        </div>

        <div class="col">
          <!-- Staked amount -->
          Staked START Balance
          {{ stakedSTARTstr }}

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

          <q-btn color="primary" label="Unstake" @click="tryUnstake()" />
        </div>
      </div>

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
      amountUnstake: 0,
      // balanceSTARTstr: "0.0000 START",
      // stakedSTARTstr: "0.0000 START"
    };
  },

  computed: {
    ...mapGetters("account", [
      "isAuthenticated",
      "accountName",
      "loading",
      "isAutoLoading", "wallet"
    ]),

    balanceSTARTstr() {
      let START_info = this.wallet.find(el => el.sym = 'START')
      if (START_info.balance != 0) {
        return this.$toChainString(START_info.balance, START_info.decimals, START_info.sym)
      } else {
        return "0.0000 START"
      }
    },

    stakedSTARTstr() {
      let START_info = this.wallet.find(el => el.sym = 'START')
      if (START_info.staked != 0) {
        return this.$toChainString(START_info.staked, START_info.decimals, START_info.sym)
      } else {
        return "0.0000 START"
      }
    }

  },

  methods: {
    ...mapActions("account", ["login", "logout", "autoLogin", "getChainSTART"]),
    ...mapActions("pools", ["getBalanceFromChain",]),
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
    },

    setUnstakeMax() {
      console.log("UnStake max");
    },

    tryStake() {
      console.log("Try stake");
    },

    tryUnstake() {
      console.log("Try unstake");
    }
  },

  async mounted() {
    await this.getChainSTART(this.accountName);
  }
};
</script>
