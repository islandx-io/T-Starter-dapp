<script>
export default {
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
  }
};
</script>
