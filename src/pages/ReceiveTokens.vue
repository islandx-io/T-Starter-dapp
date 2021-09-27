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
        <div class="column items-center">
          <!-- Token selector -->
          <receive-token-selector
            :selectedToken.sync="selectedTokenSym"
            @update:selectedToken="
              selectedNetwork = currentChain.NETWORK_DISPLAY_NAME
            "
          />
          <!-- Network selector -->
          <div class="row items-center q-pb-sm">
            <div class="text-subtitle1 q-pr-sm">From network</div>
            <net-selector
              :selectedNetwork.sync="selectedNetwork"
              :networkOptions="networkOptions"
              @changeNetwork="selectedNetwork = $event"
            />
          </div>

          <div class=" column items-center" v-show="isNativeChain">
            <div class="text-subtitle1 q-py-md text-center">
              Deposit {{ selectedTokenSym }} to the following address
            </div>
            <!-- telos qr code-->
            <receive-qr />

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
          <receive-teleport
            v-if="!isNativeChain && isTPortToken"
            :selectedTokenSym="selectedTokenSym"
            :selectedNetwork="selectedNetwork"
            :supportedEvmChains="supportedEvmChains"
          />
        </div>
      </q-card>

      <!-- pNetwork app -->
      <!-- TODO This causes a DOM error, but hey it works. -->
      <div
        class="q-mt-md q-card bg-white"
        style="padding: 0 0 20px 0"
        v-if="!isNativeChain && !isTPortToken"
      >
        <div style="border-radius: 10px; overflow: hidden;">
          <iframe
            height="720"
            width="100%"
            :src="pTokenBridgeLink(selectedTokenSym)"
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
import { copyToClipboard } from "quasar";
import receiveTokenSelector from "src/components/receive/ReceiveTokenSelector";
import pTokensBridge from "src/components/receive/PTokensBridge";
import netSelector from "src/components/NetSelector";
import receiveQr from "src/components/receive/ReceiveQr";
import receiveTeleport from "src/components/receive/ReceiveTeleport";

export default {
  components: { receiveTokenSelector, netSelector, receiveQr, receiveTeleport },
  mixins: [pTokensBridge],
  data() {
    return {
      receiveLink: "",
      btcAddress: "",
      selectedNetwork: "TELOS",
      selectedTokenSym: "PBTC",
      ethAccounts: [],
      amount: 0,
      txnPending: false,
      txStatusMessage: ""
    };
  },
  computed: {
    ...mapGetters("account", ["isAuthenticated", "accountName", "wallet"]),
    ...mapGetters("blockchains", ["currentChain"]),
    ...mapGetters("tport", [
      "getEvmNetworkList",
      "getTPortTokensBySym",
      "getTeleports"
    ]),

    isTPortToken() {
      return this.getTPortTokensBySym(this.selectedTokenSym);
    },

    isNativeChain() {
      return (
        this.selectedNetwork.toUpperCase() === this.currentChain.NETWORK_NAME
      );
    },

    selectedToken() {
      return this.wallet.find(a => a.token_sym === this.selectedTokenSym);
    },

    supportedEvmChains() {
      const token = this.getTPortTokensBySym(this.selectedTokenSym);
      if (token) {
        // console.log({ token });
        let res = [];
        for (let r of token.remote_contracts) {
          const network = this.getEvmNetworkList.find(
            el => el.remoteId === r.key
          );
          if (network) res.push(network.name.toUpperCase());
        }
        return res;
      } else return [];
    },

    networkOptions() {
      const token = this.selectedTokenSym.toUpperCase();

      // Current chain
      let networks = [this.currentChain.NETWORK_DISPLAY_NAME];

      // pNetwork: Bitcoin
      if (token === "PBTC") networks.push("Bitcoin");

      // pNetwork: Ethereum
      if (["PETH", "TLOS", "PUSDC", "PUSDT", "EOS"].includes(token))
        networks.push("Ethereum");

      // Extend with teleport chains
      return [...networks, ...this.supportedEvmChains];
    },

    // depositTokenStr() {
    //   const token = this.selectedTokenSym.toUpperCase();
    //   const net = this.selectedNetwork.toUpperCase();
    //   switch (token) {
    //     case "PBTC":
    //       if (net === "TELOS") return "PBTC";
    //       else return "BTC";
    //     case "PETH":
    //       if (net === "TELOS") return "PETH";
    //       else return "ETH";
    //     case "TLOS":
    //       if (net === "TELOS") return "TLOS";
    //       else return "TLOS (ERC20)";
    //     default:
    //       return this.selectedTokenSym;
    //   }
    // },
    selectedAddress() {
      if (this.selectedNetwork === this.currentChain.NETWORK_DISPLAY_NAME)
        return this.accountName;
      else return this.btcAddress;
    }
  },

  methods: {
    ...mapActions("account", ["reloadWallet", "setWalletBalances"]),
    ...mapActions("tport", ["setTPortTokens"]),
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

    isPToken(sym) {
      return ["PETH", "TLOS", "PUSDC", "PUSDT", "EOS"].includes(sym);
    }
  },

  mounted() {
    // this.selectedNetwork = "ETHEREUM";
    this.selectedNetwork = this.currentChain.NETWORK_DISPLAY_NAME.toUpperCase(); // sets network to current chain
    if (this.$route.query.token_sym !== undefined)
      this.selectedTokenSym = this.$route.query.token_sym;
    this.reloadWallet(this.accountName);
    this.setTPortTokens();
  },
  watch: {
    async accountName() {
      this.reloadWallet(this.accountName);
    }
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

.bridge-btn {
  background-color: silver;
  color: $secondary;
  width: 120px;
  align-items: center;
  margin: 5px 10px;
  @media only screen and (max-width: 375px) {
    width: 100px;
  }
  &.selected {
    background-color: $space;
  }
}
</style>
