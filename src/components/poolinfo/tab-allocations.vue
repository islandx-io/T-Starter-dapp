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
    <q-btn
      outline
      color="accent"
      label="Claim"
      class="hover-accent self-end q-mt-md"
      v-if="hasAllocations && pool.status === ('success' || 'fail')"
      @click="tryClaimTokens"
    />
    <p class="q-pt-md" v-if="!hasAllocations">No allocation to show.</p>
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
      data: {}
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

    async tryClaimTokens() {
      try {
        await this.claimTokens();
        this.$q.notify({
          color: "green-4",
          textColor: "white",
          icon: "cloud_done",
          message: "Tokens claimed"
        });
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
