<template>
  <q-page>
    <section>
      <div>I am receiving {{ $route.query }}</div>
      <div v-if="devWarning">Don't do real payments</div>
      <div>{{ BTCaddress }}</div>
      <img  :src="qrCode">
    </section>
  </q-page>
</template>

<script>
import axios from "axios";
import { mapGetters, mapActions } from "vuex";
import QRCodeStyling from "qr-code-styling";
import QRCode from "qrcode";

// const qrCode = new QRCodeStyling({
//   width: 300,
//   height: 300,
//   data: "https://www.facebook.com/",
//   image:
//     "https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg",
//   dotsOptions: {
//     color: "#4267b2",
//     type: "rounded"
//   },
//   backgroundOptions: {
//     color: "#e9ebee"
//   },
//   imageOptions: {
//     crossOrigin: "anonymous",
//     margin: 20
//   }
// });
// qrCode.append(document.getElementById("qrCode"));

export default {
  data() {
    return {
      devWarning: process.env.DEVELOPMENT,
      BTCaddress: "",
      qrCode: ""
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

      this.qrCode = await this.generateQR(this.BTCaddress);
    }
  },
  mounted() {
    this.setBTCaddress();
    
  }
};
</script>
