export default function() {
  return {
    accountName: null,
    hasProfile: false,
    profiles: {},
    autoLogin: false,
    loading: {},
    wallet: [
      {
        token_sym: "START",
        token_contract: "token.start",
        balance: 0,
        liquid: 0,
        locked: 0,
        decimals: 0,
        avatar: "",
        stake_maturities: [],
      },
    ]
  };
}
