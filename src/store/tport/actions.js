// Get evm bridge tokens from tokens table of tport.start
export const setTPortTokens = async function({ commit, getters }) {
  try {
    let tokens = [];
    const tableResults = await this.$api.getTableRows({
      code: process.env.TPORT_ADDRESS,
      scope: process.env.TPORT_ADDRESS,
      table: "tokens",
      limit: 10000,
      reverse: false,
      show_payer: false
    });
    for (let asset of tableResults.rows) {
      // console.log("Asset: ", asset);
      asset.token = {
        sym: this.$getSymFromAsset(asset.token),
        decimals: this.$getDecimalFromAsset(asset.token),
        contract: asset.token.contract
      };
      tokens.push(asset);
    }
    // console.log("TPort Tokens:", tokens);
    commit("updateTPortTokens", { tokens });
  } catch (error) {
    commit("general/setErrorMsg", error.message || error, { root: true });
  }
};
