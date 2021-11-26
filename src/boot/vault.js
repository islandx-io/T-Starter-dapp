export default async ({ Vue }) => {
  Vue.prototype.$vaultAbi = [
    {
      inputs: [
        {
          internalType: "address",
          name: "_weth",
          type: "address"
        },
        {
          internalType: "address[]",
          name: "_tokensToSupport",
          type: "address[]"
        }
      ],
      stateMutability: "nonpayable",
      type: "constructor"
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "uint64",
          name: "id",
          type: "uint64"
        },
        {
          indexed: false,
          internalType: "address",
          name: "toAddress",
          type: "address"
        },
        {
          indexed: false,
          internalType: "address",
          name: "tokenAddress",
          type: "address"
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "amount",
          type: "uint256"
        }
      ],
      name: "Claimed",
      type: "event"
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "address",
          name: "_tokenAddress",
          type: "address"
        },
        {
          indexed: false,
          internalType: "address",
          name: "_tokenSender",
          type: "address"
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "_tokenAmount",
          type: "uint256"
        },
        {
          indexed: false,
          internalType: "string",
          name: "_destinationAddress",
          type: "string"
        },
        {
          indexed: false,
          internalType: "string",
          name: "_tokenSymbol",
          type: "string"
        },
        {
          indexed: false,
          internalType: "uint8",
          name: "_tokenDecimals",
          type: "uint8"
        },
        {
          indexed: false,
          internalType: "uint64",
          name: "_poolID",
          type: "uint64"
        },
        {
          indexed: false,
          internalType: "uint8",
          name: "_fromChainID",
          type: "uint8"
        },
        {
          indexed: false,
          internalType: "uint8",
          name: "_toChainID",
          type: "uint8"
        },
        {
          indexed: false,
          internalType: "bytes",
          name: "_userData",
          type: "bytes"
        }
      ],
      name: "JoinPool",
      type: "event"
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "_from",
          type: "address"
        },
        {
          indexed: true,
          internalType: "address",
          name: "_token",
          type: "address"
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "amount",
          type: "uint256"
        }
      ],
      name: "LogWithdrawToken",
      type: "event"
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "_from",
          type: "address"
        },
        {
          indexed: true,
          internalType: "address",
          name: "_to",
          type: "address"
        }
      ],
      name: "OwnershipTransferred",
      type: "event"
    },
    {
      inputs: [],
      name: "PNETWORK",
      outputs: [
        {
          internalType: "address",
          name: "",
          type: "address"
        }
      ],
      stateMutability: "view",
      type: "function",
      constant: true
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "asset",
          type: "address"
        }
      ],
      name: "adminWithdraw",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "uint64",
          name: "",
          type: "uint64"
        }
      ],
      name: "claimed",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool"
        }
      ],
      stateMutability: "view",
      type: "function",
      constant: true
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "",
          type: "address"
        }
      ],
      name: "oracles",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool"
        }
      ],
      stateMutability: "view",
      type: "function",
      constant: true
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256"
        }
      ],
      name: "oraclesArr",
      outputs: [
        {
          internalType: "address",
          name: "",
          type: "address"
        }
      ],
      stateMutability: "view",
      type: "function",
      constant: true
    },
    {
      inputs: [],
      name: "owner",
      outputs: [
        {
          internalType: "address",
          name: "",
          type: "address"
        }
      ],
      stateMutability: "view",
      type: "function",
      constant: true
    },
    {
      inputs: [
        {
          internalType: "bytes32",
          name: "message",
          type: "bytes32"
        },
        {
          internalType: "bytes",
          name: "sig",
          type: "bytes"
        }
      ],
      name: "recoverSigner",
      outputs: [
        {
          internalType: "address",
          name: "",
          type: "address"
        }
      ],
      stateMutability: "pure",
      type: "function",
      constant: true
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "_newOracle",
          type: "address"
        }
      ],
      name: "regOracle",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "bytes",
          name: "sig",
          type: "bytes"
        }
      ],
      name: "splitSignature",
      outputs: [
        {
          internalType: "uint8",
          name: "",
          type: "uint8"
        },
        {
          internalType: "bytes32",
          name: "",
          type: "bytes32"
        },
        {
          internalType: "bytes32",
          name: "",
          type: "bytes32"
        }
      ],
      stateMutability: "pure",
      type: "function",
      constant: true
    },
    {
      inputs: [
        {
          internalType: "string",
          name: "source",
          type: "string"
        }
      ],
      name: "stringToBytes32",
      outputs: [
        {
          internalType: "bytes32",
          name: "result",
          type: "bytes32"
        }
      ],
      stateMutability: "pure",
      type: "function",
      constant: true
    },
    {
      inputs: [],
      name: "thisChainId",
      outputs: [
        {
          internalType: "uint8",
          name: "",
          type: "uint8"
        }
      ],
      stateMutability: "view",
      type: "function",
      constant: true
    },
    {
      inputs: [],
      name: "threshold",
      outputs: [
        {
          internalType: "uint8",
          name: "",
          type: "uint8"
        }
      ],
      stateMutability: "view",
      type: "function",
      constant: true
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "_remOracle",
          type: "address"
        }
      ],
      name: "unregOracle",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "uint8",
          name: "newChainId",
          type: "uint8"
        }
      ],
      name: "updateChainId",
      outputs: [
        {
          internalType: "bool",
          name: "success",
          type: "bool"
        }
      ],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "uint8",
          name: "newThreshold",
          type: "uint8"
        }
      ],
      name: "updateThreshold",
      outputs: [
        {
          internalType: "bool",
          name: "success",
          type: "bool"
        }
      ],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [],
      name: "weth",
      outputs: [
        {
          internalType: "contract IWETH",
          name: "",
          type: "address"
        }
      ],
      stateMutability: "view",
      type: "function",
      constant: true
    },
    {
      stateMutability: "payable",
      type: "receive",
      payable: true
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "_weth",
          type: "address"
        }
      ],
      name: "setWeth",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "_pnetwork",
          type: "address"
        }
      ],
      name: "setPNetwork",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "_token",
          type: "address"
        }
      ],
      name: "IS_TOKEN_SUPPORTED",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool"
        }
      ],
      stateMutability: "view",
      type: "function",
      constant: true
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "_tokenAddress",
          type: "address"
        }
      ],
      name: "addSupportedToken",
      outputs: [
        {
          internalType: "bool",
          name: "SUCCESS",
          type: "bool"
        }
      ],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "_tokenAddress",
          type: "address"
        }
      ],
      name: "removeSupportedToken",
      outputs: [
        {
          internalType: "bool",
          name: "SUCCESS",
          type: "bool"
        }
      ],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [],
      name: "getSupportedTokens",
      outputs: [
        {
          internalType: "address[]",
          name: "res",
          type: "address[]"
        }
      ],
      stateMutability: "view",
      type: "function",
      constant: true
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "_tokenAmount",
          type: "uint256"
        },
        {
          internalType: "address",
          name: "_tokenAddress",
          type: "address"
        },
        {
          internalType: "string",
          name: "_destinationAddress",
          type: "string"
        },
        {
          internalType: "uint64",
          name: "_poolID",
          type: "uint64"
        },
        {
          internalType: "uint8",
          name: "_toChainID",
          type: "uint8"
        },
        {
          internalType: "bytes",
          name: "_userData",
          type: "bytes"
        }
      ],
      name: "pegIn",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool"
        }
      ],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "_tokenAmount",
          type: "uint256"
        },
        {
          internalType: "address",
          name: "_tokenAddress",
          type: "address"
        },
        {
          internalType: "string",
          name: "_destinationAddress",
          type: "string"
        },
        {
          internalType: "uint64",
          name: "_poolID",
          type: "uint64"
        },
        {
          internalType: "uint8",
          name: "_toChainID",
          type: "uint8"
        }
      ],
      name: "pegIn",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool"
        }
      ],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "",
          type: "address"
        },
        {
          internalType: "address",
          name: "from",
          type: "address"
        },
        {
          internalType: "address",
          name: "to",
          type: "address"
        },
        {
          internalType: "uint256",
          name: "amount",
          type: "uint256"
        },
        {
          internalType: "bytes",
          name: "userData",
          type: "bytes"
        },
        {
          internalType: "bytes",
          name: "",
          type: "bytes"
        }
      ],
      name: "tokensReceived",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "string",
          name: "_destinationAddress",
          type: "string"
        },
        {
          internalType: "uint64",
          name: "_poolID",
          type: "uint64"
        },
        {
          internalType: "uint8",
          name: "_toChainID",
          type: "uint8"
        }
      ],
      name: "pegInEth",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool"
        }
      ],
      stateMutability: "payable",
      type: "function",
      payable: true
    },
    {
      inputs: [
        {
          internalType: "string",
          name: "_destinationAddress",
          type: "string"
        },
        {
          internalType: "uint64",
          name: "_poolID",
          type: "uint64"
        },
        {
          internalType: "uint8",
          name: "_toChainID",
          type: "uint8"
        },
        {
          internalType: "bytes",
          name: "_userData",
          type: "bytes"
        }
      ],
      name: "pegInEth",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool"
        }
      ],
      stateMutability: "payable",
      type: "function",
      payable: true
    },
    {
      inputs: [
        {
          internalType: "address payable",
          name: "_tokenRecipient",
          type: "address"
        },
        {
          internalType: "address",
          name: "_tokenAddress",
          type: "address"
        },
        {
          internalType: "uint256",
          name: "_tokenAmount",
          type: "uint256"
        },
        {
          internalType: "bytes",
          name: "_userData",
          type: "bytes"
        }
      ],
      name: "pegOut",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool"
        }
      ],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "address payable",
          name: "_tokenRecipient",
          type: "address"
        },
        {
          internalType: "address",
          name: "_tokenAddress",
          type: "address"
        },
        {
          internalType: "uint256",
          name: "_tokenAmount",
          type: "uint256"
        }
      ],
      name: "pegOut",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool"
        }
      ],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "address payable",
          name: "_to",
          type: "address"
        }
      ],
      name: "migrate",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [],
      name: "destroy",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "address payable",
          name: "_to",
          type: "address"
        },
        {
          internalType: "address",
          name: "_tokenAddress",
          type: "address"
        }
      ],
      name: "migrateSingle",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "bytes",
          name: "sigData",
          type: "bytes"
        },
        {
          internalType: "bytes[]",
          name: "signatures",
          type: "bytes[]"
        }
      ],
      name: "claim",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool"
        }
      ],
      stateMutability: "nonpayable",
      type: "function"
    }
  ];
};
