// Get pool info from chain by id, put into store
export const getChainPoolByID = async function({ commit }, id) {
  try {
    const tableResults = await this.$api.getTableRows({
      code: process.env.CONTRACT_ADDRESS, // Contract that we target
      scope: process.env.CONTRACT_ADDRESS, // Account that owns the data
      table: process.env.CONTRACT_TABLE, // Table name
      lower_bound: id, // Table primary key value
      limit: 1, // Maximum number of rows that we want to get
      reverse: false, // Optional: Get reversed data
      show_payer: false // Optional: Show ram payer
    });
    console.log(tableResults);

    const poolTable = tableResults.rows[tableResults.rows.length - 1];

    //check dates are unix
    poolTable.pool_open = new Date(poolTable.pool_open).valueOf();
    poolTable.private_end = new Date(poolTable.private_end).valueOf();
    poolTable.public_end = new Date(poolTable.public_end).valueOf();

    commit("updatePoolOnState", { poolTable, id });
  } catch (error) {
    commit("general/setErrorMsg", error.message || error, { root: true });
  }
};

// get all pools from chain, populate store
export const getAllChainPools = async function({ commit }) {
  try {
    const tableResults = await this.$api.getTableRows({
      code: process.env.CONTRACT_ADDRESS, // Contract that we target
      scope: process.env.CONTRACT_ADDRESS, // Account that owns the data
      table: process.env.CONTRACT_TABLE, // Table name
      limit: 10, // Maximum number of rows that we want to get
      reverse: false, // Optional: Get reversed data
      show_payer: false // Optional: Show ram payer
    });

    tableResults.rows.forEach((pool, index) => {
      console.log(pool);
      let id = pool.id;

      //check dates are unix
      pool.pool_open = new Date(pool.pool_open).valueOf();
      pool.private_end = new Date(pool.private_end).valueOf();
      pool.public_end = new Date(pool.public_end).valueOf();

      const poolTable = pool;

      commit("updatePoolOnState", { poolTable, id });
    });
  } catch (error) {
    commit("general/setErrorMsg", error.message || error, { root: true });
  }
};

// Test function for reading address
export const getCurrency = async function({ commit }, payload) {
  const rpc = this.$api.getRpc();
  // console.log(await rpc.get_account(address));
  // console.log(await rpc.get_currency_balance(address, "fuzzytestnet"));
};

// gets the precision of Token
export const getTokenPrecision = async function(
  { commit, getters },
  token_info
) {
  try {
    const rpc = this.$api.getRpc();

    const tableResults = await this.$api.getTableRows({
      code: token_info.address, // Contract that we target
      scope: token_info.token_symbol, // Account that owns the data
      table: "stat", // Table name
      limit: 10, // Maximum number of rows that we want to get
      reverse: false, // Optional: Get reversed data
      show_payer: false // Optional: Show ram payer
    });

    console.log(tableResults.rows[tableResults.rows.length - 1]);
    let supply = tableResults.rows[tableResults.rows.length - 1];
    // console.log(supply.max_supply);
    let commaidx = supply.max_supply.indexOf(".") + 1;
    let spaceidx = supply.max_supply.indexOf(" ");
    const precision = supply.max_supply.slice(commaidx, spaceidx).length;
    // console.log(precision);
    return precision;
  } catch (error) {
    commit("general/setErrorMsg", error.message || error, { root: true });
  }
};

export const updatePoolStatus = async function({ commit, getters }, poolID) {
  const pool = getters.getPoolByID(poolID);
  // console.log({ pool: pool });
  var poolStatus = "loading";
  const currentDate = Date.now();
  if (currentDate < pool.pool_open) {
    poolStatus = "upcoming";
  } else if (currentDate > pool.public_end) {
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


export const createPoolOnChain = async function({ commit, getters }, poolObject) {
  
};
