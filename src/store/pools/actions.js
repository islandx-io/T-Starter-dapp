import { date } from "quasar";

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
    console.log(poolTable);

    //check dates are unix
    console.log(poolTable.pool_open + 'Z')
    poolTable.pool_open = new Date(poolTable.pool_open + 'Z').valueOf();
    poolTable.private_end = new Date(poolTable.private_end + 'Z').valueOf();
    poolTable.public_end = new Date(poolTable.public_end + 'Z').valueOf();

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
      limit: 100, // Maximum number of rows that we want to get
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
  const rpc = this.$api.getRpc();
  // console.log(await rpc.history_get_actions(payload.account));
  let actionsTable = (await rpc.history_get_actions(payload.account)).actions;
  console.log(
    actionsTable.filter(
      a => a.action_trace.act.data.memo === `fund pool:${payload.id}`
    )
  );
  if (
    actionsTable.filter(
      a => a.action_trace.act.data.memo === `fund pool:${payload.id}`
    ).length > 0
  ) {
    return true;
  } else {
    return false;
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
    // console.log(balance)
    if (balance == undefined) {
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
  if (currentDate < pool.pool_open) {
    poolStatus = "upcoming";
  } else if (currentDate > pool.public_end) {
    poolStatus = "closed";
  } else {
    poolStatus = "open";
  }

  // Update status when pool is filled
  if (this.$chainToQty(pool.remaining_ask) <= 0) {
    poolStatus = "closed";
  }

  // Update access type
  var access_type = "Private";
  if (pool.private_end >= pool.public_end) {
    access_type = "Private";
  } else if (pool.private_end <= pool.pool_open) {
    access_type = "Public";
  } else if (currentDate > pool.private_end) {
    access_type = "Public";
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
        limit: 100,
        index_position: 2,
        key_type: "i64",
        lower_bound: owner,
        upper_bound: owner,
        reverse: false, // Optional: Get reversed data
        show_payer: false // Optional: Show ram payer
      });
      console.log("Created pools:");
      for (const pool of tableResults.rows) {
        console.log(pool);
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
        limit: 100,
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
        await dispatch("getChainPoolByID", pool_id);
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
      limit: 100,
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
      await dispatch("getChainPoolByID", pool_id);
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
      limit: 100, // Maximum number of rows that we want to get
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
      await dispatch("getChainPoolByID", pool_id);
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
        limit: 100,
        index_position: 2,
        key_type: "i64",
        lower_bound: payload.poolID,
        upper_bound: payload.poolID,
        reverse: false, // Optional: Get reversed data
        show_payer: false // Optional: Show ram payer
      });

      const allocationTable = tableResults.rows.filter(
        a => a.account === payload.account && a.pool_id === payload.poolID
      )[0];
      console.log("Allocation:");
      if (allocationTable !== undefined) {
        console.log(allocationTable);
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
      limit: 100,
      index_position: 1,
      key_type: "i64",
      reverse: false, // Optional: Get reversed data
      show_payer: false // Optional: Show ram payer
    });

    const premium_stake = tableResults.rows[0].premium_stake;
    // console.log("Premium stake amount");
    // console.log(premium_stake);
    return premium_stake;
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
        limit: 100,
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
      console.log("allocation table");
      console.log(allocationTable);

      // get premium stake
      const premium_stake = await dispatch("getPremiumStake");
      let premium_stake_qty = this.$chainToQty(premium_stake.quantity);
      // console.log(premium_stake_qty)

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
        Object.keys(allocationTable).length > 0 &&
        allocationTable.constructor === Object
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
