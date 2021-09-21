export default {
  accountName: "",
  chainId: null,
  tportTokens: [],
  teleports: [],
  networkList: [
    {
      name: "Ethereum", // Ropsten
      isTestNet: true,
      remoteId: 1,
      chainName: "Ropsten Test Network",
      chainId: 3,
      rpcUrls: [
        "https://ropsten.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161"
      ],
      nativeCurrency: {
        name: "Ropsten ETH",
        symbol: "ETH",
        decimals: 18
      },
      blockExplorerUrls: ["https://ropsten.etherscan.io"]
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
      chainName: "Telos Testnet",
      chainId: 41,
      rpcUrls: ["https://testnet.telos.net/evm"],
      nativeCurrency: {
        name: "TLOS",
        symbol: "TLOS",
        decimals: 18
      },
      blockExplorerUrls: ["https://testnet.telos.net/v2/explore/evm/"]
    }
  ]
};
