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
                @click="selectedNetwork = 'etherium'"
                :class="
                  selectedNetwork === 'etherium' ? 'selected-network' : ''
                "
                flat
                size="lg"
                no-caps
                padding="xs"
              />
            </div>
            <div class="text-subtitle1 q-py-md">
              Deposit {{ depositTokenStr }} to the following address
            </div>
            <div v-if="devWarning">Don't do real payments</div>
            <!-- <img :src="QRcode" /> -->
            <div
              class="column items-center"
              v-show="selectedNetwork === 'telos'"
            >
              <div id="canvas" />
              <div class="text-subtitle1">
                {{ address }}
                <q-btn
                  flat
                  v-if="address !== ''"
                  @click="copyAddress(address)"
                  icon="far fa-clone"
                  padding="0"
                  color="positive"
                  size="sm"
                />
              </div>
            </div>
            <div class="column">
              <q-btn
                v-if="selectedNetwork !== 'telos'"
                color="primary"
                label="Generate new deposit address"
              />
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

const QR = new QRCodeStyling({
  width: 250,
  height: 250,
  data: "",
  qrOptions: {
    typeNumber: "0",
    mode: "Byte",
    errorCorrectionLevel: "L"
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
});

export default {
  components: { tokenAvatar },
  data() {
    return {
      devWarning: process.env.DEVELOPMENT,
      receiveLink: "",
      address: "",
      QRcode: "",
      qrCode: QR,
      selectedNetwork: "telos",
      tokens: ["pBTC", "pETH", "TLOS"],
      selectedToken: "pBTC"
    };
  },
  computed: {
    ...mapGetters("account", ["isAuthenticated", "accountName", "wallet"]),
    depositTokenStr() {
      if (this.selectedToken === "pETH") {
        if (this.selectedNetwork === "telos") return "pETH";
        else return "ETH";
      } else {
        if (this.selectedNetwork === "telos") return "pBTC";
        else return "BTC";
      }
    }
  },
  methods: {
    copyAddress(adress) {
      copyToClipboard(adress).then(() => {
        this.$q.notify({
          color: "green-4",
          textColor: "secondary",
          message: "Copied account name to clipboard",
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

    async setBTCaddress() {
      const pbridge_api = await axios.get(
        `https://pbtcontelos-node-1a.ngrok.io/pbtc-on-telos/get-native-deposit-address/${this.accountName}`
      );
      this.address = pbridge_api.data.nativeDepositAddress || [];

      this.QRcode = await this.generateQR(this.address);
      this.qrCode.update({ data: this.address });
    }
  },
  mounted() {
    this.setBTCaddress();
    this.qrCode.append(document.getElementById("canvas"));
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
