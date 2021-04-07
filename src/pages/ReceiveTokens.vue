<template>
  <q-page class="column">
    <section class="header-bg" />
    <div class="self-center flex-shrink">
      <q-card class="card-container">
        <q-btn :to="`/wallet/${accountName}`" flat round class="self-start">
          <q-icon name="fas fa-chevron-circle-left" style="font-size: 50px;" />
        </q-btn>
        <div>
          <div class="column items-center">
            <q-btn-dropdown no-caps flat class="q-ml-md">
              <template v-slot:label class="row items-center">
                <h2>
                  Receive
                </h2>
                <token-avatar
                  class="q-mx-sm"
                  :token="selectedToken"
                  :avatarSize="55"
                />
                <h2>
                  {{ selectedToken }}
                </h2>
              </template>
              <q-list>
                <q-item
                  clickable
                  v-close-popup
                  v-for="token in tokens"
                  :key="token"
                  @click="
                    selectedToken = token;
                    selectedNetwork = 'telos';
                  "
                >
                  <q-item-section>
                    <q-item-label>{{ token }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-btn-dropdown>
            <div class="text-subtitle1 q-pb-sm">From network</div>
            <div class="networks row q-gutter-x-md">
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
                label="Bitcoin"
                v-if="selectedToken.toUpperCase() === 'PBTC'"
                @click="selectedNetwork = 'bitcoin'"
                :class="selectedNetwork === 'bitcoin' ? 'selected-network' : ''"
                flat
                size="lg"
                no-caps
                padding="xs"
              />
              <q-btn
                label="Ethereum"
                v-if="['PETH', 'TLOS'].includes(selectedToken.toUpperCase())"
                @click="selectedNetwork = 'ethereum'"
                :class="
                  selectedNetwork === 'ethereum' ? 'selected-network' : ''
                "
                flat
                size="lg"
                no-caps
                padding="xs"
              />
            </div>
            <div
              class="text-subtitle1 q-py-md"
              v-if="selectedNetwork !== 'ethereum'"
            >
              Deposit {{ depositTokenStr }} to the following address
            </div>
            <div v-if="devWarning">Don't do real payments</div>
            <div id="tlos-qr-canvas" v-show="selectedNetwork === 'telos'" />
            <div id="btc-qr-canvas" v-show="selectedNetwork === 'bitcoin'" />
            <div
              class="text-subtitle1"
              v-show="
                selectedNetwork === 'telos' || selectedNetwork === 'bitcoin'
              "
            >
              {{ selectedAddress }}
              <q-btn
                flat
                v-if="selectedAddress !== ''"
                @click="copyAddress(selectedAddress)"
                icon="far fa-clone"
                padding="0"
                color="positive"
                size="sm"
              />
            </div>
            <!-- Create new btc address -->
            <q-btn
              v-if="selectedNetwork === 'bitcoin'"
              color="primary"
              label="Generate new deposit address"
              @click="setAddresses()"
            />

            <div
              v-if="selectedNetwork === 'ethereum'"
              class="column items-center q-pt-md q-gutter-y-sm"
            >
              <!-- If metamask isn't installed start onboarding process -->
              <q-btn
                v-if="isMetaMaskInstalled && !metamaskConnected"
                color="primary"
                label="Connect Metamask"
                @click="ethereumConnect()"
              />
              <!-- Else login with metamask -->
              <div v-if="!isMetaMaskInstalled">
                Install or enable metamask first.
              </div>
              <q-btn
                v-if="!isMetaMaskInstalled"
                color="primary"
                label="Install metamask"
                @click="metamaskOnboarding()"
              />
              <!-- Input amount of eth to peth -->
              <div
                v-if="
                  selectedToken.toUpperCase() === 'PETH' &&
                    isMetaMaskInstalled &&
                    metamaskConnected
                "
              >
                <q-input v-model="amount" label="ETH" />
                <q-btn color="primary" label="Issue" @click="pegIn()" />
              </div>
              <!-- Input amount of tlos erc20 to tlos -->
              <div
                v-if="
                  selectedToken.toUpperCase() === 'TLOS' &&
                    isMetaMaskInstalled &&
                    metamaskConnected
                "
              >
                <q-input v-model="amount" label="TLOS (ERC-20)" />
                <q-btn color="primary" label="Redeem" @click="pegOut()" />
              </div>
            </div>
          </div>
        </div>
      </q-card>
    </div>
  </q-page>
</template>

<script>
import axios from "axios";
import { mapGetters, mapActions } from "vuex";
import QRCodeStyling from "qr-code-styling";
import QRCode from "qrcode";
import { copyToClipboard } from "quasar";
import tokenAvatar from "src/components/TokenAvatar";
import { pERC20 } from "ptokens-perc20";
import { pEosioToken } from "ptokens-peosio-token";
import { HttpProvider } from "ptokens-providers";
import { Node } from "ptokens-node";
import Web3 from "web3";
import MetaMaskOnboarding from "@metamask/onboarding";
import { BigNumber } from "bignumber.js";
import { constants, eth } from "ptokens-utils";

const qrStyling = {
  data: "",
  qrOptions: {
    typeNumber: "0",
    mode: "Byte",
    errorCorrectionLevel: "Q"
  },
  dotsOptions: {
    type: "rounded",
    color: "black"
  },
  cornersSquareOptions: { type: "extra-rounded", color: "black" },
  cornersSquareOptionsHelper: {
    colorType: { single: true, gradient: false },
    gradient: {
      linear: true,
      radial: false,
      color1: "black",
      color2: "black",
      rotation: "0"
    }
  },
  cornersDotOptions: { type: "", color: "black" },
  cornersDotOptionsHelper: {
    colorType: { single: true, gradient: false },
    gradient: {
      linear: true,
      radial: false,
      color1: "black",
      color2: "black",
      rotation: "0"
    }
  },
  backgroundOptions: {
    color: "#f9fbfe"
  },
  imageOptions: {
    crossOrigin: "anonymous",
    margin: 20
  }
};

export default {
  components: { tokenAvatar },
  data() {
    return {
      devWarning: process.env.DEVELOPMENT,
      receiveLink: "",
      qrCodes: {
        tlos: new QRCodeStyling({ width: 180, height: 180, ...qrStyling }),
        btc: new QRCodeStyling({ width: 270, height: 270, ...qrStyling })
      },
      btcAddress: "",
      selectedNetwork: "telos",
      tokens: ["pBTC", "pETH", "TLOS"],
      selectedToken: "pBTC",
      ethAccounts: [],
      amount: 0
    };
  },
  computed: {
    ...mapGetters("account", ["isAuthenticated", "accountName", "wallet"]),
    depositTokenStr() {
      if (this.selectedToken.toUpperCase() === "PETH") {
        if (this.selectedNetwork === "telos") return "pETH";
        else return "ETH";
      } else if (this.selectedToken.toUpperCase() === "TLOS") {
        if (this.selectedNetwork === "telos") return "TLOS";
        else return "TLOS (ERC20)";
      } else {
        if (this.selectedNetwork === "telos") return "pBTC";
        else return "BTC";
      }
    },
    selectedAddress() {
      if (this.selectedNetwork === "telos") return this.accountName;
      else return this.btcAddress;
    },

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
      if (
        window.ethereum._state.accounts.length > 0 ||
        this.ethAccounts.length > 0
      ) {
        return true;
      } else {
        return false;
      }
    }
  },

  methods: {
    copyAddress(adress) {
      copyToClipboard(adress).then(() => {
        this.$q.notify({
          color: "green-4",
          textColor: "secondary",
          message: "Copied account to clipboard",
          timeout: 1000
        });
      });
    },

    toWei(number) {
      return new BigNumber(String(number) + "e18");
    },

    async generateQR(text) {
      try {
        return await QRCode.toDataURL(text);
      } catch (err) {
        console.error(err);
      }
    },

    async setAddresses() {
      const pbridge_api = await axios.get(
        `https://pbtcontelos-node-1a.ngrok.io/pbtc-on-telos/get-native-deposit-address/${this.accountName}`
      );
      this.btcAddress = pbridge_api.data.nativeDepositAddress || [];
      this.qrCodes.btc.update({ data: this.btcAddress });
      this.qrCodes.tlos.update({ data: this.accountName });
    },

    metamaskOnboarding() {
      const onboarding = new MetaMaskOnboarding();
      onboarding.startOnboarding();
    },

    async ethereumConnect() {
      if (window.ethereum) {
        window.web3 = new Web3(window.ethereum);
        const accounts = await ethereum.request({
          method: "eth_requestAccounts"
        });
        this.ethAccounts = await ethereum.request({ method: "eth_accounts" });
        console.log(this.ethAccounts);
      }
    },

    // ETH to PETH
    pegIn() {
      if (window.web3) {
        const pweth = new pERC20({
          pToken: "PETH",
          ethProvider: window.ethereum,

          hostBlockchain: "telos",
          hostNetwork: "mainnet",
          nativeBlockchain: "ethereum",
          nativeNetwork: "mainnnet"
        });
        console.log(pweth);

        pweth
          .issue(this.toWei(this.amount), this.accountName, {
            gas: 30000,
            gasPrice: 75e9
          })
          .once("nativeTxBroadcasted", tx => tx)
          .once("nativeTxConfirmed", tx => tx)
          .once("nodeReceivedTx", report => report)
          .once("nodeBroadcastedTx", report => report)
          .once("hostTxConfirmed", tx => tx)
          .then(res => res);
      } else {
        console.log("No web3 detected");
      }
    },

    //TLOS (ERC20) to TLOS
    pegOut() {
      const telos = new pEosioToken({
        pToken: "TLOS",

        // if you want to be more detailed
        hostBlockchain: "ETH",
        hostNetwork: "mainnet", // possible values are testnet_jungle2, testnet_ropsten and mainnet
        nativeBlockchain: "Telos",
        nativeNetwork: "mainnet",

        // optionals
        ethProvider: window.ethereum, // or instance of Web3 provider
        eosRpc: "https://telos.caleos.io", // or also an instance of JsonRpc
      });

      telos
        .redeem(this.toWei(this.amount), this.accountName, {
          gasPrice: 100e9,
          gas: 200000
        })
        .once("hostTxConfirmed", tx => tx)
        .once("nodeReceivedTx", report => report)
        .once("nodeBroadcastedTx", report => report)
        .once("nativeTxConfirmed", tx => tx)
        .then(res => res);
    }
  },

  mounted() {
    this.setAddresses();
    this.qrCodes.tlos.append(document.getElementById("tlos-qr-canvas"));
    this.qrCodes.btc.append(document.getElementById("btc-qr-canvas"));
    this.selectedToken = this.$route.query.token_sym;
  }
};
</script>

<style lang="scss" scoped>
.card-container {
  display: grid;
  align-items: stretch;
  grid-template-columns: 50px auto 50px;
  padding-bottom: 40px;
}
.header-bg {
  height: 160px;
  margin-bottom: -50px;
}
h2 {
  line-height: 45px;
  margin: 10px 0;
  font-size: 35px;
}
.networks {
  .q-btn {
    background-color: silver;
    color: $secondary;
    width: 120px;
    align-items: center;
  }
  .q-btn.selected-network {
    background-color: $space;
  }
}
</style>
