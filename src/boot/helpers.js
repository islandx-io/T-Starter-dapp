import { date } from "quasar";

const chainToQty = function(str, decimals = -1) {
  try {
    let qty = str.split(" ")[0];
    qty = parseFloat(qty);
    if (decimals > -1) qty = qty.toFixed(decimals);
    return qty;
  } catch (error) {
    return str;
  }
};

const chainToSym = function(str) {
  try {
    return str.split(" ")[1];
  } catch (error) {
    return str;
  }
};

const chainStrReformat = function(str, decimals = -1) {
  try {
    if (!str.includes(" ")) return str;
    else {
      let [qty, sym] = str.split(" ");
      qty = parseFloat(qty);
      if (decimals > -1) qty = qty.toFixed(decimals);
      return `${qty} ${sym}`;
    }
  } catch (error) {
    return str;
  }
};

const toChainString = function(number, decimals, symbol) {
  return String(parseFloat(number).toFixed(decimals)) + String(" " + symbol);
};

const toDate = function(timeStamp) {
  if (timeStamp === "Loading") return timeStamp;
  else return date.formatDate(timeStamp, "DD MMMM YYYY, HH:mm");
};

// Gets decimal from base token asset
const getDecimalFromAsset = function(asset) {
  let idx = asset.sym.indexOf(",");
  let decimal = asset.sym.slice(0, idx);
  return decimal;
};

// Gets symbol from base token asset
const getSymFromAsset = function(asset) {
  let idx = asset.sym.indexOf(",") + 1;
  let sym = asset.sym.slice(idx);
  return sym;
};

export default ({ Vue, store }) => {
  Vue.prototype.$chainToQty = chainToQty;
  Vue.prototype.$toChainString = toChainString;
  Vue.prototype.$chainToSym = chainToSym;
  Vue.prototype.$chainStrReformat = chainStrReformat;
  Vue.prototype.$toDate = toDate;
  Vue.prototype.$getDecimalFromAsset = getDecimalFromAsset;
  Vue.prototype.$getSymFromAsset = getSymFromAsset;
  store["$chainToQty"] = chainToQty;
  store["$toChainString"] = toChainString;
};
