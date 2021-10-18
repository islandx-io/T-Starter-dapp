<template>
  <div id="qr-canvas" />
</template>

<script>
import QRCodeStyling from "qr-code-styling";
import { mapGetters } from "vuex";

const qrStyling = {
  width: 180,
  height: 180,
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
  data() {
    return {
      qrCode: new QRCodeStyling(qrStyling)
    };
  },
  computed: {
    ...mapGetters("account", ["accountName"])
  },
  methods: {
    async generateQR(text) {
      try {
        return await QRCode.toDataURL(text);
      } catch (err) {
        console.error(err);
      }
    },
    async setAddresses() {
      this.qrCode.update({ data: this.accountName });
      this.qrCode.append(document.getElementById("qr-canvas"));
    }
  },
  mounted() {
    this.setAddresses(); // makes qr codes
  }
};
</script>
