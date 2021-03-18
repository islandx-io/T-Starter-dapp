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
        <!-- Buttons -->
        <template v-slot:body-cell-action="props">
          <q-td :props="props">
            <q-btn
              outline
              color="negative"
              @click="tryWithdraw(props)"
              label="Withdraw"
            ></q-btn>
            <q-btn
              outline
              color="negative"
              type="a"
              target="_blank"
              :href="buyStartUrl"
              label="Buy"
              v-if="props.row.token_sym === 'START'"
            ></q-btn>
            <q-btn
              outline
              color="negative"
              @click="viewSTART(props)"
              label="View"
              v-if="props.row.token_sym === 'START'"
            ></q-btn>
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
      buyStartUrl:
        "https://t-starter.medium.com/how-to-participate-in-the-t-starter-seed-round-token-sale-8eb6290c3c15",
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
        { name: "locked", label: "Locked", field: "locked", align: "center" },
        { name: "action", label: "Action", field: "action", align: "center" }
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
    ]),

    viewSTART() {
      //TODO figure out how to do this.
    },

    async withdrawTokens(amount_str) {
      const actions = [
        {
          account: process.env.CONTRACT_ADDRESS,
          name: "withdraw",
          data: {
            account: this.accountName,
            quantity: amount_str
          }
        }
      ];
      const transaction = await this.$store.$api.signTransaction(actions);
    },

    async tryWithdraw(props) {
      try {
        let amount_str = this.$toChainString(
          props.row.liquid,
          props.row.decimals,
          props.row.token_sym
        );
        await this.withdrawTokens(amount_str);
        this.$q.notify({
          color: "green-4",
          textColor: "white",
          icon: "cloud_done",
          message: "Tokens claimed, please refresh"
        });
      } catch (error) {
        this.$q.notify({
          color: "red-5",
          textColor: "white",
          icon: "warning",
          message: `${error}`
        });
      }
    },

    async reloadWalletInfo() {
      await this.setWalletBaseTokens();
      await this.getChainWalletTable(this.accountName);
      await this.getChainSTART(this.accountName);
      await this.setWalletBalances(this.accountName);
    }
  },

  async mounted() {
    await this.reloadWalletInfo();
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
