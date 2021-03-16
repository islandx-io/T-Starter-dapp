<template>
  <q-page>
    <!-- content -->
    <section class="header-bg" />
    <section class="body-container">
      <q-card class="card-container">
        <q-btn
          :to="{ name: 'pooldetails', params: { id: poolID } }"
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
                  type="text"
                  mask="#######"
                  placeholder="0"
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
                      <q-img
                        v-if="BaseTokenSymbol === 'PETH'"
                        size="40px"
                        src="~assets/tokens/peth.png"
                      />
                      <q-img
                        v-if="BaseTokenSymbol === 'PBTC'"
                        size="40px"
                        src="~assets/tokens/pbtc.png"
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
                {{ zeroNaN($chainToQty(pool.minimum_swap)) }}
                {{ BaseTokenSymbol }}
              </div>
              <div>
                Maximum:
                {{ zeroNaN($chainToQty(pool.maximum_swap)) }}
                {{ BaseTokenSymbol }}
              </div>
            </div>

            <q-item class="justify-center">
              <q-icon name="fas fa-arrow-down" size="50px" color="primary" />
            </q-item>
            <!-------->
            <!-- To -->
            <!-------->
            <q-item dense class="text-h6">To</q-item>
            <q-card flat bordered class="inner-card row ">
              <div class="col row justify-between items-center ">
                <div class="col input-amount q-pr-lg">
                  {{ zeroNaN(amount * $chainToQty(pool.swap_ratio.quantity)) }}
                </div>
                <div class="column items-end justify-between content-end">
                  <div class="row q-gutter-x-sm content-end">
                    <q-avatar size="40px">
                      <q-img
                        v-if="pool.avatar"
                        :src="pool.avatar"
                        style="width: 40px; height: 40px"
                        alt="Avatar"
                      >
                        <template v-slot:error>
                          <div
                            class="transparent"
                            style="padding: 0"
                            v-html="identicon"
                          />
                        </template>
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
                {{ zeroNaN($chainToQty(pool.swap_ratio.quantity)) }}
                {{ TokenSymbol }}
              </div>
              <div>
                Remaining
                {{ zeroNaN($chainToQty(pool.remaining_offer).toFixed(0)) }}
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
                      pool.pool_status !== `open` ||
                      not_enough_start
                  "
                />
                <div v-if="not_enough_start" class="q-pt-sm self-center">
                  You do not have enough START tokens to participate in this
                  pool.
                  <a href="#">Get here</a>
                </div>
              </q-item-section>
              <q-tooltip v-if="!isAuthenticated">
                Connect wallet
              </q-tooltip>
              <q-tooltip v-if="balance <= $chainToQty(pool.minimum_swap)">
                Zero balance
              </q-tooltip>
              <q-tooltip v-if="not_enough_start">
                Not enough START
              </q-tooltip>
            </q-item>
          </div>
        </q-form>

        <!-- Not enough START to participate in private pool -->
        <q-dialog v-model="stake_warning">
          <q-card>
            <q-card-section class="row items-center">
              <q-icon
                name="fas fa-exclamation-circle"
                size="lg"
                class="q-pr-sm"
                color="primary"
              />
              <div class="text-h6">Private pool</div>
            </q-card-section>

            <q-card-section class="q-pt-none">
              You don't have enough START tokens to participate in a private
              pool.
            </q-card-section>

            <q-card-actions align="right">
              <q-btn
                outline
                to="#"
                label="Buy START"
                color="accent"
                class="hover-accent"
              />
              <q-btn flat label="OK" color="primary" v-close-popup />
            </q-card-actions>
          </q-card>
        </q-dialog>

        <!-- Confirm stake dialog -->
        <q-dialog v-model="confirm_stake" persistent>
          <q-card>
            <q-card-section class="row items-center">
              <q-avatar color="primary" text-color="secondary" class="q-mr-sm">
                <q-icon name="fas fa-coins" size="28px" />
              </q-avatar>
              <span class="text-h6">Confirm stake</span>
            </q-card-section>
            <q-card-section>
              <span>
                Confirm staking additional 500 START tokens for private access?
              </span>
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
            <q-card-section class="row items-center">
              <q-icon
                name="fas fa-arrow-circle-right"
                size="lg"
                class="q-pr-sm"
                color="primary"
                text-color="white"
              />
              <span class="text-h6">
                Transaction placed
              </span>
            </q-card-section>
            <q-card-section>
              <q-item>
                <q-item-label lines="1">
                  fb00e168c7a5e7248aa44e28efa8776be78aa2da3610787b78d5c5827971860b
                  {{ transaction }}
                </q-item-label>
              </q-item>
            </q-card-section>
            <q-card-actions align="right">
              <q-btn
                :to="`/transaction/`"
                label="Boks.io"
                color="primary"
                flat
              />
              <q-btn
                flat
                label="pool page"
                color="primary"
                @click="toAllocationsPage"
                v-close-popup
              />
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
      amount: "",
      alreadyStaked: false,
      confirm_stake: false,
      stake_warning: false,
      not_enough_start: false,
      premium_stake: {},
      base_token_symbol: "",
      showTransaction: false,
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
    zeroNaN(val) {
      if (isNaN(val)) return 0;
      else return val;
    },
    getPoolInfo() {
      this.pool = this.getPoolByID(this.poolID);
    },

    validateInput(val) {
      return (
        (val >= this.$chainToQty(this.pool.minimum_swap) &&
          val <= this.$chainToQty(this.pool.maximum_swap)) ||
        `Must be between minimum and maximum`
      );
    },

    async getBalance() {
      let payload = {
        address: this.pool.base_token.contract,
        sym: this.BaseTokenSymbol,
        accountName: this.accountName
      };
      console.log(await this.getBalanceFromChain(payload));
      this.balance = this.$chainToQty(await this.getBalanceFromChain(payload));
    },

    setMax() {
      if (this.balance >= this.$chainToQty(this.pool.maximum_swap)) {
        this.amount = this.$chainToQty(this.pool.maximum_swap);
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
      await this.getBalanceFromChain(payload)
    );
    console.log("Start balance:" + start_balance);
    if (
      start_balance <
      this.$chainToQty(
        this.premium_stake.quantity && this.pool.access_type === "Private"
      )
    ) {
      this.stake_warning = true;
      this.not_enough_start = true;
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
a {
  text-decoration: none;
  color: $primary;
}
</style>
