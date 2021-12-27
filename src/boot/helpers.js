import { date } from "quasar";

const chainToQty = function (str, decimals = -1) {
  try {
    let qty = str.split(" ")[0];
    qty = parseFloat(qty);
    if (decimals > -1) qty = qty.toFixed(decimals);
    return qty;
  } catch (error) {
    return str;
  }
};

// Gets amount of decimal from chain string e.g. 4 from "0.0000 TLOS"
const chainToDecimals = function (str) {
  if (str.length > 0) {
    let commaidx = str.indexOf(".") + 1;
    let spaceidx = str.indexOf(" ");
    const precision = str.slice(commaidx, spaceidx).length;
    return precision;
  } else return 0;
};

// Gets symbol from chain string e.g. TLOS from "0.0000 TLOS"
const chainToSym = function (str) {
  try {
    return str.split(" ")[1];
  } catch (error) {
    return str;
  }
};

const chainStrReformat = function (str, decimals = -1) {
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

// Takes value to Telos asset format of "5.000 TLOS"
const toChainString = function (number, decimals, symbol) {
  return String(parseFloat(number).toFixed(decimals)) + String(" " + symbol);
};

// Formats utc date to local time
const toDate = function (timeStamp) {
  if (timeStamp === "Loading") return timeStamp;
  else return date.formatDate(timeStamp, "DD MMMM YYYY @ HH:mm (UTC Z)");
};

// Gets decimal from base token asset { "sym": "4,START", "contract": "token.start" }
const getDecimalFromAsset = function (asset) {
  let idx = asset.sym.indexOf(",");
  let decimal = asset.sym.slice(0, idx);
  return decimal;
};

// Gets symbol from base token asset { "sym": "4,START", "contract": "token.start" }
const getSymFromAsset = function (asset) {
  let idx = asset.sym.indexOf(",") + 1;
  let sym = asset.sym.slice(idx);
  return sym;
};

const toFixedDown = function (num, decimals) {
  var re = new RegExp("(\\d+\\.\\d{" + decimals + "})(\\d)"),
    m = num.toString().match(re);
  return m ? parseFloat(m[1]) : num.valueOf();
  // Or just Math.floor(num * 10**decimals) / 10**decimals
};

const startBalanceToLiquidAction = function (START_info, amount) {
  return {
    account: this.START_info.token_contract,
    name: "transfer",
    data: {
      from: this.accountName,
      to: process.env.CONTRACT_ADDRESS,
      quantity: this.$toChainString(
        amount,
        this.START_info.decimals,
        this.START_info.sym
      ),
      memo: `Send ${this.START_info.sym} to liquid`,
    },
  };
};

const errorNotification = function (error) {
  let errorMessage = "";
  if (error.message) {
    errorMessage = error.message;
  } else {
    errorMessage = error;
  }
  this.$q.notify({
    color: "red-5",
    textColor: "white",
    icon: "warning",
    message: `${errorMessage}`,
  });
};

const formatTableDecimals = function (col, props) {
  if (col.value === "") {
    return "";
  } else {
    if (col.value === undefined) {
      return "";
    } else {
      return col.value.toFixed(props.row.decimals);
    }
  }
};

export default ({ Vue, store }) => {
  Vue.prototype.$chainToQty = chainToQty;
  Vue.prototype.$toChainString = toChainString;
  Vue.prototype.$chainToSym = chainToSym;
  Vue.prototype.$chainStrReformat = chainStrReformat;
  Vue.prototype.$toDate = toDate;
  Vue.prototype.$getDecimalFromAsset = getDecimalFromAsset;
  Vue.prototype.$getSymFromAsset = getSymFromAsset;
  Vue.prototype.$chainToDecimals = chainToDecimals;
  Vue.prototype.$toFixedDown = toFixedDown;
  Vue.prototype.$startBalanceToLiquidAction = startBalanceToLiquidAction;
  Vue.prototype.$errorNotification = errorNotification;
  Vue.prototype.$formatTableDecimals = formatTableDecimals;
  store["$chainToQty"] = chainToQty;
  store["$chainToSym"] = chainToSym;
  store["$toChainString"] = toChainString;
  store["$getDecimalFromAsset"] = getDecimalFromAsset;
  store["$getSymFromAsset"] = getSymFromAsset;
  store["$chainToDecimals"] = chainToDecimals;
  store["$errorNotification"] = errorNotification;
};
