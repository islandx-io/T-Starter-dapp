const fromChainString = function(str) {
  let idx = str.indexOf(" ");
  return Number(str.slice(0, idx));
};

const toChainString = function(number, decimals, symbol) {
  return String(parseFloat(number).toFixed(decimals)) + String(" " + symbol);
};

export default ({ Vue, store }) => {
  Vue.prototype.$fromChainString = fromChainString;
  Vue.prototype.$toChainString = toChainString;
  store["$fromChainString"] = fromChainString;
  store["$toChainString"] = toChainString;
};
