export const login = async function(
  { commit, dispatch },
  { idx, account, returnUrl }
) {
  const authenticator = this.$ual.authenticators[idx];
  try {
    commit("setLoadingWallet", authenticator.getStyle().text);
    await authenticator.init();
    if (!account) {
      const requestAccount = await authenticator.shouldRequestAccountName();
      if (requestAccount) {
        await dispatch("fetchAvailableAccounts", idx);
        commit("setRequestAccount", true);
        return;
      }
    }
    const users = await authenticator.login(account);
    if (users.length) {
      const account = users[0];
      const accountName = await account.getAccountName();
      this.$ualUser = account;
      this.$type = "ual";
      commit("setAccountName", accountName);
      localStorage.setItem("autoLogin", authenticator.constructor.name);
      localStorage.setItem("account", accountName);
      localStorage.setItem("returning", true);
      dispatch("getAccountProfile");
    }
  } catch (e) {
    const error =
      (authenticator.getError() && authenticator.getError().message) ||
      e.message ||
      e.reason;
    commit("general/setErrorMsg", error, { root: true });
    console.log("Login error: ", error);
  } finally {
    commit("setLoadingWallet");
  }
};

export const autoLogin = async function({ dispatch, commit }, returnUrl) {
  const { authenticator, idx } = getAuthenticator(this.$ual);
  if (authenticator) {
    commit("setAutoLogin", true);
    await dispatch("login", {
      idx,
      returnUrl,
      account: localStorage.getItem("account")
    });
    commit("setAutoLogin", false);
  }
};

const getAuthenticator = function(ual, wallet = null) {
  wallet = wallet || localStorage.getItem("autoLogin");
  const idx = ual.authenticators.findIndex(
    auth => auth.constructor.name === wallet
  );
  return {
    authenticator: ual.authenticators[idx],
    idx
  };
};

export const logout = async function({ commit }) {
  const { authenticator } = getAuthenticator(this.$ual);
  try {
    authenticator && (await authenticator.logout());
  } catch (error) {
    console.log("Authenticator logout error", error);
  }
  commit("setProfile", undefined);
  commit("setAccountName");
  localStorage.removeItem("autoLogin");

  if (this.$router.currentRoute.path !== "/") {
    this.$router.push({ path: "/" });
  }
};

export const getUserProfile = async function({ commit }, accountName) {
  try {
    const profileResult = await this.$api.getTableRows({
      code: "profiles",
      scope: "profiles",
      table: "profiles",
      limit: 1,
      index_position: 1,
      key_type: "i64",
      lower_bound: accountName,
      upper_bound: accountName
    });
    // console.log(profileResult);
    const profile = profileResult.rows[0];
    commit("setProfile", profile);
  } catch (error) {
    commit("general/setErrorMsg", error.message || error, { root: true });
  }
};

export const getAccountProfile = async function({ commit, dispatch }) {
  if (!this.state.account.accountName) {
    return;
  }

  dispatch("getUserProfile", this.state.account.accountName);
};

export const accountExists = async function({ commit, dispatch }, accountName) {
  try {
    const account = await this.$api.getAccount(accountName);
    return !!account;
  } catch (e) {
    return false;
  }
};

export const setWalletBaseTokens = async function({ commit, dispatch }) {
  try {
    let base_tokens_raw = [];
    base_tokens_raw = await dispatch("pools/getBaseTokens", "", { root: true });

    for (const asset of base_tokens_raw) {
      let token_reformat = {
        sym: this.$getSymFromAsset(asset),
        decimals: this.$getDecimalFromAsset(asset),
        contract: asset.contract
      };
      commit("setWalletToken", {
        token_sym: token_reformat.sym,
        token_contract: token_reformat.contract
      });
    }
  } catch (error) {
    commit("general/setErrorMsg", error.message || error, { root: true });
  }
};

// set balances in state of each token in wallet
export const setWalletBalances = async function({ commit, getters, dispatch }) {
  try {
    const wallet = getters.wallet;

    for (const token_info of wallet) {
      // console.log(token_info)
    }
  } catch (error) {
    commit("general/setErrorMsg", error.message || error, { root: true });
  }
};

// get contract wallet table info for user
export const getChainWalletTable = async function(
  { commit, getters, dispatch },
  account
) {
  try {
    const tableResults = await this.$api.getTableRows({
      code: process.env.CONTRACT_ADDRESS, // Contract that we target
      scope: account, // Account that owns the data
      table: "wallets", // Table name
      limit: 100,
      reverse: false, // Optional: Get reversed data
      show_payer: false // Optional: Show ram payer
    });

    let contractWalletTbl = tableResults.rows;

    // Set each token on state
    for (const token_info of contractWalletTbl) {
      let token_sym = this.$chainToSym(token_info.balance);
      let token_liquid = this.$chainToQty(token_info.balance);
      let token_contract = token_info.contract;

      commit("setWalletToken", {
        token_sym: token_sym,
        token_contract: token_contract
      });
      commit("setWalletTokenLiquid", {
        token_sym: token_sym,
        amount: token_liquid
      });
    }
  } catch (error) {
    commit("general/setErrorMsg", error.message || error, { root: true });
  }
};

// check if tokens already staked
export const getChainSTART = async function(
  { commit, getters, dispatch },
  account
) {
  try {
    if (account !== null) {
      const stakeBalanceTbl = await this.$api.getTableRows({
        code: process.env.CONTRACT_ADDRESS, // Contract that we target
        scope: process.env.CONTRACT_ADDRESS, // Account that owns the data
        table: "stakebalance", // Table name
        limit: 100,
        index_position: 1,
        key_type: "i64",
        lower_bound: account,
        upper_bound: account,
        reverse: false, // Optional: Get reversed data
        show_payer: false // Optional: Show ram payer
      });

      const staked_START = this.$chainToQty(stakeBalanceTbl.rows[0].staked);
      const liquid_START = this.$chainToQty(stakeBalanceTbl.rows[0].liquid);

      commit("setWalletTokenLiquid", {
        token_sym: 'START',
        amount: liquid_START
      });
      commit("setWalletTokenLocked", {
        token_sym: 'START',
        amount: staked_START
      });
    }
  } catch (error) {
    commit("general/setErrorMsg", error.message || error, { root: true });
  }
};
