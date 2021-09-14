export default {
  accountName: null,
  chainId: null,
  tportTokens: [],
  networkList: [
    {
      name: "Ethereum", // Ropsten
      isTestNet: true,
      remoteId: 1,
      chainId: 3
    },
    {
      name: "BSC",
      isTestNet: true,
      remoteId: 2,
      chainName: "Binance Smart Chain Testnet",
      chainId: 97,
      rpcUrls: ["https://data-seed-prebsc-1-s1.binance.org:8545"],
      nativeCurrency: {
        name: "BINANCE COIN",
        symbol: "tBNB",
        decimals: 18
      },
      blockExplorerUrls: ["https://testnet.bscscan.com"]
    },
    {
      name: "Telos EVM",
      isTestNet: true,
      remoteId: 3,
      chainId: 41
    },
    {
      name: "Matic Testnet",
      isTestNet: true,
      remoteId: 4,
      chainId: 8001
    }
  ]
};
