export function getEvmAccountName(state) {
  return state.accountName;
}

export function getEvmNetwork(state) {
  return state.networkList.find(el => el.chainId === state.chainId);
}

export function getEvmChainId(state) {
  return state.chainId;
}

export function getEvmRemoteId(state) {
  return state.networkList.find(el => el.chainId === state.chainId).remoteId;
}

export function getEvmNetworkList(state) {
  return state.networkList;
}

export function getTeleports(state) {
  return state.teleports;
}

export const getTPortTokensBySym = ({ tportTokens }) => sym => {
  return tportTokens.find(el => el.token.sym === sym);
};

export const getEvmNetworkByName = ({ networkList }) => name => {
  return networkList.find(el => el.name.toUpperCase() === name.toUpperCase());
};
