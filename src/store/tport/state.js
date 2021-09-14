export default {
  accountName: null,
  chainId: null,
  tportTokens: [],
  networkList: [
    {
      name: "Ethereum", // Ropsten
      chainId: 3,
      remoteId: 1,
      className: "ethereum",
      isTestNet: true
    },
    {
      name: "BSC",
      chainId: 97,
      remoteId: 2,
      className: "binance",
      isTestNet: true
    },
    {
      name: "Telos EVM",
      chainId: 41,
      remoteId: 3,
      className: "telos",
      isTestNet: true
    },
    {
      name: "Matic",
      chainId: 8001,
      remoteId: 4,
      className: "matic",
      isTestNet: true
    }
  ]
};
