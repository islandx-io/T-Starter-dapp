export const getChainData = async function({ commit }, id) {
  try {
    const tableResults = await this.$api.getTableRows({
      code: "pools.start", // Contract that we target
      scope: "pools.start", // Account that owns the data
      table: "pools.index", // Table name
      lower_bound: id, // Table primary key value
      limit: 1, // Maximum number of rows that we want to get
      reverse: false, // Optional: Get reversed data
      show_payer: false // Optional: Show ram payer
    });
    console.log(tableResults);

    const poolTable = tableResults.rows[tableResults.rows.length -1];
    commit("updatePoolOnState", {poolTable, id});
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
export const updatePoolStatus = async function({ commit, getters }, poolID) {
  const pool = getters.getPoolByID(poolID);
  // console.log({ pool: pool });
  var poolStatus = "loading";
  const currentDate = Date.now();
  if (currentDate < pool.start_date) {
    poolStatus = "upcoming";
  } else if (currentDate > pool.end_public_date) {
    poolStatus = "closed";
  } else {
    poolStatus = "open";
  }
  commit({
    type: "setPoolStatus",
    id: poolID,
    status: poolStatus
  });
};
