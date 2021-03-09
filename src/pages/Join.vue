<template>
  <q-page>
    <!-- content -->
    <q-form>
      <div>{{ pool.title }}</div>
      <div>
        Minimum:
        {{ $fromChainString(pool.minimum_swap) + " " + BaseTokenSymbol }}
      </div>
      <div>
        Maximum:
        {{ $fromChainString(pool.maximum_allocation) + " " + BaseTokenSymbol }}
      </div>
      <div>Balance: {{ balance }} TODO</div>

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
        1 {{ BaseTokenSymbol }} =
        {{ $fromChainString(pool.swap_ratio.quantity) }} {{ TokenSymbol }}
      </div>
      <div>To {{ amount * $fromChainString(pool.swap_ratio.quantity) }}</div>
      <div>
        Remaining {{ $fromChainString(pool.remaining_offer).toFixed(0) }}
        {{ TokenSymbol }}
      </div>
      <q-btn label="Join Pool" @click="onSubmit" color="primary" />
    </q-form>
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
      base_token_symbol: ""
    };
  },

  computed: {
    ...mapGetters("pools", ["getAllPools", "getPoolByID", "getAllPoolIDs"]),
    ...mapGetters("account", ["isAuthenticated", "accountName"]),
    BaseTokenSymbol() {
      let idx = this.pool.base_token.sym.indexOf(",") + 1;
      return this.pool.base_token.sym.slice(idx);
    },
    TokenSymbol() {
      let idx = this.pool.swap_ratio.quantity.indexOf(" ") + 1;
      return this.pool.swap_ratio.quantity.slice(idx);
    }
  },

  methods: {
    ...mapActions("pools", ["getChainPoolByID", "getChainAccountInfo"]),
    getPoolInfo() {
      this.pool = this.getPoolByID(this.poolID);
    },

    validateInput(val) {
      return (
        (val >= this.$fromChainString(this.pool.minimum_swap) &&
          val <= this.$fromChainString(this.pool.maximum_allocation)) ||
        `Must be between minimum and mximum`
      );
    },

    setMax() {
      if (this.balance >= this.$fromChainString(this.pool.maximum_allocation)) {
        this.amount = this.$fromChainString(this.pool.maximum_allocation);
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
            pool_id: this.poolID
          }
        }
      ];
      const transaction = await this.$store.$api.signTransaction(actions);
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
    let payload = {
      address: this.pool.base_token.contract,
      sym: this.BaseTokenSymbol,
      accountName: this.accountName
    };
    this.getChainAccountInfo(payload);
  }
};
</script>
