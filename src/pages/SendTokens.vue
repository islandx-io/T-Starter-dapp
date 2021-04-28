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
          <div class="row items-center justify-center q-pa-sm">
            <h2>Send</h2>
            <div class="row items-center justify-center">
              <token-avatar :token="selectedTokenSym" :avatarSize="55" />
              <h2>
                {{ selectedTokenSym }}
              </h2>
            </div>
          </div>
          <div class="networks row justify-center q-py-sm">
            <div class="text-subtitle1 q-pb-sm col-12 text-center">
              To network
            </div>
            <q-btn
              label="Telos"
              @click="selectedNetwork = 'telos'"
              :class="selectedNetwork === 'telos' ? 'selected-network' : ''"
              flat
              size="lg"
              no-caps
              padding="xs"
            />
            <q-btn
              label="EOS"
              v-if="
                selectedTokenInList(['START', 'TLOS', 'EOS', 'PETH', 'PBTC'])
              "
              @click="selectedNetwork = 'eos'"
              :class="selectedNetwork === 'eos' ? 'selected-network' : ''"
              flat
              size="lg"
              no-caps
              padding="xs"
            />
            <q-btn
              label="Bitcoin"
              v-if="selectedTokenInList(['PBTC'])"
              @click="selectedNetwork = 'bitcoin'"
              :class="selectedNetwork === 'bitcoin' ? 'selected-network' : ''"
              flat
              size="lg"
              no-caps
              padding="xs"
            />
            <q-btn
              label="Ethereum"
              v-if="selectedTokenInList(['TLOS', 'EOS', 'PETH', 'PBTC'])"
              @click="selectedNetwork = 'ethereum'"
              :class="selectedNetwork === 'ethereum' ? 'selected-network' : ''"
              flat
              size="lg"
              no-caps
              padding="xs"
            />
            <q-btn
              label="BSC"
              v-if="selectedTokenInList(['TLOS', 'EOS', 'PETH', 'PBTC'])"
              @click="selectedNetwork = 'bsc'"
              :class="selectedNetwork === 'bsc' ? 'selected-network' : ''"
              flat
              size="lg"
              no-caps
              padding="xs"
            />
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
              maxlength="255"
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
          <q-dialog v-model="showTransaction" confirm>
            <q-card>
              <q-card-section class="row">
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
