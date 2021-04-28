<template>
  <q-page>
    <section class="header-bg" />
    <section
      class="body-container"
      style="max-width: 580px"
      v-if="!isAuthenticated"
    >
      <q-card class="not-authenticated">
        <div class="text-subtitle1">Please login</div>
      </q-card>
    </section>
    <section class="body-container" style="max-width: 580px" v-else>
      <q-card class="authenticated">
        <q-btn :to="`/wallet/${accountName}`" flat round class="self-start">
          <q-icon
            class="hover-accent"
            name="fas fa-chevron-circle-left"
            style="font-size: 50px"
          />
        </q-btn>
        <div class="column items-center">
          <div class="row items-center justify-center q-pa-sm q-pb-md">
            <h2>Send</h2>
            <div class="row items-center justify-center">
              <token-avatar
                :token="selectedTokenSym"
                :avatar="avatar"
                :avatarSize="55"
              />
              <h2>
                {{ selectedTokenSym }}
              </h2>
            </div>
          </div>
          <div
            class="networks row justify-center q-pb-sm"
            v-if="isCrossChainToken"
          >
            <div class="text-subtitle1 q-pb-sm col-12 text-center">
              To network
            </div>
            <div class="q-gutter-sm row justify-center">
              <q-radio v-model="selectedNetwork" val="telos" label="Telos" />
              <q-radio
                v-model="selectedNetwork"
                val="eos"
                label="EOS"
                v-if="selectedTokenInList(['EOS', 'START', 'PETH', 'PBTC'])"
              />
              <q-radio
                v-model="selectedNetwork"
                val="bitcoin"
                label="Bitcoin"
                v-if="selectedTokenInList(['PBTC'])"
              />
              <q-radio
                v-model="selectedNetwork"
                val="ethereum"
                label="Ethereum"
                v-if="selectedTokenInList(['TLOS', 'EOS', 'PETH', 'PBTC'])"
              />
              <q-radio
                v-model="selectedNetwork"
                val="bsc"
                label="Binance Smart Chain"
                v-if="selectedTokenInList(['TLOS', 'EOS', 'PBTC'])"
              />
            </div>
          </div>
          <div v-else class="text-subtitle1 text-center q-pb-sm">
            To network: {{ currentChain.NETWORK_DISPLAY_NAME }}
          </div>
          <div v-if="isAuthenticated" class="q-gutter-y-sm self-stretch">
            <q-input
              outlined
              autocapitalize="off"
              bottom-slots
              v-model="to"
              label="To"
              counter
              maxlength="12"
            />
            <div class="row items-start">
              <q-input
                outlined
                bottom-slots
                :suffix="selectedTokenSym"
                v-model="amount"
                label="Amount"
                type="number"
                maxlength="12"
                class="col"
                :hint="`Available: ${balance} ${selectedTokenSym}`"
                :rules="[validateInputAmount]"
              >
              </q-input>
              <q-btn
                class="col-shrink q-ma-sm"
                label="Max"
                color="positive"
                outline
                @click="amount = balance"
              />
            </div>
            <q-input
              outlined
              bottom-slots
              v-model="memo"
              label="Memo"
              counter
              maxlength="200"
            />
          </div>
          <div class="text-center self-stretch q-pt-sm">
            <q-btn
              class="hover-accent"
              size="lg"
              color="primary"
              dense
              no-shadow
              @click="send"
              label="Send"
              style="width: 50%"
            />
          </div>

          <!-- Transaction sent dialog -->
          <q-dialog v-model="showTransaction" confirm>
            <q-card>
              <q-card-section class="row items-center">
                <q-avatar
                  icon="arrow_forward"
                  color="primary"
                  text-color="white"
                />
                <span class="q-ml-sm">
                  Transaction sent, click to view in block explorer.
                </span>
                <q-item
                  clickable
                  tag="a"
                  target="_blank"
                  :href="`${explorerUrl}/transaction/${transaction}`"
                  class="q-ml-sm"
                  >{{ transaction }}</q-item
                >
              </q-card-section>
              <q-card-actions align="right">
                <q-btn flat label="Ok" color="primary" v-close-popup></q-btn>
              </q-card-actions>
            </q-card>
          </q-dialog>
        </div>
      </q-card>
    </section>
  </q-page>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import tokenAvatar from "src/components/TokenAvatar";

export default {
  components: { tokenAvatar },
  data() {
    return {
      to: null,
      amount: null,
      memo: null,
      showTransaction: null,
      transaction: null,
      // explorerUrl: process.env.NETWORK_EXPLORER,
      selectedTokenSym: "TLOS",
      selectedNetwork: "telos"
    };
  },
  computed: {
    ...mapGetters("account", ["isAuthenticated", "accountName", "wallet"]),
    ...mapGetters("blockchains", ["currentChain"]),

    explorerUrl() {
      return this.currentChain.NETWORK_EXPLORER;
    },

    //TODO get this info from chain?
    selectedToken() {
      return this.wallet.find(a => a.token_sym === this.selectedTokenSym);
    },

    token_contract() {
      return this.selectedToken.token_contract;
    },

    token_decimals() {
      return this.selectedToken.decimals;
    },

    avatar() {
      return this.selectedToken.avatar;
    },

    balance() {
      return this.selectedToken.balance;
    },

    isCrossChainToken() {
      return this.selectedTokenInList(["TLOS", "EOS", "START", "PETH", "PBTC"]);
    }
  },
  methods: {
    ...mapActions("account", ["accountExists"]),
    selectedTokenInList(lst) {
      return lst.includes(this.selectedTokenSym.toUpperCase());
    },
    restrictDecimal() {
      this.amount = this.$toFixedDown(
        this.amount,
        this.$getDecimalFromAsset(this.selectedTokenSym)
      );
    },
    validateInputAmount(val) {
      return (
        val <= this.balance ||
        `Amount cannot be greater than your available balance.`
      );
    },
    async send() {
      if (!(await this.accountExists(this.to))) {
        this.$q.notify({
          type: "negative",
          message: `Account ${this.to} does not exist`
        });
        return;
      }

      const actions = [
        {
          account: this.token_contract,
          name: "transfer",
          data: {
            from: this.accountName.toLowerCase(),
            to: this.to,
            quantity: `${parseFloat(this.amount).toFixed(
              this.token_decimals
            )} ${this.selectedTokenSym}`,
            memo: this.memo
          }
        }
      ];
      const transaction = await this.$store.$api.signTransaction(actions);
      if (transaction) {
        this.showTransaction = true;
        this.transaction = transaction.transactionId;
      }
    }
  },
  mounted() {
    if (this.$route.query.token_sym !== undefined)
      this.selectedTokenSym = this.$route.query.token_sym;
    if (!this.isCrossChainToken) this.selectedNetwork = "current";
  }
};
</script>

<style lang="scss" scoped>
.q-card {
  &.not-authenticated {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
    min-height: 100px;
  }
  &.authenticated {
    display: grid;
    align-items: stretch;
    grid-template-columns: 50px auto 50px;
    padding-bottom: 40px;
    & div {
      margin: 0;
      @media only screen and (max-width: 585px) {
        grid-column-start: 1;
        grid-column-end: 4;
      }
    }
  }
}
.header-bg {
  height: 160px;
  margin-bottom: -50px;
}
h2 {
  line-height: 45px;
  margin: 0 10px;
  font-size: 35px;
}
</style>
