export const setLoadingWallet = (state, wallet) => {
  state.loading = wallet;
};

export const setAccountName = (state, accountName) => {
  state.accountName = accountName;
};

export const setAutoLogin = (state, status) => {
  state.autoLogin = status;
};

export const setProfile = (state, profile = undefined) => {
  if (!profile) {
    return;
  }
  state.profiles[profile.account_name] = profile;
};

export const setWalletToken = (state, {token_sym, token_contract}) => {
  let walletObj = {
    token_sym: token_sym,
    token_contract: token_contract,
    balance: 0,
    liquid: 0,
    locked: 0
  }
  // if token in store update, else push
  if (state.wallet.map(a => a.token_sym).includes(token_sym)) {
    state.wallet[state.wallet.findIndex(a => a.token_sym === token_sym)] = walletObj;
    // console.log(poolTable);
  } else {
    state.wallet.push(walletObj);
    // console.log(poolTable);
  }
};

export const setWalletTokenBalance = (state, {token_sym, amount}) => {
  let token = state.wallet.find(a => a.token_sym === token_sym);
  token.balance = amount;
}

export const setWalletTokenLiquid = (state, {token_sym, amount}) => {
  let token = state.wallet.find(a => a.token_sym === token_sym);
  token.liquid = amount;
}

export const setWalletTokenLocked = (state, {token_sym, amount}) => {
  let token = state.wallet.find(a => a.token_sym === token_sym);
  token.locked = amount;
}