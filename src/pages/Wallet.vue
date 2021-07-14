<template>
  <q-page>
    <section class="header-bg row content-center justify-center">
      <h2 class="text-white q-pt-xl">Wallet</h2>
    </section>
    <section class="body-container">
      <q-table
        v-if="isAuthenticated"
        class="wallet-table q-pa-md"
        :data="wallet"
        :columns="columns"
        row-key="token_sym"
        hide-pagination
        :pagination="{ rowsPerPage: 500 }"
      >
        <template v-slot:header="props">
          <q-tr :props="props">
            <q-th auto-width key="expand">
              <!-- Refresh table button -->
              <q-btn
                padding="sm"
                class="hover-accent"
                color="black"
                icon="fas fa-sync-alt"
                flat
                size="sm"
                @click="
                  resetLiquid();
                  reloadWalletInfo();
                "
            /></q-th>
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

        <template v-slot:body="props">
          <q-tr
            :props="props"
            :key="props.row.token_sym"
            @click="
              if (isStart(props.row.token_sym)) props.expand = !props.expand;
            "
            :class="isStart(props.row.token_sym) ? 'cursor-pointer' : ''"
          >
            <q-td auto-width>
              <q-btn
                size="sm"
                color="accent"
                round
                dense
                outline
                :icon="props.expand ? 'remove' : 'add'"
                v-if="isStart(props.row.token_sym)"
                class="hover-accent"
              />
            </q-td>
            <!-- Avatar -->
            <q-td :props="props" :key="props.cols[0].name">
              <div class="row justify-start items-center">
                <token-avatar
                  :token="props.row.token_sym"
                  :avatar="props.row.avatar"
                  :avatarSize="35"
                  class="q-mr-sm"
                />
                <div>{{ props.cols[0].value }}</div>
              </div>
            </q-td>

            <!-- Contract, Balance, Liquid, Staked -->
            <q-td
              :props="props"
              v-for="col in props.cols.slice(1, 4)"
              :key="col.name"
            >
              {{ $formatTableDecimals(col, props) }}
            </q-td>

            <!-- Action -->
            <q-td :props="props" :key="props.cols[props.cols.length - 1].name">
              <wallet-actions
                :props="props"
                :accountName="accountName"
                :stakeData="stakeData"
                @reloadWalletInfo="reloadWalletInfo"
              />
            </q-td>
          </q-tr>

          <!-- START expansion -->
          <q-tr v-show="props.expand" :props="props">
            <q-td colspan="100%" no-hover>
              <div class="row justify-center">
                <q-table
                  :data="stakeData"
                  :columns="stakeColumns"
                  :hide-pagination="stakeData.length <= 5"
                  class="wallet-inner-table"
                  separator="none"
                >
                  <template v-slot:header="props">
                    <q-tr :props="props">
                      <q-th
                        v-for="col in props.cols"
                        :key="col.name"
                        :props="props"
                        style="font-size: 16px; color: gray"
                      >
                        {{ col.label }}
                      </q-th>
                    </q-tr>
                  </template>
                  <template v-slot:body="props">
                    <q-tr
                      :props="props"
                      :class="
                        new Date(props.cols[1].value) < dateNow
                          ? `text-bold`
                          : ''
                      "
                    >
                      <q-td>
                        {{ props.cols[0].value }}
                      </q-td>
                      <q-td class="text-center">
                        {{ props.cols[1].value }}
                      </q-td>
                    </q-tr>
                  </template>
                </q-table>
              </div>
            </q-td>
          </q-tr>
        </template>
      </q-table>
      <q-card
        v-else
        class="row justify-center content-center "
        style="min-height: 100px"
      >
        <div>Please connect your wallet</div>
      </q-card>

      <!-- swap tokens -->
      <q-item class="justify-center q-pt-md">
        <q-btn
          v-if="currentChain.NETWORK_NAME === 'TELOS'"
          label="MANAGE TOKENS ON TELOS WEB WALLET"
          type="a"
          href="https://wallet.telos.net/"
          target="blank"
          color="primary"
        />
      </q-item>
    </section>
  </q-page>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import tokenAvatar from "src/components/TokenAvatar";
import walletActions from "src/components/wallet/WalletActions";
import { date } from "quasar";

export default {
  data() {
    return {
      // prettier-ignore
      columns: [
        { name: "token", label: "Token", field: "token_sym", align: "left" },
        { name: "balance", label: "Balance", field: "balance", align: "center", },
        { name: "liquid", label: "Liquid", field: "liquid", align: "center" },
        { name: "locked", label: "Locked", field: "locked", align: "center", format(val) {
          if (val > 0) {
            return val
          } else {
            return ""
          }
        }},
        { name: "action", label: "Action", field: "action", align: "center" }
      ],
      // prettier-ignore
      stakeColumns: [
        { name: "staked", label: "Unstaking", field: "second", align: "center" },
        { name: "releaseDate", label: "Release date", field: "first", align: "center", format: val => {
          let res = date.formatDate(val, 'YYYY-MM-DD'); 
          if (new Date(res) < new Date()) return res + "*";
          else return res;
        }},
      ],
      // prettier-ignore
      stakeData: [],
      dateNow: new Date()
    };
  },
  components: { tokenAvatar, walletActions },
  computed: {
    ...mapGetters("account", ["isAuthenticated", "accountName", "wallet"]),
    ...mapGetters("blockchains", ["currentChain"])
  },

  methods: {
    ...mapActions("pools", ["getBalanceFromChain", "getBaseTokens"]),
    ...mapActions("account", [
      "setWalletBaseTokens",
      "getChainWalletTable",
      "setWalletBalances",
      "getChainSTART",
      "setWalletPoolTokens",
      "resetWallet",
      "resetLiquid",
      "setVestedTokens"
    ]),

    async reloadWalletInfo() {
      // await this.resetLiquid();
      await this.setWalletBaseTokens();
      await this.getChainWalletTable(this.accountName);
      await this.getChainSTART(this.accountName);
      await this.setWalletBalances(this.accountName);
      await this.setWalletPoolTokens(this.accountName);
      // TODO Add loading element for poolTokens
      this.stakeData = this.wallet.find(
        a => a.token_sym === "START"
      ).stake_maturities;
    },

    toReceiveTokens(props) {},

    isStart(val) {
      return val === "START";
    }
  },

  async mounted() {
    await this.reloadWalletInfo();
  },

  watch: {
    async accountName() {
      await this.reloadWalletInfo();
    }
  }
};
</script>

<style lang="scss" scoped>
.header-bg {
  height: 200px;
  margin-bottom: -50px;
}
</style>
