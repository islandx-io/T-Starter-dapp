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
            <q-th auto-width key="expand"></q-th>
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

            <!-- Contract, Balance, Liquid, Locked -->
            <q-td
              :props="props"
              v-for="col in props.cols.slice(1, 4)"
              :key="col.name"
            >
              {{ formatTable(col, props) }}
            </q-td>

            <!-- Action -->
            <q-td
              :props="props"
              :key="props.cols[props.cols.length - 1].name"
              class="q-gutter-x-sm"
            >
            
              <!-- withdraw start -->
              <q-btn
                outline
                color="accent"
                @click.stop="tryReclaim(props)"
                label="Withdraw"
                v-if="isStart(props.row.token_sym) && props.row.liquid !== 0"
                class="hover-accent"
              />
              <!-- withdraw liquid -->
              <q-btn
                outline
                color="accent"
                @click="tryWithdraw(props)"
                label="Withdraw"
                v-if="!isStart(props.row.token_sym) && props.row.liquid !== 0"
                class="hover-accent"
              />
              <!-- receive token -->
              <q-btn
                outline
                color="accent"
                @click="toReceiveTokens(props)"
                label="Receive"
                v-if="baseTokenSymbols.includes(props.row.token_sym)"
                class="hover-accent"
              />
              <!-- buy telos -->
              <q-btn
                outline
                color="accent"
                label="Buy"
                v-if="props.row.token_sym === 'TLOS'"
                class="hover-accent"
                type="a"
                target="_blank"
                href="https://telos.net/buy/"
              />
              <!-- buy START -->
              <q-btn
                outline
                color="accent"
                type="a"
                target="_blank"
                :href="buyStartUrl"
                label="Buy"
                v-if="isStart(props.row.token_sym)"
                class="hover-accent"
              />
              <!-- stake -->
              <q-btn
                outline
                color="accent"
                label="Stake"
                @click.stop="tryStake(props)"
                v-if="isStart(props.row.token_sym)"
                class="hover-accent"
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
                  hide-pagination
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
import { date } from "quasar";

export default {
  data() {
    return {
      buyStartUrl:
        process.env.BUY_START_URL,
      baseTokenSymbols: ["TLOS", 'PBTC', "PETH"], // TODO make dynamic
      // prettier-ignore
      columns: [
        { name: "token", label: "Token", field: "token_sym", align: "left" },
        { name: "balance", label: "Balance", field: "balance", align: "center", },
        { name: "liquid", label: "Liquid", field: "liquid", align: "center" },
        { name: "staked", label: "Staked", field: "staked", align: "center", format(val) {
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
        { name: "staked", label: "Staked", field: "second", align: "center" },
        { name: "releaseDate", label: "Release date", field: "first", align: "center", format: val => date.formatDate(val, 'YYYY-MM-DD') },
      ],
      // prettier-ignore
      stakeData: []
    };
  },
  components: { tokenAvatar },
  computed: {
    ...mapGetters("account", ["isAuthenticated", "accountName", "wallet"])
  },

  methods: {
    ...mapActions("pools", ["getBalanceFromChain", "getBaseTokens"]),
    ...mapActions("account", [
      "setWalletBaseTokens",
      "getChainWalletTable",
      "setWalletBalances",
      "getChainSTART",
      "setWalletPoolTokens"
    ]),

    formatTable(col, props) {
      if (col.value === "") {
        return ""
      } else {
        return col.value.toFixed(props.row.decimals)
      }
    },

    isStart(val) {
      return val === "START";
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

    async reclaimTokens(amount_str) {
      const actions = [
        {
          account: process.env.CONTRACT_ADDRESS,
          name: "reclaimstake",
          data: {
            account: this.accountName,
            quantity: amount_str
          }
        }
      ];
      const transaction = await this.$store.$api.signTransaction(actions);
    },

    async updateStake() {
      const actions = [
        {
          account: process.env.CONTRACT_ADDRESS,
          name: "updatestake",
          data: {
            account: this.accountName,
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

    async tryReclaim(props) {
      try {
        let amount_str = this.$toChainString(
          props.row.liquid,
          props.row.decimals,
          props.row.token_sym
        );
        await this.reclaimTokens(amount_str);
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

    async tryStake() {
      try {
        await this.updateStake();
        this.$q.notify({
          color: "green-4",
          textColor: "white",
          icon: "cloud_done",
          message: "Staked Tokens Updated"
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
      await this.setWalletPoolTokens(this.accountName);
      // TODO Add loading element for poolTokens
      this.stakeData = this.wallet.find(
        a => a.token_sym === "START"
      ).stake_maturities;
    },

    toReceiveTokens(props) {

    },
  },

  async mounted() {
    await this.reloadWalletInfo();
  }
};
</script>

<style lang="scss" scoped>
.header-bg {
  height: 200px;
  margin-bottom: -50px;
}
.q-table__container.wallet-inner-table {
  background-color: $secondary;
  border: 1px solid #dbdddf;
  box-shadow: none;
  border-radius: $card-corner-radius;
}
</style>
