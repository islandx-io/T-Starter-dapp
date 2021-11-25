<template>
  <div class="column justify-between">
    <div class="row justify-between" v-if="hasAllocation">
      <h6>Bid:</h6>
      <h5>{{ this.$chainStrReformat(allocationData.bid) }}</h5>
    </div>
    <div class="row justify-between" v-if="hasAllocation">
      <h6>Allocation:</h6>
      <h5>
        {{ this.$chainStrReformat(allocationData.allocation, tokenDecimals) }}
      </h5>
    </div>
    <div
      class="row justify-between"
      v-if="hasAllocation && this.pool.token_lockup"
    >
      <h6>Vesting:</h6>
      <h5>{{ this.$toChainString(vesting, tokenDecimals, tokenSymbol) }}</h5>
    </div>
    <div
      class="row justify-between"
      v-if="hasAllocation && this.pool.token_lockup && canClaim"
    >
      <h6>To be claimed:</h6>
      <h5>{{ this.$toChainString(available, tokenDecimals, tokenSymbol) }}</h5>
    </div>
    <div
      class="row justify-between"
      v-if="hasAllocation && this.pool.token_lockup && canClaim"
    >
      <h6>Claimed:</h6>
      <h5>
        {{ this.$toChainString(distributed, tokenDecimals, tokenSymbol) }}
      </h5>
    </div>
    <!-- <div
      v-if="hasAllocation"
      class="text-left q-pt-md text-caption text-grey-7"
    >
      <q-icon name="fas fa-info-circle" class="q-pr-xs" />Your tokens will be
      sent as soon as the pool is closed. In the event that the number of
      participating accounts become too big for the Telos blockchain to send all
      tokens in a single transaction, you will be able to claim your allocation
      from this tab, 24 hours after the pool ends.
    </div> -->
    <div
      v-if="hasAllocation"
      class="text-left q-pt-md text-caption text-grey-7"
    >
      <q-icon name="fas fa-info-circle" class="q-pr-xs" />Your tokens will be
      distributed as soon as round 4 ends. In the event that the number of
      participating accounts become too big for the Telos blockchain to send all
      tokens in a single transaction, you will be able to claim your allocation
      from this tab, 24 hours after the final pool ends.
    </div>
    <!-- <q-btn
      outline
      color="accent"
      label="Release tokens"
      class="hover-accent self-end q-mt-md"
      v-if="canRelease"
      @click="tryClosePool"
    />
    <q-btn
      outline
      color="accent"
      label="Claim"
      class="hover-accent self-end q-mt-md"
      v-if="canClaim"
      @click="tryClaimTokens"
    /> -->
    <p class="q-pt-md text-grey-6" v-if="!hasAllocation">
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
      poolCloseDelay: 86400000 //24 hours to miliseconds
      // poolCloseDelay: 0 //24 hours to miliseconds
    };
  },

  computed: {
    ...mapGetters("account", ["isAuthenticated", "accountName"]),
    hasAllocation() {
      return Object.keys(this.allocationData).length > 0;
    },
    canRelease() {
      return (
        this.hasAllocation &&
        Date.now() > this.pool.public_end + this.poolCloseDelay &&
        this.pool.pool_status === "completed"
      );
    },
    canClaim() {
      return (
        this.hasAllocation &&
        ["filled", "cancelled"].includes(this.pool.pool_status)
      );
    },
    allocation() {
      return this.$chainToQty(this.allocationData.allocation);
    },
    available() {
      if (this.hasAllocation) {
        let allocation = this.allocation;
        if (this.pool.token_lockup) {
          // TODO Check logic of this condition
          let now = Date.now();
          let start = new Date(
            this.allocationData.lockup_start + "Z"
          ).valueOf();
          let percent = this.allocationData.lockup_percent / 10000;
          let period = this.allocationData.lockup_period * 1000 * 60 * 60 * 24;
          let end = start + period;
          // console.log(
          //   `Start: ${start}, Now: ${now}, End: ${end}, Percent: ${percent}, Period: ${period}`
          // );
          if (now < start) {
            return allocation * (1 - percent) - this.distributed;
          } else if (start <= now && now <= end) {
            const f = (now - start) / period;
            return allocation * (1 + percent * (f - 1)) - this.distributed;
          } else {
            return allocation - this.distributed;
          }
        } else return allocation;
      } else return 0;
    },
    distributed() {
      if (this.hasAllocation) {
        return this.$chainToQty(this.allocationData.distributed);
      } else return 0;
    },
    vesting() {
      if (this.hasAllocation) {
        return this.allocation - this.available - this.distributed;
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
        await this.$listeners.loadChainData();
        await this.$listeners.getPoolInfo();
        await this.$listeners.defaultTab();
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
        await this.$listeners.loadChainData();
        await this.$listeners.getPoolInfo();
        await this.$listeners.defaultTab();
        // this.$router.push("/");
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
  },
  watch: {
    async accountName() {
      let payload = { account: this.accountName, poolID: this.pool.id };
      this.loadingData = true;
      this.allocationData = await this.getAllocationByPool(payload);
      this.loadingData = false;
    }
  }
};
</script>
