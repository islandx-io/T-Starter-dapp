import axios from "axios";

// Get pool info from chain by id, put into store
export const getChainPoolByID = async function({ commit, dispatch }, id) {
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
    // console.log(poolTable);

    //check dates are unix
    poolTable.pool_open = new Date(poolTable.pool_open + "Z").valueOf();
    poolTable.private_end = new Date(poolTable.private_end + "Z").valueOf();
    poolTable.public_end = new Date(poolTable.public_end + "Z").valueOf();

    commit("updatePoolOnState", { poolTable, id });
    await dispatch("updatePoolSettings", id);
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
      limit: 10000, // Maximum number of rows that we want to get
      reverse: false, // Optional: Get reversed data
      show_payer: false // Optional: Show ram payer
    });

    // sort according to nearest pool open
    tableResults.rows.sort(function(a, b) {
      return new Date(a.pool_open) - new Date(b.pool_open);
    });

    for (const pool of tableResults.rows) {
      // console.log(pool);
      let id = pool.id;

      //check dates are unix
      pool.pool_open = new Date(pool.pool_open + "Z").valueOf();
      pool.private_end = new Date(pool.private_end + "Z").valueOf();
      pool.public_end = new Date(pool.public_end + "Z").valueOf();

      const poolTable = pool;

      commit("updatePoolOnState", { poolTable, id });
      await dispatch("updatePoolSettings", id);
    }
  } catch (error) {
    commit("general/setErrorMsg", error.message || error, { root: true });
  }
};

// Test function for reading address
export const getChainAccountInfo = async function({ commit }, accountName) {
  const rpc = this.$api.getRpc();
  console.log(await rpc.get_account(accountName));
  console.log(await rpc.history_get_actions(accountName));

  // console.log(await rpc.get_currency_balance(address, "fuzzytestnet"));
};

// if pool is funded with the token
export const ifPoolFunded = async function({ commit }, payload) {

  // Get response with tokens sent to pools.start with memo fund pool
  let response = await axios(
    `${process.env.NETWORK_PROTOCOL}://${process.env.NETWORK_HOST}` +
      `/v2/history/get_actions?account=${payload.account}` +
      `&limit=1000&sort=desc&transfer.to=${process.env.CONTRACT_ADDRESS}` +
      `&transfer.memo=fund pool`
  );
  // console.log(response.data.actions)

  if (
    response.data.actions.filter(
      a => a.act.data.memo === `fund pool:${payload.id}`
    ).length > 0
  ) {
    return true;
  } else {
    return false;
  }
};

// DEPRECATED. Get received pool tokens
export const getReceivedPoolTokenTxns = async function({}, account) {
  let response = await axios(
    `${process.env.NETWORK_PROTOCOL}://${process.env.NETWORK_HOST}` +
      `/v2/history/get_actions?account=${account}` +
      `&limit=1000&sort=desc&transfer.to=${account}` +
      `&transfer.memo=allocation%20of%20pool%20tokens`
  );
  // console.log(response.data.actions)
  return response.data.actions;
};

// Get tokens from pooltokens table
export const getPoolTokens = async function({ commit, dispatch }) {
  try {
    const tableResults = await this.$api.getTableRows({
      code: process.env.CONTRACT_ADDRESS, // Contract that we target
      scope: process.env.CONTRACT_ADDRESS, // Account that owns the data
      table: 'pooltokens', // Table name
      limit: 10000, // Maximum number of rows that we want to get
      reverse: false, // Optional: Get reversed data
      show_payer: false // Optional: Show ram payer
    });

    // const poolTable = tableResults.rows[tableResults.rows.length - 1];
    // console.log(tableResults.rows)
    return tableResults.rows

  } catch (error) {
    commit("general/setErrorMsg", error.message || error, { root: true });
  }
};

// Get balance from chain for given address and token
export const getBalanceFromChain = async function({ commit }, payload) {
  try {
    const rpc = this.$api.getRpc();
    // console.log(
    //   await rpc.get_currency_balance(
    //     payload.address,
    //     payload.accountName,
    //     payload.sym
    //   )
    // );
    let balance = (
      await rpc.get_currency_balance(
        payload.address,
        payload.accountName,
        payload.sym
      )
    )[0];
    // console.log('balance')
    if (balance === undefined) {
      return `0 ${payload.sym}`;
    } else {
      return balance;
    }
  } catch (error) {
    commit("general/setErrorMsg", error.message || error, { root: true });
  }
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
  if (pool.status === "draft") {
    poolStatus = "draft";
  } else if (currentDate < pool.pool_open) {
    poolStatus = "upcoming";
  } else if (
    currentDate > pool.public_end ||
    this.$chainToQty(pool.remaining_offer) <= 0
  ) {
    poolStatus = "completed";
    if (pool.status === "success") poolStatus = "filled";
    else if (pool.status === "cancelled") poolStatus = "cancelled";
  } else {
    poolStatus = "open";
  }

  // Update access type
  var access_type = "Public";
  if (pool.private_end >= pool.public_end) {
    access_type = "Premium";
  } else if (pool.private_end <= pool.pool_open) {
    access_type = "Public";
  } else if (currentDate > pool.private_end) {
    access_type = "Public";
  } else if (currentDate < pool.private_end) {
    access_type = "Premium";
  }

  // Update progress
  const total_raise = this.$chainToQty(pool.total_raise);
  const hard_cap = this.$chainToQty(pool.hard_cap);
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
    if (owner !== null) {
      const tableResults = await this.$api.getTableRows({
        code: process.env.CONTRACT_ADDRESS, // Contract that we target
        scope: process.env.CONTRACT_ADDRESS, // Account that owns the data
        table: process.env.CONTRACT_TABLE, // Table name
        limit: 1000,
        index_position: 2,
        key_type: "i64",
        lower_bound: owner,
        upper_bound: owner,
        reverse: false, // Optional: Get reversed data
        show_payer: false // Optional: Show ram payer
      });
      console.log("Created pools:");
      for (const pool of tableResults.rows) {
        // console.log(pool);
        let id = pool.id;

        //check dates are unix
        pool.pool_open = new Date(pool.pool_open + "Z").valueOf();
        pool.private_end = new Date(pool.private_end + "Z").valueOf();
        pool.public_end = new Date(pool.public_end + "Z").valueOf();

        const poolTable = pool;

        commit("updatePoolOnState", { poolTable, id });
        await dispatch("updatePoolSettings", id);
      }
    }
  } catch (error) {
    commit("general/setErrorMsg", error.message || error, { root: true });
  }
};

export const getJoinedChainPools = async function(
  { commit, getters, dispatch },
  user
) {
  try {
    if (user !== null) {
      const tableResults = await this.$api.getTableRows({
        code: process.env.CONTRACT_ADDRESS, // Contract that we target
        scope: process.env.CONTRACT_ADDRESS, // Account that owns the data
        table: "poolaccounts", // Table name
        limit: 1000,
        index_position: 3,
        key_type: "i64",
        lower_bound: user,
        upper_bound: user,
        reverse: false, // Optional: Get reversed data
        show_payer: false // Optional: Show ram payer
      });

      console.log("Joined pools:");
      // console.log(tableResults.rows);
      let pool_id_list = [];
      // sort according to nearest pool open
      tableResults.rows.sort(function(a, b) {
        return new Date(a.pool_open) - new Date(b.pool_open);
      });

      pool_id_list = tableResults.rows.map(a => a.pool_id);
      pool_id_list = [...new Set(pool_id_list)]; // remove duplicates
      console.log(pool_id_list);

      for (const pool_id of pool_id_list) {
        dispatch("getChainPoolByID", pool_id);
      }

      return pool_id_list;
    } else {
      return [];
    }
  } catch (error) {
    commit("general/setErrorMsg", error.message || error, { root: true });
  }
};

export const getFeaturedChainPools = async function({
  commit,
  getters,
  dispatch
}) {
  try {
    const tableResults = await this.$api.getTableRows({
      code: process.env.CONTRACT_ADDRESS, // Contract that we target
      scope: process.env.CONTRACT_ADDRESS, // Account that owns the data
      table: "settings", // Table name
      limit: 1000,
      index_position: 1,
      key_type: "i64",
      reverse: false, // Optional: Get reversed data
      show_payer: false // Optional: Show ram payer
    });
    console.log("Featured pools:");
    let pool_id_list = [];

    pool_id_list = tableResults.rows[0].featured_pools;
    pool_id_list = [...new Set(pool_id_list)]; // remove duplicates
    console.log(pool_id_list);

    for (const pool_id of pool_id_list) {
      dispatch("getChainPoolByID", pool_id);
    }

    return pool_id_list;
  } catch (error) {
    commit("general/setErrorMsg", error.message || error, { root: true });
  }
};

// get upcoming pools from chain, populate store
export const getUpcomingChainPools = async function({ commit, dispatch }) {
  try {
    const tableResults = await this.$api.getTableRows({
      code: process.env.CONTRACT_ADDRESS, // Contract that we target
      scope: process.env.CONTRACT_ADDRESS, // Account that owns the data
      table: process.env.CONTRACT_TABLE, // Table name
      limit: 1000, // Maximum number of rows that we want to get
      index_position: 3,
      key_type: "i64",
      // lower_bound: 1, // show all published pools
      lower_bound: Math.trunc(Date.now() / 1000), // get upcoming pools
      // upper_bound: Math.trunc(Date.now()/1000), // to get closed and open pools
      reverse: false, // Optional: Get reversed data
      show_payer: false // Optional: Show ram payer
    });

    console.log("Upcoming pools");
    let pool_id_list = [];

    // sort according to nearest pool open
    tableResults.rows.sort(function(a, b) {
      return new Date(a.pool_open) - new Date(b.pool_open);
    });

    console.log(tableResults.rows);
    pool_id_list = tableResults.rows.map(a => a.id);
    pool_id_list = [...new Set(pool_id_list)]; // remove duplicates

    console.log(pool_id_list);

    for (const pool_id of pool_id_list) {
      dispatch("getChainPoolByID", pool_id); // TODO this is redundant, already have info from chain.
    }

    return pool_id_list;
  } catch (error) {
    commit("general/setErrorMsg", error.message || error, { root: true });
  }
};

// get personal allocation for pool
export const getAllocationByPool = async function(
  { commit, getters, dispatch },
  payload
) {
  try {
    if (payload.account !== null) {
      const tableResults = await this.$api.getTableRows({
        code: process.env.CONTRACT_ADDRESS, // Contract that we target
        scope: process.env.CONTRACT_ADDRESS, // Account that owns the data
        table: "poolaccounts", // Table name
        limit: 10000,
        index_position: 3,
        key_type: "i64",
        lower_bound: payload.account,
        upper_bound: payload.account,
        reverse: false, // Optional: Get reversed data
        show_payer: false // Optional: Show ram payer
      });

      const allocationTable = tableResults.rows.filter(
        a => a.account === payload.account && a.pool_id === payload.poolID
      )[0];
      // console.log("Allocation:");
      if (allocationTable !== undefined) {
        // console.log(allocationTable);
        return allocationTable;
      } else {
        return {};
      }
    } else {
      return {};
    }
  } catch (error) {
    commit("general/setErrorMsg", error.message || error, { root: true });
  }
};

// get premuim stake value
export const getPremiumStake = async function({ commit, getters, dispatch }) {
  try {
    const tableResults = await this.$api.getTableRows({
      code: process.env.CONTRACT_ADDRESS, // Contract that we target
      scope: process.env.CONTRACT_ADDRESS, // Account that owns the data
      table: "settings", // Table name
      limit: 1000,
      index_position: 1,
      key_type: "i64",
      reverse: false, // Optional: Get reversed data
      show_payer: false // Optional: Show ram payer
    });

    const premium_access_fee = tableResults.rows[0].premium_access_fee;
    // console.log("Premium stake amount");
    // console.log(premium_access_fee);
    return premium_access_fee;
  } catch (error) {
    commit("general/setErrorMsg", error.message || error, { root: true });
  }
};

//get platform token (START)
export const getPlatformToken = async function({ commit, getters, dispatch }) {
  try {
    const tableResults = await this.$api.getTableRows({
      code: process.env.CONTRACT_ADDRESS, // Contract that we target
      scope: process.env.CONTRACT_ADDRESS, // Account that owns the data
      table: "settings", // Table name
      limit: 1000,
      index_position: 1,
      key_type: "i64",
      reverse: false, // Optional: Get reversed data
      show_payer: false // Optional: Show ram payer
    });

    const platform_token = tableResults.rows[0].platform_token;
    // console.log("Premium stake amount");
    // console.log(premium_access_fee);
    return platform_token;
  } catch (error) {
    commit("general/setErrorMsg", error.message || error, { root: true });
  }
};

// check if tokens already staked
export const checkStakedChain = async function(
  { commit, getters, dispatch },
  payload
) {
  try {
    if (payload.account !== null) {
      const stakeBalanceTbl = await this.$api.getTableRows({
        code: process.env.CONTRACT_ADDRESS, // Contract that we target
        scope: process.env.CONTRACT_ADDRESS, // Account that owns the data
        table: "stakebalance", // Table name
        limit: 10000,
        index_position: 1,
        key_type: "i64",
        lower_bound: payload.account,
        upper_bound: payload.account,
        reverse: false, // Optional: Get reversed data
        show_payer: false // Optional: Show ram payer
      });

      let allocationTable = await dispatch("getAllocationByPool", {
        account: payload.account,
        poolID: payload.poolID
      });

      // get premium stake
      const premium_access_fee = await dispatch("getPremiumStake");
      let premium_access_fee_qty = this.$chainToQty(premium_access_fee);
      // console.log(premium_access_fee_qty)

      const staked_START = this.$chainToQty(stakeBalanceTbl.rows[0].staked);
      const liquid_START = this.$chainToQty(stakeBalanceTbl.rows[0].liquid);
      // console.log("START staked?");
      // console.log(staked_amount);

      if (
        Object.keys(allocationTable).length === 0 &&
        allocationTable.constructor === Object
      ) {
        return false;
      } else if (
        (Object.keys(allocationTable).length > 0 &&
          allocationTable.constructor === Object) ||
        liquid_START >= premium_access_fee_qty // if already made 1st purchase or if have liquid
      ) {
        return true;
      } else {
        console.log("Nothing");
        return false;
      }
    } else {
      return false;
    }
  } catch (error) {
    commit("general/setErrorMsg", error.message || error, { root: true });
  }
};

// get possible base tokens
export const getBaseTokens = async function(
  { commit, getters, dispatch },
  return_avatar = false
) {
  try {
    const tableResults = await this.$api.getTableRows({
      code: process.env.CONTRACT_ADDRESS, // Contract that we target
      scope: process.env.CONTRACT_ADDRESS, // Account that owns the data
      table: "tokens", // Table name
      limit: 10000,
      reverse: false, // Optional: Get reversed data
      show_payer: false // Optional: Show ram payer
    });

    if (return_avatar) {
      let base_token_info_list = tableResults.rows.filter(a => a.enabled === 1);

      return base_token_info_list;
    } else {
      let base_token_info_list = tableResults.rows
        .filter(a => a.enabled === 1)
        .map(a => a.token_info);

      return base_token_info_list;
    }
  } catch (error) {
    commit("general/setErrorMsg", error.message || error, { root: true });
  }
};
