import Vue from 'vue'
import axios from "axios";

const moonpay = axios.create({ baseURL: `https://api.moonpay.com` });

const getUSDofToken = async function(tokenSymbol) {
  try {
    const response = await moonpay.get(`/v3/currencies/eos/ask_price`, {
      params: {
        apiKey: process.env.MOONPAY_KEY
      }
    });
    return response;
  } catch (error) {
    // console.error(error);
    return {}
  }
};

const getTransaction = async function(externalTransactionId) {
    try {
      const response = await moonpay.get(`/v1/transactions/ext/${externalTransactionId}`, {
        params: {
          apiKey: process.env.MOONPAY_KEY
        }
      });
      return response;
    } catch (error) {
      // console.error(error);
      return {}
    }
  };

export default async ({ app, store }) => {
  // for use inside Vue files (Options API) through this.$axios and this.$api
  Vue.prototype.$axios = axios
  Vue.prototype.$moonpay = moonpay
  // ^ ^ ^ this will allow you to use this.$moonpay (for Vue Options API form)
  //       so you can easily perform requests against your app's API

    store["$moonpay"] = {
      getUSDofToken: getUSDofToken.bind(store),
      getTransaction: getTransaction.bind(store)
    };
};

export { moonpay, axios };

