<template>
  <q-page>
    <section class="header-bg row content-center justify-center">
      <h2 class="text-white q-pt-xl">Wallet</h2>
    </section>
    <section class="body-container">
      <q-table
        v-if="isAuthenticated"
        class="q-pa-md"
        :data="data"
        :columns="columns"
        row-key="name"
        hide-pagination
      >
        <template v-slot:header="props">
          <q-tr :props="props">
            <q-th
              v-for="col in props.cols"
              :key="col.name"
              :props="props"
              style="font-size: 20px; color: gray"
            >
              {{ col.label }}
            </q-th>
          </q-tr>
        </template>
        <template v-slot:body-cell-token="props">
          <q-td :props="props" class="row justify-start items-center">
            <token-avatar
              :avatar="props.row.token_sym"
              :avatarSize="35"
              class="q-mr-sm"
            />
            <div>{{ props.row.token_sym }}</div>
          </q-td>
        </template>
      </q-table>
      <q-card
        v-else
        class="row justify-center content-center "
        style="min-height: 100px"
      >
        <div>Please connect your wallet</div>
      </q-card>
    </section>
  </q-page>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import tokenAvatar from "src/components/TokenAvatar";

export default {
  data() {
    return {
      columns: [
        { name: "token", label: "Token", field: "token_sym", align: "left" },
        {
          name: "contract",
          label: "Contract",
          field: "token_contract",
          align: "center"
        },
        {
          name: "balance",
          label: "Balance",
          field: "balance",
          align: "center"
        },
        { name: "liquid", label: "Liquid", field: "liquid", align: "center" },
        { name: "locked", label: "Locked", field: "locked", align: "center" }
      ]
    };
  },
  components: { tokenAvatar },
  computed: {
    ...mapGetters("account", ["isAuthenticated", "accountName", "wallet"]),
    data() {
      return this.wallet;
    }
  },

  methods: {
    ...mapActions("pools", ["getBalanceFromChain", "getBaseTokens"]),
    ...mapActions("account", [
      "setWalletBaseTokens",
      "getChainWalletTable",
      "setWalletBalances",
      "getChainSTART"
    ])
  },

  async mounted() {
    await this.setWalletBaseTokens();
    await this.getChainWalletTable(this.accountName);
    await this.getChainSTART(this.accountName);
    await this.setWalletBalances(this.accountName);
  }
};
</script>

<style lang="scss" scoped>
.header-bg {
  height: 200px;
  min-width: 490px;
  margin-bottom: -50px;
}
</style>
