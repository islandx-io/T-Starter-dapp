export const getChainData = async function({ commit }, id) {
  try {
    const tableResults = await this.$api.getTableRows({
      code: "btc.ptokens", // Contract that we target
      scope: "btc.ptokens", // Account that owns the data
      table: "accounts", // Table name
      // lower_bound: id, // Table primary key value
      limit: 10, // Maximum number of rows that we want to get
      reverse: false, // Optional: Get reversed data
      show_payer: false // Optional: Show ram payer
    });
    console.log(tableResults);

    //   const profile = tableResults.rows[0];
    // commit("setProfile", profile);
  } catch (error) {
    commit("general/setErrorMsg", error.message || error, { root: true });
  }
};

// Test function for reading address
export const getCurrency = async function({ commit }, address) {
  try {
    const rpc = this.$api.getRpc();
    console.log(await rpc.get_account(address));
    console.log(await rpc.get_currency_balance(address, "fuzzytestnet"));
  } catch (error) {
    commit("general/setErrorMsg", error.message || error, { root: true });
  }
};
