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
          <div class="ellipsis" v-if="evmAccount === ''">
            Connect Metamask
          </div>
          <div class="ellipsis" style="max-width: 100px" v-else>
            {{ evmAccount }}
          </div>
        </q-btn>
        <net-selector
          :selectedNetwork="selectedNetwork"
          :networkOptions="networkOptions"
          @changeNetwork="$emit('update:selectedNetwork', $event)"
        />
      </div>
      <amount-input
        :selectedTokenSym="selectedTokenSym"
        :selectedToken="selectedToken"
        :amount.sync="amount"
        :balance="balance"
      />
    </div>
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
    <send-warnings
      :crossChain="
        selectedNetwork.toUpperCase() !==
          currentChain.NETWORK_NAME.toUpperCase()
      "
      :tokenNotFound="selectedToken === undefined"
    />

    <send-tx-dialog
      :transaction="transaction"
      :showTransaction.sync="showTransaction"
    />
  </q-form>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import netSelector from "src/components/send/NetSelector";
import amountInput from "src/components/send/AmountInput";
import sendTxDialog from "src/components/send/SendTxDialog";
import sendWarnings from "src/components/send/SendWarnings";

export default {
  components: { netSelector, amountInput, sendTxDialog, sendWarnings },
  props: ["selectedTokenSym", "selectedNetwork", "networkOptions"],
  data() {
    return {
      amount: null,
      showTransaction: false,
      transaction: null,
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
      "getTPortTokensBySym",
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
    balance() {
      return this.selectedToken ? this.selectedToken.balance : 0;
    }
  },
  methods: {
    ...mapActions("account", ["setWalletBalances"]),
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
        // console.log(
        //   "Current network:",
        //   this.getEvmNetworkList.find(el => el.chainId === chainId)
        // );
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
            el => el.chainId === this.getEvmChainId
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
      if (!(await this.accountExistsOnChain(this.to))) {
        this.$q.notify({
          type: "negative",
          message: `Account ${this.to} does not exist`
        });
        return;
      }
      // if same network, do normal transaction
      let transaction;
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

      transaction = await this.$store.$api.signTransaction(actions);
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
    }
  },
  mounted() {
    this.connectWeb3();
  },
  watch: {
    async selectedNetwork() {
      if (this.supportedEvmChains.includes(this.selectedNetwork))
        this.connectWeb3();
    }
  }
};
</script>
