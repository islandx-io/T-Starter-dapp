<template>
  <q-page>
    <q-form @submit="onSubmit" @reset="onReset" class="q-gutter-md">
      <!-- tokens and adresses -->
      <div>
        <q-input
          color="primary"
          v-model="owner"
          label="owner"
          lazy-rules
          :rules="[getChainAccountInfo]"
          debounce="500"
        >
        </q-input>
      </div>
      <div>
        <q-input
          color="primary"
          v-model="pool_type"
          label="pool type"
          lazy-rules
          debounce="1000"
        >
        </q-input>
      </div>

      <!-- Submit -->
      <div>
        <q-btn label="Submit" type="submit" color="primary" />
        <q-btn
          label="Reset"
          type="reset"
          color="primary"
          flat
          class="q-ml-sm"
        />
      </div>
    </q-form>
  </q-page>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

export default {
  data() {
    return {
      // id: -1,
      owner: "fuzzytestnet",
      pool_type: "fixed"
    };
  },
  computed: {
    ...mapGetters("account", ["isAuthenticated", "accountName"]),
    admin_address() {
      return process.env.ADMIN_ADDRESS;
    }
  },

  methods: {
    ...mapActions("pools", ["getChainAccountInfo"]),
    async createChainPool() {
      const actions = [
        {
          account: process.env.CONTRACT_ADDRESS,
          name: "newpool",
          data: {
            // id: this.id,
            owner: this.accountName,
            pool_type: this.pool_type
          }
        }
      ];
      const transaction = await this.$store.$api.signTransaction(actions);
    },
    async onSubmit() {
      // TODO check if have permission to create pool. e.g. pools.start
      if (!this.isAuthenticated || this.accountName !== this.admin_address) {
        this.$q.notify({
          color: "red-5",
          textColor: "white",
          icon: "warning",
          message: "You need to be admin to create pools"
        });
      } else {
        await this.createChainPool();
        this.$q.notify({
          color: "green-4",
          textColor: "white",
          icon: "cloud_done",
          message: "Submitted"
        });
      }
    },

    onReset() {}
  },

  watch: {}
};
</script>

<style scoped></style>
