export default function() {
  return {
    accountName: null,
    hasProfile: false,
    profiles: {},
    autoLogin: false,
    loading: {},
    wallet: [
      {
        token: "START",
        token_contract: "token.start",
        balance: 0,
        liquid: 0,
        locked: 0
      },
      {
        token: "PETH",
        token_contract: "eth.ptokens",
        balance: 0,
        liquid: 0,
        locked: 0
      }
    ]
  };
}
