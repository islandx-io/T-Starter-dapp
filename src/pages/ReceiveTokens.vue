<template>
  <q-page>
    <section>
      <div>I am receiving {{ $route.query }}</div>
      <div v-if="devWarning">Don't do real payments</div>
      <div>{{ BTCaddress }}</div>
      <img :src="QRcode" />

      <div id="canvas"></div>
    </section>
  </q-page>
</template>

<script>
import axios from "axios";
import { mapGetters, mapActions } from "vuex";
import QRCodeStyling from "qr-code-styling";
import QRCode from "qrcode";

const QR = new QRCodeStyling({
  width: 300,
  height: 300,
  data: "",
  image:
    "/tokens/bitcoin.svg",
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
    color: "#e9ebee"
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
      receiveLink: "",
      BTCaddress: "",
      QRcode: "",
      qrCode: QR,

    };
  },
  computed: {
    ...mapGetters("account", ["isAuthenticated", "accountName", "wallet"])
  },
  methods: {
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
      this.qrCode.update({data: this.BTCaddress})
    }
  },
  mounted() {
    if (this.$route.query.token_sym === 'TLOS') {
      this.receiveLink = "https://dapp.ptokens.io/tlos-on-eth/issue-redeem"
    } else if (this.$route.query.token_sym === 'PBTC') {
      this.receiveLink = "https://dapp.ptokens.io/pbtc-on-telos/issue-redeem"
    } else if (this.$route.query.token_sym === 'PETH') {
      this.receiveLink = "https://dapp.ptokens.io/peth-on-telos/issue-redeem"
    }

    window.location.replace(this.receiveLink)


    this.setBTCaddress();
    this.qrCode.append(document.getElementById("canvas"));

  }
};
</script>
