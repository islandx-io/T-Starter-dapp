<template>
  <q-dialog ref="dialog" @hide="onDialogHide">
    <q-card class="col-shrink">
      <div class="column items-center">
        <div class="text-h2 q-py-sm text-center">Staking Rewards</div>
        <div class="col-shrink row">
          <div
            class="col-sm col-xs-12 column items-center q-pa-md q-gutter-y-sm"
          >
            <!-- START balance  -->
            <div class="text-center">
              <span class="text-weight-light text-subtitle2"
                >START Balance</span
              >
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
          <div
            class="col-sm col-xs-12 column items-center q-pa-md q-gutter-y-sm"
          >
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
        <q-table
          v-if="isAuthenticated && stakeWallet.length > 0"
          class=" wallet-inner-table "
          :data="stakeWallet"
          :columns="columns"
          row-key="sym"
          hide-pagination
          :pagination="{ rowsPerPage: 500 }"
          dense
        >
          <template v-slot:header="props">
            <q-tr :props="props">
              <q-th
                v-for="col in props.cols"
                :key="col.name"
                :props="props"
                style="font-size: 1.2rem; color: gray"
              >
                {{ col.label }}
              </q-th>
            </q-tr>
          </template>
          <template v-slot:body="props">
            <q-tr :props="props" :key="props.row.sym">
              <!-- Avatar -->
              <q-td :props="props" :key="props.cols[0].name">
                <div class="row justify-start items-center">
                  <token-avatar
                    :token="props.row.sym"
                    :avatar="props.row.avatar"
                    :avatarSize="35"
                    class="q-mr-sm"
                  />
                  <div>{{ props.cols[0].value }}</div>
                </div>
              </q-td>
              <!-- Claimable, Claimed -->
              <q-td
                :props="props"
                v-for="col in props.cols.slice(1, 3)"
                :key="col.name"
              >
                {{ col.value === 0 ? 0 : $formatTableDecimals(col, props) }}
              </q-td>
            </q-tr>
          </template>
        </q-table>
        <div class="text-subtitle1 text-center" v-if="stakeWallet.length === 0">
          Stake START and earn rewards. <br />Then claim here to transfer the
          funds to your account.
        </div>
        <q-btn
          class="hover-accent q-my-md"
          color="primary"
          label="Claim Rewards"
          :disable="!hasClaimableRewards"
          @click="claim"
        />
        <!-- <div>{{ stakeWallet }}</div> -->
      </div>
    </q-card>
  </q-dialog>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import tokenAvatar from "src/components/TokenAvatar";

export default {
  props: {
    // ...your custom props
  },
  components: { tokenAvatar },
  data() {
    return {
      amountStake: 0,
      amountUnstake: 0,
      // prettier-ignore
      columns: [
        { name: "token", label: "Token", field: "sym", align: "center" },
        { name: "balance", label: "Claimable", field: "balance", align: "center", format(val) {
          if (val > 0) return val
          else return 0
        }},
        { name: "lifetime_total", label: "Claimed", field: "lifetime_total", align: "center", format(val) {
          if (val > 0) return val
          else return 0
        }},
      ]
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

    hasClaimableRewards() {
      return this.stakeWallet.filter(token => token.balance > 0).length > 0;
    }
  },

  methods: {
    ...mapActions("account", [
      "login",
      "logout",
      "autoLogin",
      "getChainSTART",
      "getChainStakeWallet"
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
    },

    async claim() {
      try {
        const actions = [
          {
            account: process.env.STAKE_ADDRESS,
            name: "refresh",
            data: {
              account: this.accountName
            }
          },
          {
            account: process.env.STAKE_ADDRESS,
            name: "claimrewards",
            data: {
              account: this.accountName
            }
          }
        ];
        await this.$store.$api.signTransaction(actions);
      } catch (error) {
        this.$q.notify({
          color: "red-5",
          textColor: "white",
          icon: "warning",
          message: `${error}`
        });
      }
      await this.getChainStakeWallet(this.accountName);
    }
  },

  async mounted() {
    await this.getChainSTART(this.accountName);
    await this.getChainStakeWallet(this.accountName);
  }
};
</script>

<style lang="scss" scoped>
.text-h2 {
  line-height: 3rem;
}
// .q-table td,
// .q-table td {
//   padding: 0;
// }
</style>
