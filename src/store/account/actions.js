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
      // dispatch("getAccountProfile"); // this is TELOS only
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
    this.$router.go();
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
    console.log('aggenee')
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
    base_tokens_raw = await dispatch("pools/getBaseTokens", true, {
      root: true
    });
    for (const asset of base_tokens_raw) {
      let token_reformat = {
        sym: this.$getSymFromAsset(asset.token_info),
        decimals: this.$getDecimalFromAsset(asset.token_info),
        contract: asset.token_info.contract
      };
      commit("setWalletToken", {
        token_sym: token_reformat.sym,
        token_contract: token_reformat.contract
      });
      commit("setWalletTokenDecimals", {
        token_sym: token_reformat.sym,
        amount: token_reformat.decimals
      });
      commit("setWalletTokenAvatar", {
        token_sym: token_reformat.sym,
        avatar: asset.avatar
      });
    }
  } catch (error) {
    commit("general/setErrorMsg", error.message || error, { root: true });
  }
};

export const setWalletPoolTokens = async function(
  { commit, dispatch, rootGetters },
  account
) {
  try {
    if (account != null) {
      // Get tokens on platform
      let pooltokens = await dispatch("pools/getPoolTokens", "", {
        root: true
      });
      const getDecimalFromAsset = this.$getDecimalFromAsset;
      const getSymFromAsset = this.$getSymFromAsset;
      const chainToDecimals = this.$chainToDecimals;
      const chainToQty = this.$chainToQty;
      // console.log(pooltokens);
      for (const pooltoken of pooltokens) {
        (async function() {
          // Get decimal, symbol, contract, avatar
          let decimal = getDecimalFromAsset(pooltoken.token_info);
          let sym = getSymFromAsset(pooltoken.token_info);
          let contract = pooltoken.token_info.contract;
          let avatar = pooltoken.avatar;

          // get balance
          let balance = chainToQty(
            await dispatch(
              "pools/getBalanceFromChain",
              {
                accountName: account,
                address: contract,
                sym: sym
              },
              { root: true }
            )
          );

          // if has balance, update store
          // Update wallet store
          if (balance > 0) {
            commit("setWalletToken", {
              token_sym: sym,
              token_contract: contract
            });
            commit("setWalletTokenDecimals", {
              token_sym: sym,
              amount: decimal
            });
            commit("setWalletTokenAvatar", {
              token_sym: sym,
              avatar: avatar
            });
            commit("setWalletTokenBalance", {
              token_sym: sym,
              amount: balance
            });
          }
        })();
      }
    }
  } catch (error) {
    commit("general/setErrorMsg", error.message || error, { root: true });
  }
};

// set balances in state of each token in wallet
export const setWalletBalances = async function(
  { commit, getters, dispatch },
  account
) {
  try {
    const wallet = getters.wallet;

    for (const token_info of wallet) {
      let payload = {
        address: token_info.token_contract,
        sym: token_info.token_sym,
        accountName: account
      };
      // console.log(payload)

      let token_str = await dispatch("pools/getBalanceFromChain", payload, {
        root: true
      });
      // console.log(token_str)
      let balance = this.$chainToQty(token_str);
      // console.log(balance)
      commit("setWalletTokenBalance", {
        token_sym: token_info.token_sym,
        amount: balance
      });
      commit("setWalletTokenDecimals", {
        token_sym: token_info.token_sym,
        amount: this.$chainToDecimals(token_str)
      });
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
      limit: 10000,
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
      commit("setWalletTokenDecimals", {
        token_sym: token_sym,
        amount: this.$chainToDecimals(token_info.balance)
      });
    }
  } catch (error) {
    commit("general/setErrorMsg", error.message || error, { root: true });
  }
};

// get contract wallet table info for user
export const getChainStakeWallet = async function(
  { commit, dispatch },
  account
) {
  try {
    // get base tokens
    let baseTokens = [];
    baseTokens = await dispatch("pools/getBaseTokens", true, { root: true });

    // get accounts table
    const accountsResult = await this.$api.getTableRows({
      code: process.env.STAKE_ADDRESS, // Contract that we target
      scope: process.env.STAKE_ADDRESS, // Account that owns the data
      table: "accounts", // Table name
      limit: 1,
      lower_bound: account,
      upper_bound: account,
      reverse: false,
      show_payer: false
    });
    const stakeAccount = accountsResult.rows[0];
    let account_stake_balance = this.$chainToQty(stakeAccount.stake_balance);

    // console.log({ stakeAccount: stakeAccount });

    // get rewards table (only claimable rewards)
    const rewardsResult = await this.$api.getTableRows({
      code: process.env.STAKE_ADDRESS, // Contract that we target
      scope: process.env.STAKE_ADDRESS, // Account that owns the data
      table: "rewards", // Table name
      limit: 10000,
      // lower_bound: 1,
      lower_bound: stakeAccount.last_claim_id + 1,
      reverse: false,
      show_payer: false
    });
    // console.log({ rewardsResult: rewardsResult });

    // get wallets table
    const walletsResult = await this.$api.getTableRows({
      code: process.env.STAKE_ADDRESS, // Contract that we target
      scope: account, // Account that owns the data
      table: "wallets", // Table name
      limit: 10000,
      reverse: false, // Optional: Get reversed data
      show_payer: false // Optional: Show ram payer
    });
    // console.log({ walletsResult: walletsResult });

    // compile stake wallet
    let stakeWallet = [];
    for (const baseToken of baseTokens) {
      let token = {
        sym: this.$getSymFromAsset(baseToken.token_info),
        decimals: this.$getDecimalFromAsset(baseToken.token_info),
        contract: baseToken.token_info.contract,
        avatar: baseToken.avatar,
        balance: 0,
        lifetime_return: 0
      };
      for (const reward of rewardsResult.rows) {
        if (
          baseToken.token_info.contract === reward.total_distribution.contract
        ) {
          let stake_remaining = this.$chainToQty(reward.stake_remaining);
          let share_remaining = this.$chainToQty(reward.share_remaining);
          token.balance +=
            share_remaining * (account_stake_balance / stake_remaining);
        }
      }
      for (const walletToken of walletsResult.rows) {
        if (baseToken.token_info.contract === walletToken.contract) {
          token.balance += this.$chainToQty(walletToken.balance);
          token.lifetime_return +=
            this.$chainToQty(walletToken.lifetime_return) - token.balance;
        }
      }
      if (token.balance > 0 || token.lifetime_return > 0)
        stakeWallet.push(token);
    }

    // console.log({ stakeWallet: stakeWallet });
    commit("setStakeWallet", { stake_wallet: stakeWallet });
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
        limit: 1000,
        index_position: 1,
        key_type: "i64",
        lower_bound: account,
        upper_bound: account,
        reverse: false, // Optional: Get reversed data
        show_payer: false // Optional: Show ram payer
      });

      // console.log(stakeBalanceTbl);
      const staked_START = this.$chainToQty(stakeBalanceTbl.rows[0].staked);
      const liquid_START = this.$chainToQty(stakeBalanceTbl.rows[0].liquid);
      const unstaking_START = this.$chainToQty(
        stakeBalanceTbl.rows[0].unstaking
      );

      commit("setWalletTokenLiquid", {
        token_sym: "START",
        amount: liquid_START
      });
      commit("setWalletTokenStaked", {
        token_sym: "START",
        amount: staked_START
      });
      commit("setWalletTokenUnstaking", {
        token_sym: "START",
        amount: unstaking_START
      });
      commit("setWalletStakeMaturities", {
        arr: stakeBalanceTbl.rows[0].stake_maturities
      });

      //set balance
      let payload = {
        address: "token.start",
        sym: "START",
        accountName: account
      };

      let token_str = await dispatch("pools/getBalanceFromChain", payload, {
        root: true
      });
      let balance = this.$chainToQty(token_str);
      commit("setWalletTokenBalance", {
        token_sym: "START",
        amount: balance
      });
    }
  } catch (error) {
    commit("general/setErrorMsg", error.message || error, { root: true });
  }
};

// reset wallet
export const resetWallet = async function({ commit, getters, dispatch }) {
  commit("resetWalletState");
};

// reset liquid
export const resetLiquid = async function({ commit, getters, dispatch }) {
  commit("clearLiquid");
};
