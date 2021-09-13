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
      <q-form @submit="trySend" ref="sendForm">
        <q-card class="authenticated">
          <q-btn
            :to="{ name: 'wallet', params: { accountName: accountName } }"
            flat
            round
            class="self-start"
          >
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
            <div class="networks row justify-center q-pb-sm">
              <div class="text-weight-light text-subtitle2  col-12 text-center">
                Balance
              </div>
              <div>{{ balance }} {{ selectedTokenSym }}</div>
            </div>
            <div v-if="isAuthenticated" class="q-gutter-y-sm self-stretch">
              <!-- TO -->
              <div class="row justify-center q-py-md ">
                <q-btn
                  class="hover-accent"
                  color="primary"
                  no-shadow
                  no-caps
                  @click="connectWeb3(selectedNetwork)"
                >
                  <div class="ellipsis" v-if="evmAccount === ''">
                    Connect Metamask
                  </div>
                  <div class="ellipsis" style="max-width: 100px" v-else>
                    {{ evmAccount }}
                  </div>
                </q-btn>
                <div class="row items-center justify-center q-px-md">
                  <token-avatar :token="selectedNetwork" :avatarSize="23" />
                  <div class="text-subtitle1 q-pl-xs">
                    {{ selectedNetwork }}
                  </div>
                </div>
              </div>
              <!-- Amount -->
              <q-input
                outlined
                bottom-slots
                :suffix="selectedTokenSym"
                v-model="amount"
                label="Amount"
                maxlength="12"
                class="col"
                :rules="[validateInputAmount]"
                no-error-icon
              >
                <template v-slot:append>
                  <q-btn
                    label="Max"
                    color="positive"
                    outline
                    @click="amount = balance"
                  />
                </template>
              </q-input>
            </div>
            <!-- Send -->
            <div class="text-center self-stretch q-pt-sm q-gutter-x-sm">
              <q-btn
                class="hover-accent"
                size="lg"
                color="primary"
                dense
                no-shadow
                label="Send"
                style="width: 40%"
                type="submit"
                :disabled="selectedToken === undefined"
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
                    class="q-mr-sm"
                  />
                  <div class="text-h6 q-pa-sm">
                    Transaction Sent
                  </div>
                </q-card-section>
                <q-card-section>
                  Transaction ID:
                  <a
                    :href="`${explorerUrl}/transaction/${transaction}`"
                    target="_blank"
                    style="word-wrap: break-word;"
                    >{{ transaction }}
                  </a>
                </q-card-section>
                <q-card-actions align="center">
                  <q-btn
                    class="hover-accent"
                    label="Ok"
                    color="primary"
                    v-close-popup
                  />
                </q-card-actions>
              </q-card>
            </q-dialog>
          </div>
        </q-card>
      </q-form>
    </section>
  </q-page>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import tokenAvatar from "src/components/TokenAvatar";
import { Api, JsonRpc } from "eosjs";

export default {
  components: { tokenAvatar },
  data() {
    return {
      to: null,
      amount: null,
      memo: "",
      showTransaction: false,
      transaction: null,
      selectedTokenSym: "START",
      selectedNetwork: "Ropsten",
      evmAccount: ""
    };
  },
  computed: {
    ...mapGetters("account", ["isAuthenticated", "accountName", "wallet"]),
    ...mapGetters("blockchains", [
      "currentChain",
      "getNetworkByName",
      "getBridgeTokens"
    ]),

    explorerUrl() {
      return this.currentChain.NETWORK_EXPLORER;
    },

    //TODO get this info from chain?
    selectedToken() {
      return this.wallet.find(a => a.token_sym === this.selectedTokenSym);
    },

    token_contract() {
      return this.selectedToken ? this.selectedToken.token_contract : null;
    },

    token_decimals() {
      return this.selectedToken ? this.selectedToken.decimals : null;
    },

    avatar() {
      return this.selectedToken ? this.selectedToken.avatar : "";
    },

    balance() {
      return this.selectedToken ? this.selectedToken.balance : 0;
    }
  },
  methods: {
    ...mapActions("account", [
      "accountExists",
      "setWalletBalances",
      "reloadWallet"
    ]),
    ...mapActions("pools", ["getBalanceFromChain"]),
    ...mapActions("blockchains", ["setBridgeTokens"]),

    restrictDecimal() {
      this.amount = this.$toFixedDown(
        this.amount,
        this.$getDecimalFromAsset(this.selectedTokenSym)
      );
    },

    validateInputAmount(val) {
      return (val <= this.balance) & (val > 0) || "Incorrect amount";
    },

    async send() {
      //   const actions = [
      //     {
      //       account: this.token_contract,
      //       name: "transfer",
      //       data: {
      //         from: this.accountName.toLowerCase(),
      //         to: "bridge.start",
      //         quantity: `${parseFloat(this.amount).toFixed(
      //           this.token_decimals
      //         )} ${this.selectedTokenSym}`,
      //         memo: `${this.to}@${this.selectedNetwork.toLowerCase()}|${
      //           this.memo
      //         }`
      //       }
      //     }
      //   ];
      //   const transaction = await this.$store.$api.signTransaction(actions);
      //   if (transaction) {
      //     this.showTransaction = true;
      //     this.transaction = transaction.transactionId;
      //     this.to = null;
      //     this.amount = null;
      //     this.memo = "";
      //     this.$refs.sendForm.reset();
      //     this.$refs.sendForm.resetValidation();
      //     this.setWalletBalances(this.accountName);
      //   }
    },

    async trySend() {
      try {
        await this.send();
        this.$q.notify({
          color: "green-4",
          textColor: "white",
          icon: "cloud_done",
          message: "Sent"
        });
      } catch (error) {
        this.$errorNotification(error);
      }
    },

    async connectWeb3(network) {
      const { injectedWeb3, web3 } = await this.$web3();
      console.log(injectedWeb3, web3);

      if (injectedWeb3) {
        const a = await web3.eth.getAccounts();
        this.$store.commit("evm/setAccountName", { accountName: a[0] });
        this.evmAccount = a[0];
        const chainId = await web3.eth.getChainId();
        this.$store.commit("evm/setChainId", { chainId });

        // this.updateBalances()

        window.ethereum.on("accountsChanged", a => {
          this.$store.commit("evm/setAccountName", { accountName: a[0] });
          this.evmAccount = a[0];
        });
        window.ethereum.on("chainChanged", chainId => {
          this.$store.commit("evm/setChainId", { chainId });
        });
      } else {
        console.error("Could not get injected web3");
      }
    }
  },
  mounted() {
    this.reloadWallet(this.accountName);
  },

  watch: {
    async accountName() {
      this.reloadWallet(this.accountName);
    }
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
