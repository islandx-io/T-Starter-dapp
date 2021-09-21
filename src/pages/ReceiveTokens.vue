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
        <!-- Back button -->
        <q-btn
          :to="{ name: 'wallet', params: { accountName: accountName } }"
          flat
          round
          class="self-start"
        >
          <q-icon name="fas fa-chevron-circle-left" style="font-size: 50px" />
        </q-btn>
        <!-- Select token dropdown -->
        <div class="column items-center">
          <receive-token-selector :selectedToken.sync="selectedToken" />
          <!-- Network selection -->
          <div class="row items-center q-pb-sm">
            <div class="text-subtitle1 q-pr-sm">From network</div>
            <net-selector
              :selectedNetwork.sync="selectedNetwork"
              :networkOptions="networkOptions"
              @changeNetwork="selectedNetwork = $event"
            />
          </div>

          <!-- """""""""""""""""""""""""""""" -->
          <!-- Current chain network selected -->
          <!-- """""""""""""""""""""""""""""" -->
          <div
            class=" column items-center"
            v-show="selectedNetwork === currentChain.NETWORK_NAME.toLowerCase()"
          >
            <div class="text-subtitle1 q-py-md text-center">
              Deposit {{ depositTokenStr }} to the following address
            </div>
            <!-- telos qr code-->
            <div></div>
            <div id="tlos-qr-canvas" />

            <!-- <div id="btc-qr-canvas" v-show="selectedNetwork === 'bitcoin'" /> -->
            <!-- Address info -->
            <div class="col text-subtitle1 row q-gutter-x-sm q-mx-md">
              <div
                id="address"
                :class="`col ${selectedNetwork}-net`"
                style="word-wrap: break-word;"
              >
                {{ selectedAddress }}
              </div>
              <!-- Copy address button -->
              <div class="row content-center q-pl-sm">
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
            </div>
          </div>
        </div>
      </q-card>

      <!-- pNetwork app -->
      <!-- TODO This causes a DOM error, but hey it works. -->
      <div
        class="q-mt-md q-card bg-white"
        style="padding: 0 0 20px 0"
        v-if="selectedNetwork.toUpperCase() != currentChain.NETWORK_NAME"
      >
        <div style="border-radius: 10px; overflow: hidden;">
          <iframe
            height="720"
            width="100%"
            :src="pTokenBridgeLink(selectedToken)"
            allowfullscreen
            frameBorder="0"
          >
          </iframe>
        </div>
      </div>

      <!-- Testnet warning -->
      <!-- <q-banner
        rounded
        inline-actions
        class="text-white bg-negative"
        style="margin-top: 15px"
        v-if="process.env.TESTNET"
      >
        Do not make real payments! This is a testnet.
      </q-banner> -->
    </section>
  </q-page>
</template>

<script>
import axios from "axios";
import { mapGetters, mapActions } from "vuex";
import QRCodeStyling from "qr-code-styling";
import QRCode from "qrcode";
import { copyToClipboard } from "quasar";
import receiveTokenSelector from "src/components/receive/ReceiveTokenSelector";
import pTokensBridge from "src/components/receive/PTokensBridge";
import netSelector from "src/components/NetSelector";

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
  components: { receiveTokenSelector, netSelector },
  mixins: [pTokensBridge],
  data() {
    return {
      // devMode: Boolean(process.env.DEVELOPMENT),
      devMode: false,
      receiveLink: "",
      qrCodes: {
        tlos: new QRCodeStyling({ width: 180, height: 180, ...qrStyling }),
        btc: new QRCodeStyling({ width: 270, height: 270, ...qrStyling })
      },
      btcAddress: "",
      selectedNetwork: "Telos",
      selectedToken: "PBTC",
      ethAccounts: [],
      amount: 0,
      txnPending: false,
      txStatusMessage: ""
    };
  },
  computed: {
    ...mapGetters("account", ["isAuthenticated", "accountName", "wallet"]),
    ...mapGetters("blockchains", ["currentChain"]),

    networkOptions() {
      let options = [this.currentChain.NETWORK_DISPLAY_NAME];
      const token = this.selectedToken.toUpperCase();
      if (token === "PBTC") options.push("Bitcoin");
      if (["PETH", "TLOS", "PUSDC", "PUSDT", "EOS"].includes(token))
        options.push("Ethereum");
      return options;
    },

    depositTokenStr() {
      const token = this.selectedToken.toUpperCase();
      const net = this.selectedNetwork.toUpperCase();
      if (token === "PETH") {
        if (net === "TELOS") return "PETH";
        else return "ETH";
      } else if (token === "TLOS") {
        if (net === "TELOS") return "TLOS";
        else return "TLOS (ERC20)";
      } else {
        if (net === "TELOS") return "PBTC";
        else return "BTC";
      }
    },
    selectedAddress() {
      if (this.selectedNetwork === this.currentChain.NETWORK_DISPLAY_NAME)
        return this.accountName;
      else return this.btcAddress;
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

    async generateQR(text) {
      try {
        return await QRCode.toDataURL(text);
      } catch (err) {
        console.error(err);
      }
    },

    async setAddresses() {
      // current chain QR code
      this.qrCodes.tlos.update({ data: this.accountName });
      this.qrCodes.tlos.append(document.getElementById("tlos-qr-canvas"));

      // bitcoin qr code
      // const pbridge_api = await axios.get(
      //   `https://pbtcon${this.currentChain.NETWORK_NAME.toLowerCase()}-node-1a.ngrok.io/pbtc-on-${this.currentChain.NETWORK_NAME.toLowerCase()}/get-native-deposit-address/${
      //     this.accountName
      //   }`
      // );
      // this.btcAddress = pbridge_api.data.nativeDepositAddress || [];
      // this.qrCodes.btc.update({ data: this.btcAddress });
      // this.qrCodes.btc.append(document.getElementById("btc-qr-canvas"));
    }
  },

  mounted() {
    this.selectedNetwork = this.currentChain.NETWORK_DISPLAY_NAME; // sets network to current chain
    this.setAddresses(); // makes qr codes
    if (this.$route.query.token_sym !== undefined)
      this.selectedToken = this.$route.query.token_sym;
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
  font-size: 34px;
}
.q-item:hover {
  background-color: $dark;
  color: $secondary;
  & .q-btn {
    color: $secondary;
  }
}
@media only screen and (max-width: 425px) {
  #btc-qr-canvas {
    margin: -30px -20px;
    transform: scale(0.8);
  }
  #address.bitcoin-net {
    width: 200px;
  }
}
.q-input {
  max-width: 200px;
}
.resp-iframe {
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  width: 100%;
  height: 100%;
}
// .resp-container {
// }
</style>
