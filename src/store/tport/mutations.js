export function setAccountName(state, payload) {
  state.accountName = payload.accountName;
}

export function setRemoteId(state, { remoteId }) {
  state.remoteId = remoteId;
}

export function setChainId(state, payload) {
  let chainId = `${payload.chainId}`;
  if (chainId.substr(0, 2) === "0x") {
    chainId = parseInt(chainId.substr(2), 16);
  } else chainId = parseInt(chainId);
  state.chainId = chainId;
}

export function updateTPortTokens(state, { tokens }) {
  state.tportTokens = tokens;
}

export function updateTeleports(state, { teleports }) {
  state.teleports = teleports;
}
