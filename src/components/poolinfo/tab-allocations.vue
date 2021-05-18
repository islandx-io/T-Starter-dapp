<template>
  <div class="column justify-between">
    <div class="row justify-between" v-if="hasAllocations">
      <h6>Bid:</h6>
      <h5>{{ this.$chainStrReformat(data.bid) }}</h5>
    </div>
    <div class="row justify-between" v-if="hasAllocations">
      <h6>Allocation:</h6>
      <h5>{{ this.$chainStrReformat(data.allocation) }}</h5>
    </div>
    <div class="row justify-between" v-if="hasAllocations">
      <h6>Note:</h6>
      <p>
        Your tokens will be sent as soon as the pool is closed. In the event
        that the number of participating accounts become too big for the Telos
        blockchain to send all tokens in a single transaction, you will be able
        to claim your allocation from this tab.
      </p>
    </div>
    <q-btn
      outline
      color="accent"
      label="Release tokens"
      class="hover-accent self-end q-mt-md"
      v-if="
        hasAllocations &&
          Date.now() > pool.public_end + poolclosedelay &&
          pool.status === 'published'
      "
      @click="tryClosePool"
    />
    <q-btn
      outline
      color="accent"
      label="Claim"
      class="hover-accent self-end q-mt-md"
      v-if="hasAllocations && pool.status === ('success' || 'fail')"
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
      data: {},
      poolclosedelay: 86400000 //24 hours to miliseconds
      // poolclosedelay: 0 //24 hours to miliseconds
    };
  },

  computed: {
    ...mapGetters("account", ["isAuthenticated", "accountName"]),
    hasAllocations() {
      return Object.keys(this.data).length > 0;
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
        this.$q.notify({
          color: "red-5",
          textColor: "white",
          icon: "warning",
          message: `${error}`
        });
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
    let payload = { account: this.accountName, poolID: this.pool.id };
    this.loadingData = true;
    this.data = await this.getAllocationByPool(payload);
    this.loadingData = false;
  }
};
</script>
