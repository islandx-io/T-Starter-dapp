<template>
  <q-form @submit="trySend" ref="sendForm">
    <div class="row">
      <div class="networks row justify-center q-pb-sm">
        <div class="text-weight-light text-subtitle2  col-12 text-center">
          {{ currentChain.NETWORK_NAME }} Balance
        </div>
        <div>{{ balance }} {{ selectedTokenSym }}</div>
      </div>
      <div class="networks row justify-center q-pb-sm">
        <div class="text-weight-light text-subtitle2  col-12 text-center">
          {{ selectedNetwork }} Balance
        </div>
        <div>{{ remoteBalance }} {{ selectedTokenSym }}</div>
      </div>
    </div>
    <div v-if="isAuthenticated" class="q-gutter-y-sm self-stretch">
      <div class="row justify-between q-py-md">
        <q-btn
          class="hover-accent"
          color="primary"
          no-shadow
          no-caps
          @click="connectWeb3()"
        >
          <div v-if="getEvmAccountName === ''">
            Connect wallet
          </div>
          <div
            class="ellipsis"
            style="max-width: 100px"
            v-else-if="!wrongNetwork"
          >
            {{ getEvmAccountName }}
          </div>
          <div v-else>
            Wrong Network
          </div>
        </q-btn>
      </div>
      <div class="text-right">
        Minimum: {{ minSend }} {{ selectedTokenSym }}
      </div>
      <amount-input
        :selectedTokenSym="selectedTokenSym"
        :selectedToken="selectedToken"
        :amount.sync="amount"
        :balance="remoteBalance"
        :min="minSend"
      />
    </div>
    <div class="text-center self-stretch q-pt-sm q-gutter-x-sm">
      <q-btn
        class="hover-accent"
        size="lg"
        color="primary"
        dense
        no-shadow
        label="Receive"
        style="width: 40%"
        type="submit"
        :disabled="selectedToken === undefined || wrongNetwork"
      />
    </div>
    <send-warnings
      :crossChain="
        selectedNetwork.toUpperCase() !==
          currentChain.NETWORK_NAME.toUpperCase()
      "
      :tokenNotFound="selectedToken === undefined"
      :wrongNetwork="wrongNetwork"
    />

    <send-tx-dialog
      :transaction="transaction"
      :showTransaction.sync="showTransaction"
    />
  </q-form>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import netSelector from "src/components/NetSelector";
import amountInput from "src/components/send/AmountInput";
import sendTxDialog from "src/components/send/SendTxDialog";
import sendWarnings from "src/components/send/SendWarnings";
import metamask from "src/components/Metamask";

export default {
  components: { amountInput, sendTxDialog, sendWarnings },
  mixins: [metamask],
  props: ["selectedTokenSym", "selectedNetwork", "supportedEvmChains"],
  data() {
    return {
      amount: null,
      showTransaction: false,
      transaction: null,
      remoteBalance: 0
    };
  },
  computed: {
    ...mapGetters("account", ["isAuthenticated", "accountName", "wallet"]),
    ...mapGetters("tport", [
      "getEvmAccountName",
      "getEvmNetwork",
      "getEvmChainId",
      "getEvmRemoteId",
      "getEvmNetworkList",
      "getTPortTokensBySym",
      "getEvmNetworkByName",
      "getTeleports"
    ]),
    ...mapGetters("blockchains", [
      "currentChain",
      "getNetworkByName",
      "getBridgeTokens"
    ]),
    selectedToken() {
      return this.wallet.find(a => a.token_sym === this.selectedTokenSym);
    },

    token_contract() {
      return this.selectedToken ? this.selectedToken.token_contract : null;
    },

    token_decimals() {
      return this.selectedToken ? this.selectedToken.decimals : null;
    },

    balance() {
      return this.selectedToken ? this.selectedToken.balance : 0;
    },

    minSend() {
      const token = this.getTPortTokensBySym(this.selectedTokenSym);
      if (typeof token === "undefined") return 0;
      else return this.$chainToQty(token.min_quantity);
    },

    wrongNetwork() {
      if (this.getEvmNetwork) {
        return (
          this.getEvmNetwork.name.toUpperCase() !==
          this.selectedNetwork.toUpperCase()
        );
      } else return true;
    }
  },
  methods: {
    ...mapActions("account", ["setWalletBalances"]),

    changeNetwork(network) {
      this.$emit("update:selectedNetwork", network);
    },

    async updateBalance() {
      if (this.getEvmChainId && this.getEvmAccountName) {
        const { injectedWeb3, web3 } = await this.$web3();

        if (injectedWeb3) {
          if (this.wrongNetwork) this.remoteBalance = 0;
          else {
            // console.log("ERC20 ABI:", this.$erc20Abi, "Chain data:", chainData);
            const token = this.getTPortTokensBySym(this.selectedTokenSym);
            // console.log("TPort token:", token);
            if (typeof token === "undefined") {
              console.error("TPort Token not found");
            } else {
              const remoteContractAddress = token.remote_contracts.find(
                el => el.key === this.getEvmRemoteId
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
              this.remoteBalance = Number(balance / 10000);
            }
          }
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
    },

    async send() {
      if (this.getEvmChainId && this.getEvmAccountName) {
        const { injectedWeb3, web3 } = await this.$web3();

        if (injectedWeb3) {
          const token = this.getTPortTokensBySym(this.selectedTokenSym);
          if (typeof token === "undefined") {
            console.error("TPort Token not found");
          } else {
            const remoteContractAddress = token.remote_contracts.find(
              el => el.key === this.getEvmRemoteId
            ).value;
            const remoteInstance = new web3.eth.Contract(
              this.$erc20Abi,
              remoteContractAddress
            );
            try {
              const resp = await remoteInstance.methods
                .teleport(this.accountName, this.amount * 10000, 0)
                .send({ from: this.getEvmAccountName });
              // console.log(resp);
              this.amount = null;
              this.$refs.sendForm.reset();
              this.$refs.sendForm.resetValidation();
              this.setWalletBalances(this.accountName);
              this.updateBalance();
            } catch (error) {
              this.$errorNotification(error);
            }
          }
        }
      }
    }
  },
  async mounted() {
    await this.connectWeb3();
    await this.switchMetamaskNetwork(this.selectedNetwork);
    this.updateBalance();
  },
  watch: {
    async selectedNetwork() {
      if (this.supportedEvmChains.includes(this.selectedNetwork)) {
        this.switchMetamaskNetwork(this.selectedNetwork);
        this.updateBalance();
      }
    },
    async getEvmChainId() {
      this.updateBalance();
    },
    async getEvmAccountName() {
      this.updateBalance();
    }
  }
};
</script>
