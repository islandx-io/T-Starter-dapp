import Vue from "vue";
import Vuex from "vuex";

import account from "./account";
import general from "./general";
import pools from "./pools";
import blockchains from "./blockchains";
import ballots from "./ballots";
import tport from "./tport";
import xchain from "./xchain";

Vue.use(Vuex);

export default function() {
  const Store = new Vuex.Store({
    modules: {
      general,
      account,
      pools,
      blockchains,
      ballots,
      tport,
      xchain
    },

    strict: process.env.DEV
  });

  return Store;
}
