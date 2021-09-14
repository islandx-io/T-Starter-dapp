export function getEvmAccountName(state) {
  return state.accountName;
}

export function getEvmChainId(state) {
  return state.chainId;
}

export function getEvmNetworkList(state) {
  return state.networkList;
}

export const getTPortTokensBySym = ({ tportTokens }) => sym => {
  return tportTokens.find(el => el.token.sym === sym);
};
