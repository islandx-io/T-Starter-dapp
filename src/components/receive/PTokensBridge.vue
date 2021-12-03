<template>
  <div>
    <!-- Generate address button -->
    <!-- <q-btn
      class="q-mt-md"
      v-if="selectedNetwork === 'bitcoin'"
      @click="setAddresses"
      color="primary"
      label="Generate new address"
    /> -->
    <!-- Ethereum receive  -->
    <!-- <div
      v-if="selectedNetwork === 'ethereum'"
      class="column items-center q-pt-md q-gutter-y-sm"
    > -->
    <!-- If metamask isn't installed start onboarding process -->
    <!-- <q-btn
        v-if="isMetaMaskInstalled && !metamaskConnected"
        color="primary"
        label="Connect Metamask"
        @click="ethereumConnect()"
      /> -->
    <!-- Else login with metamask -->
    <!-- <div v-if="!isMetaMaskInstalled">
        Install or enable metamask first.
      </div>
      <q-btn
        v-if="!isMetaMaskInstalled"
        color="primary"
        label="Install metamask"
        @click="metamaskOnboarding()"
      /> -->
    <!-- Input amount of eth to peth -->
    <!-- <div
        v-if="
          selectedToken.toUpperCase() === 'PETH' &&
            isMetaMaskInstalled &&
            metamaskConnected
        "
        class="column items-center q-gutter-y-md"
      >
        <q-input
          v-model="amount"
          label="ETH"
          outlined
          placeholder="0"
          autofocus
          @keyup.enter="tryPegIn()"
          :disable="devMode"
          :loading="txnPending"
        />
        <q-btn
          color="primary"
          label="Issue"
          @click="tryPegIn()"
          :disable="devMode || txnPending === true"
        />
      </div> -->
    <!-- Input amount of tlos erc20 to tlos -->
    <!-- <div
        v-if="
          selectedToken.toUpperCase() === 'TLOS' &&
            isMetaMaskInstalled &&
            metamaskConnected
        "
        class="column items-center q-gutter-y-md"
      >
        <q-input
          v-model="amount"
          label="TLOS (ERC-20)"
          outlined
          placeholder="0"
          autofocus
          @keyup.enter="tryPegOut()"
          :disable="devMode"
          :loading="txnPending"
        />
        <q-btn
          color="primary"
          label="Redeem"
          @click="tryPegOut()"
          :disable="devMode || txnPending === true"
        />
      </div>
    </div> -->
    <!-- TODO make this pretty -->
    <!-- <q-linear-progress
      indeterminate
      size="25px"
      color="primary"
      track-color="secondary"
      rounded
      style="margin-top: 15px"
      v-if="txnPending"
    >
      <div class="absolute-full flex flex-center">
        <q-badge
          text-color="black"
          color="secondary"
          :label="txStatusMessage"
        />
      </div>
    </q-linear-progress> -->
  </div>
</template>

<script>
// -------------------------------------- NOTE --------------------------------------
// Currently this component is only used as a mixin for its pTokenBridgeLink() function.
// ----------------------------------------------------------------------------------

import { PBTC } from "ptokens-pbtc";
import { pERC20 } from "ptokens-perc20";
import { pEosioToken } from "ptokens-peosio-token";
import { HttpProvider } from "ptokens-providers";
import { Node } from "ptokens-node";
import Web3 from "web3";
import MetaMaskOnboarding from "@metamask/onboarding";
// import { BigNumber } from "bignumber.js";
import { constants, eth } from "ptokens-utils";

export default {
  data() {
    return {
      devMode: false
    };
  },
  computed: {
    selectedEthAccount() {
      return window.ethereum.selectedAddress;
    },

    //Created check function to see if the MetaMask extension is installed
    isMetaMaskInstalled() {
      //Have to check the ethereum binding on the window object to see if it's installed
      const { ethereum } = window;
      return Boolean(ethereum && ethereum.isMetaMask);
    },

    metamaskConnected() {
      if (window.ethereum.selectedAddress > 0 || this.ethAccounts.length > 0) {
        return true;
      } else {
        return false;
      }
    }
  },
  methods: {
    pTokenBridgeLink(sym) {
      sym = sym.toUpperCase();
      // if telos chain
      if (this.currentChain.NETWORK_NAME === "TELOS") {
        if (sym === "TLOS") {
          return "https://dapp.ptokens.io/swap?asset=tlos&from=eth&to=telos";
        } else if (sym === "PBTC") {
          return "https://dapp.ptokens.io/swap?asset=btc&from=btc&to=telos";
        } else if (sym === "PETH") {
          return "https://dapp.ptokens.io/swap?asset=eth&from=eth&to=telos";
        } else if (sym === "PUSDC") {
          return "https://dapp.ptokens.io/swap?asset=usdc&from=eth&to=telos";
        } else if (sym === "PUSDT") {
          return "https://dapp.ptokens.io/swap?asset=usdt&from=eth&to=telos";
        }
      } else if (this.currentChain.NETWORK_NAME === "EOS") {
        if (sym === "PBTC") {
          return "https://dapp.ptokens.io/swap?asset=btc&from=btc&to=eos";
        } else if (sym === "PETH") {
          return "https://dapp.ptokens.io/swap?asset=eth&from=eth&to=eos";
        } else if (sym === "EOS") {
          return "https://dapp.ptokens.io/swap?asset=eos&from=eth&to=eos";
        }
      } else if (this.currentChain.NETWORK_NAME === "WAX") {
      }
    }
  },

  async getCurrentGasPrice() {
    web3 = new Web3(window.ethereum);
    let gas_wei = await web3.eth.getGasPrice();
    return gas_wei;
  },

  // toWei(number) {
  //   return BigNumber(number).multipliedBy(10 ** 18);
  // },

  metamaskOnboarding() {
    const onboarding = new MetaMaskOnboarding();
    onboarding.startOnboarding();
  },

  async ethereumConnect() {
    if (window.ethereum) {
      web3 = new Web3(window.ethereum);
      const accounts = await ethereum.request({
        method: "eth_requestAccounts"
      });
      this.ethAccounts = await ethereum.request({ method: "eth_accounts" });
      console.log(this.ethAccounts);
    }
  },

  async tryPegIn() {
    try {
      this.txnPending = true;
      await this.pegIn();
      this.$q.notify({
        color: "green-4",
        textColor: "white",
        icon: "cloud_done",
        message: "Completed"
      });
      this.txnPending = false;
    } catch (error) {
      this.$q.notify({
        color: "red-5",
        textColor: "white",
        icon: "warning",
        message: `${error}`
      });
      this.txnPending = false;
    }
  },

  // ETH to PETH
  async pegIn() {
    if (window.ethereum) {
      this.txStatusMessage = "Preparing for transaction";
      const peth = new pERC20({
        pToken: "PETH",
        ethProvider: window.ethereum,

        hostBlockchain: "telos",
        hostNetwork: "mainnet",
        nativeBlockchain: "ethereum",
        nativeNetwork: "mainnet",

        telosRpc: "https://telos.caleos.io" //  TODO process.env.HYPERION_ENDPOINT, use instead
      });

      try {
        const transaction = await peth
          .issue(this.toWei(this.amount), this.accountName, {
            gas: 200000,
            gasPrice: await this.getCurrentGasPrice()
          })
          .once("nativeTxBroadcasted", tx => {
            this.txStatusMessage = "Native transaction broadcasted";
            console.log(tx);
          })
          .once("nativeTxConfirmed", tx => {
            this.txStatusMessage = "Native transaction confirmed";
            console.log(tx.transactionHash);
            this.txnPending = false;
          });
        // .once("nodeReceivedTx", report => {
        //   this.txStatusMessage = "Node received transaction";
        //   console.log(tx);
        // })
        // .once("nodeBroadcastedTx", report => {
        //   this.txStatusMessage = "Node broadcasted transaction";
        //   console.log(tx);
        // })
        // .once("hostTxConfirmed", tx => {
        //   this.txStatusMessage = "Host transaction confirmed";
        //   console.log(tx);
        // })
        // .then(res => console.log(res));
      } catch (e) {
        throw e.cause.message;
      }
    } else {
      console.log("No web3 detected");
    }
  },

  async tryPegOut() {
    try {
      this.txnPending = true;
      await this.pegOut();
      this.$q.notify({
        color: "green-4",
        textColor: "white",
        icon: "cloud_done",
        message: "Submitted"
      });
      this.txnPending = false;
    } catch (error) {
      this.$errorNotification(error);
      this.txnPending = false;
    }
  },

  //TLOS (ERC20) to TLOS
  async pegOut() {
    this.txStatusMessage = "Preparing for transaction";
    const telos = new pEosioToken({
      pToken: "TLOS",

      // if you want to be more detailed
      hostBlockchain: "ethereum",
      hostNetwork: "mainnet", // possible values are testnet_jungle2, testnet_ropsten and mainnet
      nativeBlockchain: "telos",
      nativeNetwork: "mainnet",

      // optionals
      ethProvider: window.ethereum, // or instance of Web3 provider
      telosRpc: "https://telos.caleos.io" //  TODO process.env.HYPERION_ENDPOINT, use instead
    });

    try {
      const transaction = await telos
        .redeem(this.toWei(this.amount), this.accountName, {
          gasPrice: await this.getCurrentGasPrice(),
          gas: 200000
        })
        .once("hostTxConfirmed", tx => {
          this.txStatusMessage = "Host transaction confirmed";
          console.log(tx.transactionHash);
          this.txnPending = false;
        });
      // .once("nodeReceivedTx", report => {
      //   this.txStatusMessage = "Node received transaction";
      //   console.log(report);
      // })
      // .once("nodeBroadcastedTx", report => {
      //   this.txStatusMessage = "Node broadcasted transaction";
      //   console.log(report);
      // })
      // .once("nativeTxConfirmed", tx => {
      //   this.txStatusMessage = "Transaction Completed";
      //   console.log(tx);
      // })
      // .then(res => console.log(res));
    } catch (e) {
      throw e.cause.message;
    }
  }
};
</script>
