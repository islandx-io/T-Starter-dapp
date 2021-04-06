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
                v-if="selectedToken.toUpperCase() === 'PETH'"
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
            <!-- <q-btn
                v-if="selectedNetwork !== 'telos'"
                color="primary"
                label="Generate new deposit address"
              /> -->
              
              <!-- Dewald se ethereum login stuff -->
              <q-btn
                v-if="selectedNetwork === 'ethereum' && isMetaMaskInstalled"
                color="primary"
                label="Connect Ethereum Wallet"
                @click="ethereumConnect()"
              />
              <q-btn
                v-if="selectedNetwork === 'ethereum' && !isMetaMaskInstalled"
                color="primary"
                label="Install metamask now!"
                @click="ethereumConnect()"
              />
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
import { HttpProvider } from "ptokens-providers";
import { Node } from "ptokens-node";
import Web3 from "web3";
import MetaMaskOnboarding from '@metamask/onboarding';

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

    //Created check function to see if the MetaMask extension is installed
    isMetaMaskInstalled() {
      //Have to check the ethereum binding on the window object to see if it's installed
      const { ethereum } = window;
      return Boolean(ethereum && ethereum.isMetaMask);
    },

    isDisabled() {
      return true
    },
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

    },

    async ethereumConnect() {
      if (window.ethereum) {
        window.web3 = new Web3(window.ethereum);
        const accounts = await ethereum.request({
          method: "eth_requestAccounts"
        });
        console.log(accounts);
      }
    },
  },
  mounted() {
    this.setAddresses();
    this.qrCodes.tlos.append(document.getElementById("tlos-qr-canvas"));
    this.qrCodes.btc.append(document.getElementById("btc-qr-canvas"));
    this.selectedToken = this.$route.query.token_sym;

    this.ethereumConnect();

    // testing metamask peth
    // const ethEnabled = () => {
    //   console.log("hello eth?")
    //   if (window.ethereum) {
    //     console.log("eth connect")
    //     window.web3 = new Web3(window.ethereum);
    //     window.ethereum.enable();
    //     return true;
    //   }
    //   return false;
    // };

    // if (window.web3) {
    //   const pweth = new pERC20({
    //     pToken: "PWETH",
    //     ethProvider: window.ethereum,

    //     hostBlockchain: "telos",
    //     hostNetwork: "mainnet",
    //     nativeBlockchain: "ethereum",
    //     nativeNetwork: "mainnet"
    //   });
    //   console.log(pweth);

    //   // pweth
    //   //   .issue(1000000000, "fuzzywazziee", { gas: 20000, gasPrice: 75e9 })
    //   //   .once("nativeTxBroadcasted", tx => tx)
    //   //   .once("nativeTxConfirmed", tx => tx)
    //   //   .once("nodeReceivedTx", report => report)
    //   //   .once("nodeBroadcastedTx", report => report)
    //   //   .once("hostTxConfirmed", tx => tx)
    //   //   .then(res => res);
    // } else {
    //   console.log("No web3 detected");
    // }
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
