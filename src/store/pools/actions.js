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

    const poolTable = tableResults.rows[tableResults.rows.length - 1];
    console.log(poolTable);

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
export const getAllChainPools = async function({ commit, dispatch }) {
  try {
    const tableResults = await this.$api.getTableRows({
      code: process.env.CONTRACT_ADDRESS, // Contract that we target
      scope: process.env.CONTRACT_ADDRESS, // Account that owns the data
      table: process.env.CONTRACT_TABLE, // Table name
      limit: 100, // Maximum number of rows that we want to get
      reverse: false, // Optional: Get reversed data
      show_payer: false // Optional: Show ram payer
    });

    tableResults.rows.forEach((pool, index) => {
      // console.log(pool);
      let id = pool.id;

      //check dates are unix
      pool.pool_open = new Date(pool.pool_open).valueOf();
      pool.private_end = new Date(pool.private_end).valueOf();
      pool.public_end = new Date(pool.public_end).valueOf();

      const poolTable = pool;

      commit("updatePoolOnState", { poolTable, id });
      dispatch("updatePoolSettings", id);
    });
  } catch (error) {
    commit("general/setErrorMsg", error.message || error, { root: true });
  }
};

// Test function for reading address
export const getChainAccountInfo = async function({ commit }, address) {
  const rpc = this.$api.getRpc();
  console.log(await rpc.get_account(address));
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
      limit: 1, // Maximum number of rows that we want to get
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

export const updatePoolSettings = async function({ commit, getters }, poolID) {
  const pool = getters.getPoolByID(poolID);

  // TODO Call within the getAllChainPools action

  // Update status
  var poolStatus = "loading";
  const currentDate = Date.now();
  if (currentDate < pool.pool_open) {
    poolStatus = "upcoming";
  } else if (currentDate > pool.public_end) {
    poolStatus = "closed";
  } else {
    poolStatus = "open";
  }

  // Update access type
  var access_type = "Public";
  if (currentDate < pool.private_end) {
    access_type = "Private";
  }

  // Update progress
  const total_raise = this.$fromChainString(pool.total_raise);
  const hard_cap = this.$fromChainString(pool.hard_cap);
  var progress = 0;
  if (hard_cap !== 0) progress = total_raise / hard_cap;

  commit({
    type: "setPoolSettings",
    id: poolID,
    pool_status: poolStatus,
    access_type: access_type,
    progress: progress
  });
};

// Get pools created from chain
export const getCreatedChainPools = async function(
  { commit, dispatch },
  owner
) {
  try {
    const tableResults = await this.$api.getTableRows({
      code: process.env.CONTRACT_ADDRESS, // Contract that we target
      scope: process.env.CONTRACT_ADDRESS, // Account that owns the data
      table: process.env.CONTRACT_TABLE, // Table name
      limit: 100,
      index_position: 2,
      key_type: "i64",
      lower_bound: owner,
      upper_bound: owner,
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
      dispatch("updatePoolSettings", id);
    });
  } catch (error) {
    commit("general/setErrorMsg", error.message || error, { root: true });
  }
};

export const getJoinedChainPools = async function({ commit, getters, dispatch }, user) {
  try {
    const tableResults = await this.$api.getTableRows({
      code: process.env.CONTRACT_ADDRESS, // Contract that we target
      scope: process.env.CONTRACT_ADDRESS, // Account that owns the data
      table: 'poolaccounts', // Table name
      limit: 100,
      index_position: 3,
      key_type: "i64",
      lower_bound: user,
      upper_bound: user,
      reverse: false, // Optional: Get reversed data
      show_payer: false // Optional: Show ram payer
    });

    let pool_id_list = []
    tableResults.rows.forEach((pool, index) => {
      console.log(pool);
      let pool_id = pool.pool_id;
      pool_id_list.push(pool_id);

      // commit("updatePoolOnState", { poolTable, pool_id });
      // dispatch("updatePoolSettings", pool_id);
    });
    console.log(pool_id_list);
    return pool_id_list;
  } catch (error) {
    commit("general/setErrorMsg", error.message || error, { root: true });
  }
};
