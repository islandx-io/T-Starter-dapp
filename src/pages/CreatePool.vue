<template>
  <q-page>
    <section class="header-bg row content-center justify-center">
      <h2 class="text-white">Create Pool</h2>
    </section>
    <section class="body-container" v-if="accountName === admin_address">
      <q-card>
        <q-form @submit="onSubmit" @reset="onReset">
          <!-- tokens and adresses -->
          <q-list>
            <q-item>
              <q-item-section top>
                <q-input
                  color="primary"
                  v-model="owner"
                  label="owner"
                  lazy-rules
                  :rules="[getChainAccountInfo]"
                  debounce="500"
                  outlined
                  top
                >
                </q-input>
              </q-item-section>
              <q-item-section top>
                <q-input
                  color="primary"
                  v-model="pool_type"
                  label="pool type"
                  lazy-rules
                  debounce="1000"
                  outlined
                >
                </q-input>
              </q-item-section>
            </q-item>
            <!-- Submit -->
            <q-item>
              <q-btn label="Submit" type="submit" color="primary" />
              <q-btn label="Reset" type="reset" color="primary" flat />
            </q-item>
          </q-list>
        </q-form>
      </q-card>
    </section>
    <section class="body-container" v-else>
      <q-card> You are not the administrator</q-card>
    </section>
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
            owner: this.owner,
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

<style lang="scss" scoped>
.header-bg {
  height: 200px;
  min-width: 490px;
  margin-bottom: -50px;
}
</style>
