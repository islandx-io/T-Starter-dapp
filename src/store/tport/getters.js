export function getEVMAccountName(state) {
  return state.accountName;
}

export function getEVMChainId(state) {
  return state.chainId;
}

export function getEVMNetworkList(state) {
  return state.networkList;
}

export const getTPortTokensBySym = ({ tportTokens }) => sym => {
  return tportTokens.find(el => el.token.sym === sym);
};
