<template>
  <q-page>
    <!-- content -->
    <q-form>
      <q-input
        color="primary"
        v-model="amount"
        label="Amount"
        lazy-rules
        :rules="[val => !!val || 'Must specify the amount']"
      ></q-input>
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
      amount: 0,
    };
  },

  computed: {
    ...mapGetters("pools", ["getAllPools", "getPoolByID", "getAllPoolIDs"]),
    ...mapGetters("account", ["isAuthenticated", "accountName"]),
  },

  methods: {
    ...mapActions("pools", ["getChainPoolByID"]),
    getPoolInfo() {
      this.pool = this.getPoolByID(this.poolID);
    },
    async loadChainData() {
      await this.getChainPoolByID(this.poolID);
    },
    async joinPool() {
      const actions = [
        {
          account: process.env.CONTRACT_ADDRESS,
          name: "joinpool",
          data: {
            account: this.accountName,
            pool_id: this.poolID,
          }
        },
      ];
      const transaction = await this.$store.$api.signTransaction(actions);
    },
    async onSubmit() {
      if ( !this.isAuthenticated) {
        this.$q.notify({
          color: "red-5",
          textColor: "white",
          icon: "warning",
          message: "You need to login first"
        });
      } else {
        await this.joinPool();
        this.$q.notify({
          color: "green-4",
          textColor: "white",
          icon: "cloud_done",
          message: "Submitted"
        });
      }
    },
  },
  async mounted() {
    await this.loadChainData();
    this.getPoolInfo();
  }
};
</script>
