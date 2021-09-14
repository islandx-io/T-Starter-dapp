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
            <div class="row">
              <div class="networks row justify-center q-pb-sm">
                <div
                  class="text-weight-light text-subtitle2  col-12 text-center"
                >
                  {{ currentChain.NETWORK_NAME }} Balance
                </div>
                <div>{{ balance }} {{ selectedTokenSym }}</div>
              </div>
              <div
                class="networks row justify-center q-pb-sm"
                v-if="supportedEvmChains.includes(selectedNetwork)"
              >
                <div
                  class="text-weight-light text-subtitle2  col-12 text-center"
                >
                  {{ selectedNetwork }} Balance
                </div>
                <div>{{ remoteBalance }} {{ selectedTokenSym }}</div>
              </div>
            </div>
            <div v-if="isAuthenticated" class="q-gutter-y-sm self-stretch">
              <!-- TO -->
              <q-input
                v-if="!supportedEvmChains.includes(selectedNetwork)"
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
              <div v-else class="row justify-between q-py-md">
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
              <!-- Memo -->
              <q-input
                v-if="!supportedEvmChains.includes(selectedNetwork)"
                outlined
                bottom-slots
                v-model="memo"
                label="Memo"
                counter
                maxlength="200"
              />
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
            <div
              class="text-center text-caption q-pt-md text-grey-7"
              v-if="selectedToken === undefined"
            >
              <q-icon name="fas fa-exclamation-triangle" class="q-pr-xs" />
              Token not found in wallet. Refresh or check your wallet balance.
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
      // explorerUrl: process.env.NETWORK_EXPLORER,
      selectedTokenSym: "START",
      selectedNetwork: "ETHEREUM",
      evmAccount: "",
      unsupportedEvmChain: false,
      remoteBalance: 0
    };
  },
  computed: {
    ...mapGetters("account", ["isAuthenticated", "accountName", "wallet"]),
    ...mapGetters("tport", [
      "getEvmAccountName",
      "getEvmChainId",
      "getEvmRemoteId",
      "getEvmNetworkList",
      "getTPortTokensBySym"
    ]),
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
    },

    supportedEosChains() {
      const bridgeTokens = this.getBridgeTokens;
      if (bridgeTokens && this.selectedToken !== undefined) {
        // console.log({ bridgeTokens });
        let res = [this.currentChain.NETWORK_NAME];
        for (let token of bridgeTokens) {
          if (
            this.$getSymFromAsset(token.token_info) === this.selectedTokenSym
          ) {
            res.push(token.channel.toUpperCase());
          }
        }
        // if (this.selectedTokenSym.toUpperCase() === "START")
        //   supportedEosChains.push("ETH"); // TODO Make this dynamic
        // console.log("Supported EOS Chains:", res);
        return res;
      } else return [];
    },

    supportedEvmChains() {
      const token = this.getTPortTokensBySym(this.selectedTokenSym);
      if (token) {
        // console.log({ token });
        let res = [];
        for (let r of token.remote_contracts) {
          const network = this.getEvmNetworkList.find(
            el => el.remoteId === r.key
          );
          if (network) res.push(network.name.toUpperCase());
        }
        return res;
      } else return [];
    },

    networkOptions() {
      return [...this.supportedEosChains, ...this.supportedEvmChains];
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
    ...mapActions("tport", ["setTPortTokens"]),

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
      // ignore check for teleports
      if (this.supportedEvmChains.includes(this.selectedNetwork)) return true;

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
      let transaction;
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
        transaction = await this.$store.$api.signTransaction(actions);
      } else if (this.supportedEosChains.includes(this.selectedNetwork)) {
        // If different EOS network, send to bridge
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
        transaction = await this.$store.$api.signTransaction(actions);
      } else {
        // If EVM network, teleport
        const actions = [
          {
            account: process.env.TOKEN_ADDRESS,
            name: "transfer",
            authorization: [
              {
                actor: this.accountName,
                permission: "active"
              }
            ],
            data: {
              from: this.accountName,
              to: process.env.TPORT_ADDRESS,
              quantity: `${parseFloat(this.amount).toFixed(
                this.token_decimals
              )} ${this.selectedTokenSym}`,
              memo: "Teleport"
            }
          },
          {
            account: process.env.TPORT_ADDRESS,
            name: "teleport",
            authorization: [
              {
                actor: this.accountName,
                permission: "active"
              }
            ],
            data: {
              from: this.accountName,
              quantity: `${parseFloat(this.amount).toFixed(
                this.token_decimals
              )} ${this.selectedTokenSym}`,
              chain_id: this.getEvmRemoteId,
              eth_address:
                this.evmAccount.replace("0x", "") + "000000000000000000000000"
            }
          }
        ];
        console.log("Actions: ", actions);

        // transaction = await this.$store.$api.signTransaction(actions);
      }
      if (transaction) {
        this.showTransaction = true;
        this.transaction = transaction.transactionId;
        this.to = null;
        this.amount = null;
        this.memo = "";
        this.$refs.sendForm.reset();
        this.$refs.sendForm.resetValidation();
        this.setWalletBalances(this.accountName);
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
    },

    async connectWeb3() {
      const { injectedWeb3, web3 } = await this.$web3();
      // console.log(injectedWeb3, web3);

      if (injectedWeb3) {
        await this.switchTportNetwork();
        const a = await web3.eth.getAccounts();
        this.$store.commit("tport/setAccountName", { accountName: a[0] });
        this.evmAccount = a[0];
        const chainId = await web3.eth.getChainId();
        this.$store.commit("tport/setChainId", { chainId });
        const remoteId = this.getEvmNetworkList.find(
          el => el.chainId === chainId
        ).remoteId;
        this.$store.commit("tport/setRemoteId", { remoteId });

        this.updateTportState();

        window.ethereum.on("accountsChanged", a => {
          this.$store.commit("tport/setAccountName", { accountName: a[0] });
          this.evmAccount = a[0];
        });
        window.ethereum.on("chainChanged", chainId => {
          this.$store.commit("tport/setChainId", { chainId });
          const remoteId = this.getEvmNetworkList.find(
            el => el.chainId === chainId
          ).remoteId;
          this.$store.commit("tport/setRemoteId", { remoteId });
        });
      } else {
        console.error("Could not get injected web3");
      }
    },

    async switchTportNetwork() {
      // TODO Add catch switch errors
      // try {
      const chainData = this.getEvmNetworkList.find(
        el => el.name.toUpperCase() === this.selectedNetwork
      );
      const chainId = "0x" + chainData.chainId.toString(16);
      // console.log("Chain id:", chainId);
      /* TODO Refine prompt for user to add chains:
          https://community.metamask.io/t/prompt-user-to-change-chain/4528/7
          https://docs.metamask.io/guide/rpc-api.html#other-rpc-methods
        */
      if (chainData.rpcUrls) {
        await ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: chainId,
              chainName: chainData.chainName,
              nativeCurrency: chainData.nativeCurrency,
              rpcUrls: chainData.rpcUrls
            }
          ]
        });
      }
      await ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: chainId }]
      });
      // } catch {
      //   return false;
      // }
      // return true;
    },

    async updateTportState() {
      if (this.getEvmChainId && this.getEvmAccountName) {
        const { injectedWeb3, web3 } = await this.$web3();

        if (injectedWeb3) {
          // console.log(
          //   "Reloading Evm balances. Chain ID: ",
          //   this.getEvmChainId,
          //   "; Network list:",
          //   this.getEvmNetworkList
          // );
          const chainData = this.getEvmNetworkList.find(
            el => el.chainId === this.getEvmChainId
          );
          // console.log("chain data:", chainData);
          if (typeof chainData === "undefined") {
            this.unsupportedEvmChain = true;
          } else {
            this.unsupportedEvmChain = false;
            // console.log("ERC20 ABI:", this.$erc20Abi, "Chain data:", chainData);
            const token = this.getTPortTokensBySym(this.selectedTokenSym);
            // console.log("TPort token:", token);
            if (typeof token === "undefined") {
              console.error("TPort Token not found");
            } else {
              const remoteContractAddress = token.remote_contracts.find(
                el => el.key === chainData.remoteId
              ).value;
              // console.log("remoteContractAddress:", remoteContractAddress);
              const remoteInstance = new web3.eth.Contract(
                this.$erc20Abi,
                remoteContractAddress
              ); // TODO Add check to validate abi
              // console.log("remoteInstance:", remoteInstance);
              const balance = await remoteInstance.methods
                .balanceOf(this.getEvmAccountName)
                .call();
              // console.log("Balance is:", balance);
              this.remoteBalance = Number(balance / 10000).toLocaleString();
            }
          }
        }
      }
    }
  },
  mounted() {
    if (this.$route.query.token_sym !== undefined)
      this.selectedTokenSym = this.$route.query.token_sym;
    // this.selectedNetwork = this.currentChain.NETWORK_NAME;
    this.setBridgeTokens();
    this.reloadWallet(this.accountName);
    this.setTPortTokens();
    this.connectWeb3();
  },

  watch: {
    async accountName() {
      this.reloadWallet(this.accountName);
    },
    async selectedNetwork() {
      if (this.supportedEvmChains.includes(this.selectedNetwork))
        this.connectWeb3();
    }
    /* TODO Add watch for metamask changes
    getAccountName(accountName) {
      if (accountName) {
        // console.log('Account name changed')
        this.updateBalances();
        this.loadTeleports();
      }
    },
    getChainId(chainId) {
      if (chainId) {
        // console.log('Chain changed')
        this.updateBalances();
        this.loadTeleports();
      }
    }
    */
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
