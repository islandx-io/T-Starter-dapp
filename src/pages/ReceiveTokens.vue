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
            <h2 style="line-height: 45px; text-align: center">
              Receive {{ $route.query.token_sym }}
            </h2>
            <div class="text-subtitle1 q-pb-sm">From network</div>
            <div class="networks row q-gutter-x-md">
              <q-btn
                label="Telos"
                @click="network = 'telos'"
                :class="network === 'telos' ? 'selected-network' : ''"
                flat
                size="lg"
                no-caps
                padding="xs"
              />
              <q-btn
                label="Bitcoin"
                @click="network = 'bitcoin'"
                :class="network === 'bitcoin' ? 'selected-network' : ''"
                flat
                size="lg"
                no-caps
                padding="xs"
              />
            </div>
            <div class="text-subtitle1 q-py-md">
              Deposit {{ currency }} to the following address
            </div>
            <div v-if="devWarning">Don't do real payments</div>
            <!-- <img :src="QRcode" /> -->
            <div id="canvas" />
            <div class="text-subtitle1">
              {{ BTCaddress }}
              <q-btn
                flat
                @click="copyAddress(BTCaddress)"
                icon="far fa-clone"
                padding="0"
                color="positive"
                size="sm"
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

const QR = new QRCodeStyling({
  width: 250,
  height: 250,
  data: "",
  image: "/tokens/bitcoin.svg",
  dotsOptions: {
    type: "dots",
    color: "#fdb435",
    gradient: {
      type: "radial",
      rotation: 0.7853981633974483,
      colorStops: [
        {
          offset: 0,
          color: "#f2cb3a"
        },
        {
          offset: 1,
          color: "#6a1a4c"
        }
      ]
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
  data() {
    return {
      devWarning: process.env.DEVELOPMENT,
      BTCaddress: "",
      QRcode: "",
      qrCode: QR,
      network: "telos",
      currency: "pBTC"
    };
  },
  computed: {
    ...mapGetters("account", ["isAuthenticated", "accountName", "wallet"])
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
      this.BTCaddress = pbridge_api.data.nativeDepositAddress || [];

      this.QRcode = await this.generateQR(this.BTCaddress);
      this.qrCode.update({ data: this.BTCaddress });
    }
  },
  mounted() {
    this.setBTCaddress();
    this.qrCode.append(document.getElementById("canvas"));
  }
};
</script>

<style lang="scss" scoped>
.card-container {
  display: grid;
  align-items: stretch;
  grid-template-columns: 50px auto 50px;
}
.header-bg {
  height: 160px;
  margin-bottom: -50px;
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
