export function setAccountName(state, payload) {
  state.accountName = payload.accountName;
}

export function setChainId(state, payload) {
  let chainId = `${payload.chainId}`;
  if (chainId.substr(0, 2) === "0x") {
    chainId = parseInt(chainId.substr(2), 16);
  }
  state.chainId = chainId;
}

export function updateTPortTokens(state, { tokens }) {
  state.tportTokens = tokens;
}
