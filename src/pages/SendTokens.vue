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
      <q-form @submit="trySend">
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
              <q-input
                outlined
                autocapitalize="off"
                bottom-slots
                v-model="to"
                label="To"
                counter
                maxlength="12"
                :rules="[accountExistsOnChain]"
                error-message="Account does not exist"
                lazy-rules
                debounce="1000"
                no-error-icon
              >
                <template v-slot:append>
                  <q-btn-dropdown
                    no-caps
                    flat
                    class="bg-secondary"
                    padding="sm"
                    style="margin: 0px"
                    color="black"
                    outline
                  >
                    <template v-slot:label>
                      <div class="flex items-center justify-center wrap">
                        <div class="row items-center justify-center">
                          <token-avatar
                            :token="selectedNetwork"
                            :avatarSize="23"
                          />
                          <div class="text-subtitle1 q-pl-xs">
                            {{ selectedNetwork }}
                          </div>
                        </div>
                        <q-tooltip anchor="top middle" self="bottom middle">
                          To Network
                        </q-tooltip>
                      </div>
                    </template>
                    <q-list class="bg-secondary">
                      <q-item
                        clickable
                        v-close-popup
                        v-for="network in networkOptions"
                        :key="network"
                        @click="selectedNetwork = network"
                        flat
                        size="lg"
                        no-caps
                      >
                        <div class="flex items-center justify-center wrap">
                          <div class="row items-center justify-center">
                            <token-avatar :token="network" :avatarSize="23" />
                            <div class="text-subtitle1 q-pl-xs">
                              {{ network }}
                            </div>
                          </div>
                        </div>
                      </q-item>
                    </q-list>
                  </q-btn-dropdown>
                </template>
              </q-input>
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
              <!-- Memo -->
              <q-input
                outlined
                bottom-slots
                v-model="memo"
                label="Memo"
                counter
                maxlength="200"
              />
            </div>
            <!-- Send -->
            <div class="text-center self-stretch q-pt-sm">
              <q-btn
                class="hover-accent"
                size="lg"
                color="primary"
                dense
                no-shadow
                label="Send"
                style="width: 50%"
                type="submit"
              />
            </div>
            <div
              class="text-center text-caption q-pt-md text-grey-7"
              v-if="
                selectedNetwork.toUpperCase() !==
                  currentChain.NETWORK_NAME.toUpperCase()
              "
            >
              <q-icon name="fas fa-info-circle" class="q-pr-xs" /> Sending
              tokens across chains can take up to several minutes.
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
      memo: null,
      showTransaction: null,
      transaction: null,
      // explorerUrl: process.env.NETWORK_EXPLORER,
      selectedTokenSym: "START",
      selectedNetwork: "TELOS"
    };
  },
  computed: {
    ...mapGetters("account", ["isAuthenticated", "accountName", "wallet"]),
    ...mapGetters("blockchains", ["currentChain", "getNetworkByName"]),

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

    networkOptions() {
      if (this.selectedTokenSym.toUpperCase() === "START")
        // return ["TELOS", "EOS", "WAX"];
        return ["TELOS", "EOS"];
      else return [this.selectedNetwork];
    }
  },
  methods: {
    ...mapActions("account", ["accountExists"]),
    ...mapActions("pools", ["getBalanceFromChain"]),

    restrictDecimal() {
      this.amount = this.$toFixedDown(
        this.amount,
        this.$getDecimalFromAsset(this.selectedTokenSym)
      );
    },

    validateInputAmount(val) {
      return (val <= this.balance) & (val > 0) || "Incorrect amount";
    },

    async accountExistsOnChain(account) {
      // get current selected chain
      let blockchains = this.getNetworkByName(
        this.selectedNetwork.toUpperCase()
      );
      let newChain = {};

      // check if testnet or not
      if (process.env.TESTNET == "true") {
        newChain = blockchains.find(el => el.TEST_NETWORK === true);
      } else {
        newChain = blockchains.find(el => el.TEST_NETWORK === false);
      }
      // console.log(newChain)

      //set rpc
      const rpc = new JsonRpc(
        `${newChain.NETWORK_PROTOCOL}://${newChain.NETWORK_HOST}:${newChain.NETWORK_PORT}`
      );
      //check if account exists on chain
      let exists = await rpc.get_account(account);
      return exists;
    },

    async send() {
      if (!(await this.accountExistsOnChain(this.to))) {
        this.$q.notify({
          type: "negative",
          message: `Account ${this.to} does not exist`
        });
        return;
      }

      // if same network, do normal transaction
      if (
        this.selectedNetwork.toUpperCase() === this.currentChain.NETWORK_NAME
      ) {
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

      // If different network, send to bridge
      if (
        this.selectedNetwork.toUpperCase() !== this.currentChain.NETWORK_NAME
      ) {
        const actions = [
          {
            account: this.token_contract,
            name: "transfer",
            data: {
              from: this.accountName.toLowerCase(),
              to: "bridge.start",
              quantity: `${parseFloat(this.amount).toFixed(
                this.token_decimals
              )} ${this.selectedTokenSym}`,
              memo: `${this.to}@${this.selectedNetwork.toLowerCase()}|${
                this.memo
              }`
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
    }
  },
  mounted() {
    if (this.$route.query.token_sym !== undefined)
      this.selectedTokenSym = this.$route.query.token_sym;
    if (!this.isCrossChainToken)
      this.selectedNetwork = this.currentChain.NETWORK_NAME;
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
