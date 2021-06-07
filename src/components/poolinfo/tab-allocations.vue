<template>
  <div class="column justify-between">
    <div class="row justify-between" v-if="hasAllocations">
      <h6>Allocation:</h6>
      <h5>
        {{ this.$chainStrReformat(allocationData.allocation, tokenDecimals) }}
      </h5>
    </div>
    <div class="row justify-between" v-if="hasAllocations">
      <h6>Vesting:</h6>
      <h5>{{ this.$toChainString(vesting, tokenDecimals, tokenSymbol) }}</h5>
    </div>
    <div class="row justify-between" v-if="hasAllocations">
      <h6>To be claimed:</h6>
      <h5>{{ this.$toChainString(claimable, tokenDecimals, tokenSymbol) }}</h5>
    </div>
    <div class="row justify-between" v-if="hasAllocations">
      <h6>Claimed:</h6>
      <h5>{{ this.$toChainString(claimed, tokenDecimals, tokenSymbol) }}</h5>
    </div>
    <div
      v-if="hasAllocations"
      class="text-left q-pt-md text-caption text-grey-7"
    >
      <q-icon name="fas fa-info-circle" class="q-pr-xs" />Your tokens will be
      sent as soon as the pool is closed. In the event that the number of
      participating accounts become too big for the Telos blockchain to send all
      tokens in a single transaction, you will be able to claim your allocation
      from this tab.
    </div>
    <q-btn
      outline
      color="accent"
      label="Release tokens"
      class="hover-accent self-end q-mt-md"
      v-if="
        hasAllocations &&
          Date.now() > pool.public_end + poolclosedelay &&
          pool.pool_status === 'completed'
      "
      @click="tryClosePool"
    />
    <q-btn
      outline
      color="accent"
      label="Claim"
      class="hover-accent self-end q-mt-md"
      v-if="
        hasAllocations && ['filled', 'cancelled'].includes(pool.pool_status)
      "
      @click="tryClaimTokens"
    />
    <p class="q-pt-md text-grey-6" v-if="!hasAllocations">
      No allocation to show.
    </p>
    <q-inner-loading :showing="loadingData">
      <q-spinner-puff size="50px" color="primary" />
    </q-inner-loading>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

export default {
  name: "tab-allocations",
  props: {
    pool: {
      required: true
    }
  },
  data() {
    return {
      loadingData: true,
      allocationData: {},
      poolclosedelay: 86400000 //24 hours to miliseconds
      // poolclosedelay: 0 //24 hours to miliseconds
    };
  },

  computed: {
    ...mapGetters("account", ["isAuthenticated", "accountName"]),
    hasAllocations() {
      return Object.keys(this.allocationData).length > 0;
    },
    allocation() {
      return this.$chainToQty(this.allocationData.allocation);
    },
    claimable() {
      if (this.hasAllocations) {
        if (this.pool.token_lockup) {
          let start = new Date(
            this.allocationData.lockup_start + "Z"
          ).valueOf();
          let percent = this.allocationData.lockup_percent / 10000;
          let period = this.allocationData.lockup_period;
          console.log(
            `Start: ${start}, Percent: ${percent}, Period: ${period}`
          );
          console.log(`Date.now() - start: ${Date.now() - start}`);
          console.log(`Alloc: ${this.allocation}`);
          return (
            this.allocation *
            (1 - (percent * (Date.now() - start)) / period - 1)
          );
        } else return this.allocation;
      } else return 0;
    },
    claimed() {
      if (this.hasAllocations) {
        return this.$chainToQty(this.allocationData.distributed);
      } else return 0;
    },
    vesting() {
      if (this.hasAllocations) {
        return this.allocation - this.claimable - this.claimed;
      } else return 0;
    },
    tokenSymbol() {
      return this.$chainToSym(this.allocationData.allocation);
    },
    tokenDecimals() {
      return this.$chainToDecimals(this.allocationData.allocation);
    }
  },

  methods: {
    ...mapActions("pools", ["getAllocationByPool"]),

    async claimTokens() {
      const actions = [
        {
          account: process.env.CONTRACT_ADDRESS,
          name: "claim",
          data: {
            account: this.accountName,
            pool_id: this.pool.id
          }
        }
      ];
      const transaction = await this.$store.$api.signTransaction(actions);
    },

    async closePool() {
      const actions = [
        {
          account: process.env.CONTRACT_ADDRESS,
          name: "closepool",
          data: {
            pool_id: this.pool.id,
            send_tokens: false
          }
        }
      ];
      const transaction = await this.$store.$api.signTransaction(actions);
    },

    async tryClaimTokens() {
      try {
        await this.claimTokens();
        this.$q.notify({
          color: "green-4",
          textColor: "white",
          icon: "cloud_done",
          message: "Tokens claimed"
        });
        this.$router.push("/");
      } catch (error) {
        this.$errorNotification(error);
      }
    },

    async tryClosePool() {
      try {
        await this.closePool();
        this.$q.notify({
          color: "green-4",
          textColor: "white",
          icon: "cloud_done",
          message: "Pool completed"
        });
        this.$router.push({
          name: "pooldetails",
          params: { id: this.pool.id },
          query: { tab: "allocations" }
        });
        this.$router.push("/");
      } catch (error) {
        this.$errorNotification(error);
      }
    }
  },
  async mounted() {
    let payload = { account: this.accountName, poolID: this.pool.id };
    this.loadingData = true;
    this.allocationData = await this.getAllocationByPool(payload);
    this.loadingData = false;
  }
};
</script>
