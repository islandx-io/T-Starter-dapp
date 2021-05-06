<template>
  <q-dialog ref="dialog" @hide="onDialogHide">
    <q-card class="q-dialog-plugin">
      <div class="row">
        <div class="col">
          <!-- START balance  -->
          <div class="text-center">START Balance</div>
          <div class="text-center">{{ balanceSTARTstr }}</div>    
          
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

          <q-btn class="" color="primary" label="Stake" @click="tryStake()" />
        </div>

        <div class="col">
          <!-- Staked amount -->          
          <div class="text-center">Staked START Balance</div>
          <div class="text-center">{{ stakedSTARTstr }}</div>
          

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
    };
  },

  computed: {
    ...mapGetters("account", [
      "isAuthenticated",
      "accountName",
      "loading",
      "isAutoLoading", "wallet"
    ]),

    START_info() {
      return this.wallet.find(el => el.sym = 'START')
    },

    balanceSTARTstr() {
      if (this.START_info.balance != 0) {
        return this.$toChainString(this.START_info.balance, this.START_info.decimals, this.START_info.sym)
      } else {
        return "0.0000 START"
      }
    },

    stakedSTARTstr() {
      if (this.START_info.staked != 0) {
        return this.$toChainString(this.START_info.staked, this.START_info.decimals, this.START_info.sym)
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
      this.amountStake = this.START_info.balance
    },

    setUnstakeMax() {
      console.log("UnStake max");
      this.amountUnstake = this.START_info.staked
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
        let amountNeeded = this.amountStake - this.START_info.liquid

       // if not enough in liquid, take from balance
       actions.push(
          {
            account: this.START_info.token_contract,
            name: "transfer",
            data: {
              from: this.accountName,
              to: process.env.CONTRACT_ADDRESS,
              quantity: this.$toChainString(amountNeeded, this.START_info.decimals, this.START_info.sym),
              memo: `Send ${this.START_info.sym} to liquid`
            }
          }
        )
      }
      // stake amount
      actions.push(
        {
          account: process.env.CONTRACT_ADDRESS,
          name: "stake",
          data: {
            account: this.accountName,
            quantity: amount_str
          }
        }
      );
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
        this.hide()
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
  }
};
</script>
