import { date } from "quasar";

const fromChainString = function(str) {
  let idx = str.indexOf(" ");
  return Number(str.slice(0, idx));
};

const toChainString = function(number, decimals, symbol) {
  return String(parseFloat(number).toFixed(decimals)) + String(" " + symbol);
};

const toDate = function(timeStamp) {
  if (timeStamp === "Loading") return timeStamp;
  else return date.formatDate(timeStamp, "DD MMMM YYYY, HH:mm UTC");
};

export default ({ Vue, store }) => {
  Vue.prototype.$fromChainString = fromChainString;
  Vue.prototype.$toChainString = toChainString;
  Vue.prototype.$toDate = toDate;
  store["$fromChainString"] = fromChainString;
  store["$toChainString"] = toChainString;
};
