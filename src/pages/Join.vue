<template>
  <q-page>
    <!-- content -->
    <section class="header-bg" />
    <section class="body-container">
      <q-card class="card-container">
        <q-btn
          :to="{ name: 'pooldetails', params: { id: poolID } }"
          color="primary"
          flat
          round
          class="self-start"
        >
          <q-icon name="fas fa-chevron-circle-left" style="font-size: 50px;" />
        </q-btn>
        <q-form @submit="onSubmit">
          <div>
            <div class="row justify-center">
              <h2>{{ pool.title }}</h2>
            </div>

            <!---------->
            <!-- From -->
            <!---------->
            <q-item dense class="text-h6">From</q-item>
            <q-card flat bordered class="inner-card row ">
              <div class="row ">
                <q-input
                  class="col input-amount q-pr-lg"
                  color="primary"
                  v-model="amount"
                  :rules="[validateInput]"
                  borderless
                />
                <div class="column items-end justify-between">
                  <div>Balance: {{ balance }} {{ BaseTokenSymbol }}</div>
                  <div class="row q-gutter-x-sm">
                    <q-btn
                      class="col-shrink"
                      label="Max"
                      @click="setMax"
                      color="positive"
                      outline
                    />
                    <q-avatar size="40px">
                      <!-- TODO Create a common component avatars -->
                      <q-icon
                        v-if="BaseTokenSymbol === 'PETH'"
                        name="fab fa-ethereum"
                        size="40px"
                        style="color: rgb(130 168 248) "
                      />
                      <q-icon
                        v-if="BaseTokenSymbol === 'PBTC'"
                        name="fab fa-bitcoin"
                        size="42px"
                        class="bg-secondary"
                        style="color: rgb(247 143 22)"
                      />
                    </q-avatar>
                    <div class="text-h4">{{ BaseTokenSymbol }}</div>
                  </div>
                </div>
              </div>
            </q-card>
            <div class="row justify-between" style="padding: 5px 20px">
              <div>
                Minimum:
                {{ $chainToQty(pool.minimum_swap) }} {{ BaseTokenSymbol }}
              </div>
              <div>
                Maximum:
                {{ $chainToQty(pool.maximum_allocation) }}
                {{ BaseTokenSymbol }}
              </div>
            </div>

            <!-------->
            <!-- To -->
            <!-------->
            <q-item dense class="text-h6">To</q-item>
            <q-card flat bordered class="inner-card row ">
              <div class="col row justify-between ">
                <div
                  class="col input-amount q-pr-lg"
                  style="margin-top:-8px; padding-bottom: 8px"
                >
                  {{ amount * $chainToQty(pool.swap_ratio.quantity) }}
                </div>
                <div class="column items-end justify-between content-end">
                  <!-- <div>Balance: ***** {{ TokenSymbol }}</div> -->
                  <div class="row q-gutter-x-sm content-end">
                    <q-avatar size="40px">
                      <q-img
                        v-if="pool.avatar"
                        :src="pool.avatar"
                        style="width: 80px"
                      >
                      </q-img>
                    </q-avatar>
                    <div class="text-h4">{{ TokenSymbol }}</div>
                  </div>
                </div>
              </div>
            </q-card>
            <div class="row justify-between" style="padding: 5px 20px">
              <div>
                1 {{ BaseTokenSymbol }} =
                {{ $chainToQty(pool.swap_ratio.quantity) }}
                {{ TokenSymbol }}
              </div>
              <div>
                Remaining {{ $chainToQty(pool.remaining_offer).toFixed(0) }}
                {{ TokenSymbol }}
              </div>
            </div>

            <!------------>
            <!-- Submit -->
            <!------------>
            <q-item class="q-py-lg">
              <q-item-section>
                <q-btn
                  label="Join Pool"
                  type="submit"
                  color="primary"
                  :disable="
                    !isAuthenticated ||
                      balance <= $chainToQty(pool.minimum_swap) ||
                      pool.pool_status !== `open`
                  "
                />
              </q-item-section>
              <q-tooltip v-if="!isAuthenticated">
                Connect wallet
              </q-tooltip>
              <q-tooltip v-if="balance <= $chainToQty(pool.minimum_swap)">
                Zero balance
              </q-tooltip>
            </q-item>
          </div>
        </q-form>

        <!-- Not enough START to participate in private pool -->
        <q-dialog v-model="eligible_warning">
          <q-card>
            <q-card-section>
              <div class="text-h6">Alert</div>
            </q-card-section>

            <q-card-section class="q-pt-none">
              Not enough START tokens to participate in a private pool. Buy here
              ~linky link~
            </q-card-section>

            <q-card-actions align="right">
              <q-btn flat label="OK" color="primary" v-close-popup />
            </q-card-actions>
          </q-card>
        </q-dialog>

        <!-- Confirm stake dialog -->
        <q-dialog v-model="confirm_stake" persistent>
          <q-card>
            <q-card-section class="row items-center">
              <q-avatar
                icon="fas fa-money-bill-alt"
                color="primary"
                text-color="white"
              />
              <span class="q-ml-sm"
                >Confirm staking additional 500 START tokens for private
                access?</span
              >
            </q-card-section>

            <q-card-actions align="right">
              <q-btn flat label="Cancel" color="primary" v-close-popup />
              <q-btn
                flat
                label="Confirm"
                color="primary"
                @click="tryTransaction"
                v-close-popup
              />
            </q-card-actions>
          </q-card>
        </q-dialog>

        <!-- Transaction sent dialog -->
        <q-dialog v-model="showTransaction" confirm>
          <q-card>
            <q-card-section class="row">
              <q-avatar
                icon="arrow_forward"
                color="primary"
                text-color="white"
              />
              <span class="q-ml-sm">
                Transaction sent, click to view in block explorer.
              </span>
              <q-item
                clickable
                tag="a"
                target="_blank"
                :href="`${explorerUrl}/transaction/${transaction}`"
                class="q-ml-sm"
                >{{ transaction }}</q-item
              >
            </q-card-section>
            <q-card-actions align="right">
              <q-btn
                flat
                label="Ok"
                color="primary"
                @click="toAllocationsPage"
                v-close-popup
              ></q-btn>
            </q-card-actions>
          </q-card>
        </q-dialog>
      </q-card>
    </section>
  </q-page>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

export default {
  data() {
    return {
      poolID: Number(this.$route.params.id),
      pool: this.$defaultPoolInfo,
      balance: 0,
      amount: 0,
      alreadyStaked: false,
      confirm_stake: false,
      eligible_warning: false,
      premium_stake: {},
      base_token_symbol: "",
      showTransaction: null,
      transaction: null,
      explorerUrl: process.env.NETWORK_EXPLORER
    };
  },

  computed: {
    ...mapGetters("pools", ["getAllPools", "getPoolByID", "getAllPoolIDs"]),
    ...mapGetters("account", ["isAuthenticated", "accountName"]),
    BaseTokenSymbol() {
      let idx = this.pool.base_token.sym.indexOf(",") + 1;
      return this.pool.base_token.sym.slice(idx);
    },
    BaseTokenDecimals() {
      let idx = this.pool.base_token.sym.indexOf(",");
      return Number(this.pool.base_token.sym.slice(0, idx));
    },
    TokenSymbol() {
      let idx = this.pool.swap_ratio.quantity.indexOf(" ") + 1;
      return this.pool.swap_ratio.quantity.slice(idx);
    }
  },

  methods: {
    ...mapActions("pools", [
      "getChainPoolByID",
      "getChainAccountInfo",
      "getBalanceFromChain",
      "getPremiumStake",
      "checkStakedChain"
    ]),
    getPoolInfo() {
      this.pool = this.getPoolByID(this.poolID);
    },

    validateInput(val) {
      return (
        (val >= this.$chainToQty(this.pool.minimum_swap) &&
          val <= this.$chainToQty(this.pool.maximum_allocation)) ||
        `Must be between minimum and maximum`
      );
    },

    async getBalance() {
      let payload = {
        address: this.pool.base_token.contract,
        sym: this.BaseTokenSymbol,
        accountName: this.accountName
      };
      console.log(await this.getBalanceFromChain(payload))
      this.balance = this.$chainToQty(
        (await this.getBalanceFromChain(payload))
      );
    },

    setMax() {
      if (this.balance >= this.$chainToQty(this.pool.maximum_allocation)) {
        this.amount = this.$chainToQty(this.pool.maximum_allocation);
      } else {
        this.amount = this.balance;
      }
    },

    checkAllowed() {
      // TODO check if whitelisted, joinable, private, public, balance (start tokens),
    },

    async loadChainData() {
      await this.getChainPoolByID(this.poolID);
    },

    async joinPoolTransaction() {
      const actions = [];
      if (this.pool.access_type === "Private" && !this.alreadyStaked) {
        console.log("this is private");
        actions.push(
          // send start if private
          {
            account: this.premium_stake.contract,
            name: "transfer",
            data: {
              from: this.accountName,
              to: process.env.CONTRACT_ADDRESS,
              quantity: this.premium_stake.quantity,
              memo: "Staking"
            }
          }
        );
      }
      actions.push(
        // transfer tokens
        {
          account: this.pool.base_token.contract,
          name: "transfer",
          data: {
            from: this.accountName,
            to: process.env.CONTRACT_ADDRESS,
            quantity: this.$toChainString(
              this.amount,
              this.BaseTokenDecimals,
              this.BaseTokenSymbol
            ),
            memo: "Join pool"
          }
        }
      );
      actions.push(
        // transfer to contract
        {
          account: process.env.CONTRACT_ADDRESS,
          name: "joinpool",
          data: {
            account: this.accountName,
            pool_id: this.poolID,
            quantity: this.$toChainString(
              this.amount,
              this.BaseTokenDecimals,
              this.BaseTokenSymbol
            )
          }
        }
      );
      console.log(actions);
      const transaction = await this.$store.$api.signTransaction(actions);
      if (transaction) {
        this.showTransaction = true;
        this.transaction = transaction.transactionId;
      }
    },

    toAllocationsPage() {
      this.$router.push({
        name: "pooldetails",
        params: { id: this.poolID },
        query: { tab: "allocations" }
      });
    },

    async tryTransaction() {
      try {
        await this.joinPoolTransaction();
        this.$q.notify({
          color: "green-4",
          textColor: "white",
          icon: "cloud_done",
          message: "Submitted"
        });
      } catch (error) {
        this.$q.notify({
          color: "red-5",
          textColor: "white",
          icon: "warning",
          message: "Transaction fail"
        });
      }
    },

    async onSubmit() {
      if (!this.isAuthenticated) {
        this.$q.notify({
          color: "red-5",
          textColor: "white",
          icon: "warning",
          message: "You need to login first"
        });
      } else {
        // this.checkAllowed();
        if (!this.alreadyStaked && this.pool.access_type === "Private") {
          this.confirm_stake = true;
        } else {
          this.tryTransaction();
        }
      }
    }
  },

  async mounted() {
    await this.loadChainData();
    await this.getPoolInfo();
    console.log(this.pool.access_type);

    if (this.isAuthenticated) {
      this.getBalance();
    }
    this.premium_stake = await this.getPremiumStake();

    // check stake if private pool
    this.alreadyStaked = await this.checkStakedChain(this.accountName);

    // if START balance not enough and is private pool, show dialog to buy
    let payload = {
      address: this.premium_stake.contract,
      sym: "START",
      accountName: this.accountName
    };
    let start_balance = this.$chainToQty(
      (await this.getBalanceFromChain(payload))
    );
    console.log("Start balance:" + start_balance)
    if (start_balance < this.$chainToQty(this.premium_stake.quantity && this.pool.access_type === "Private")) {
      this.eligible_warning = true;
    }
  }
};
</script>

<style lang="scss" scoped>
.body-container {
  max-width: 700px;
}
.card-container {
  display: grid;
  // grid-gap: 20px;
  align-items: stretch;
  grid-template-columns: 50px auto 50px;
  // grid-template-rows: min-content;
}
.header-bg {
  height: 160px;
  min-width: 490px;
  margin-bottom: -50px;
}
.inner-card {
  border: 1px solid rgb(194, 194, 194);
  padding: 15px 20px;
}
// .q-field__control {
//   display: flex;
//   align-items: flex-end;
// }
.input-amount {
  font-size: 50px;
  color: $primary;
}
</style>
