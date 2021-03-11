<template>
  <q-page>
    <!-- content -->
    <q-form @submit="onSubmit">
      <q-btn
        :to="{ name: 'pooldetails', params: { id: poolID } }"
        outline
        color="primary"
        >Back</q-btn
      >
      <div>{{ pool.title }}</div>
      <div>
        Minimum:
        {{ $chainToQty(pool.minimum_swap) }} {{ BaseTokenSymbol }}
      </div>
      <div>
        Maximum:
        {{ $chainToQty(pool.maximum_allocation) }} {{ BaseTokenSymbol }}
      </div>
      <div>Balance: {{ balance }} {{ BaseTokenSymbol }}</div>

      <!-- Input with max button -->
      <div class="row">
        <q-input
          color="primary"
          v-model="amount"
          filled
          label="Amount"
          :rules="[validateInput]"
        >
          <template v-slot:append>
            <div class="row items-center justify-end">
              <q-btn label="Max" @click="setMax" color="primary" />
            </div>
          </template>
        </q-input>
      </div>
      <div>
        1 {{ BaseTokenSymbol }} = {{ $chainToQty(pool.swap_ratio.quantity) }}
        {{ TokenSymbol }}
      </div>
      <div>
        To {{ amount * $chainToQty(pool.swap_ratio.quantity) }}
        {{ TokenSymbol }}
      </div>
      <div>
        Remaining {{ $chainToQty(pool.remaining_offer).toFixed(0) }}
        {{ TokenSymbol }}
      </div>
      <q-item>
        <q-btn
          class="col"
          label="Join Pool"
          type="submit"
          color="primary"
          :disable="!isAuthenticated"
        />
        <q-tooltip v-if="!isAuthenticated">
          Connect wallet
        </q-tooltip>
      </q-item>
    </q-form>

    <q-dialog v-model="showTransaction" confirm>
      <q-card>
        <q-card-section class="row">
          <q-avatar icon="arrow_forward" color="primary" text-color="white" />
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
          <q-btn flat label="Ok" color="primary" @click="toAllocationsPage" v-close-popup></q-btn>
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

export default {
  data() {
    return {
      poolID: Number(this.$route.params.id),
      pool: this.$defaultPoolInfo,
      balance: 1,
      amount: 0,
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
      "getBalanceFromChain"
    ]),
    getPoolInfo() {
      this.pool = this.getPoolByID(this.poolID);
    },

    validateInput(val) {
      return (
        (val >= this.$chainToQty(this.pool.minimum_swap) &&
          val <= this.$chainToQty(this.pool.maximum_allocation)) ||
        `Must be between minimum and mximum`
      );
    },

    async getBalance() {
      let payload = {
        address: this.pool.base_token.contract,
        sym: this.BaseTokenSymbol,
        accountName: this.accountName
      };
      this.balance = this.$chainToQty(
        (await this.getBalanceFromChain(payload))[0]
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
      const actions = [
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
      ];
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

    async onSubmit() {
      if (!this.isAuthenticated) {
        this.$q.notify({
          color: "red-5",
          textColor: "white",
          icon: "warning",
          message: "You need to login first"
        });
      } else {
        this.checkAllowed();
        await this.joinPoolTransaction();
        this.$q.notify({
          color: "green-4",
          textColor: "white",
          icon: "cloud_done",
          message: "Submitted"
        });
      }
    }
  },

  async mounted() {
    await this.loadChainData();
    this.getPoolInfo();

    if (this.isAuthenticated) {
      this.getBalance();
    }
  }
};
</script>
