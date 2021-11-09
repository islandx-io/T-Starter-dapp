// Get ballot info from chain by id, put into store
export const getChainBallotByID = async function({ commit, dispatch }, id) {
  try {
    const tableResults = await this.$api.getTableRows({
      code: process.env.BALLOT_ADDRESS, // Contract that we target
      scope: process.env.BALLOT_ADDRESS, // Account that owns the data
      table: "ballots", // Table name
      lower_bound: id, // Table primary key value
      limit: 1, // Maximum number of rows that we want to get
      reverse: false, // Optional: Get reversed data
      show_payer: false // Optional: Show ram payer
    });

    const ballotTable = tableResults.rows[tableResults.rows.length - 1];
    // console.log(ballotTable);

    //check dates are unix
    ballotTable.ballot_close = new Date(
      ballotTable.ballot_close + "Z"
    ).valueOf();
    ballotTable.pool_open = new Date(ballotTable.pool_open + "Z").valueOf();
    ballotTable.private_end = new Date(ballotTable.private_end + "Z").valueOf();
    ballotTable.public_end = new Date(ballotTable.public_end + "Z").valueOf();
    ballotTable.votes_table = [];

    // set chain in pool
    ballotTable.chain = this.$api.currentChain.NETWORK_NAME;

    commit("updateBallotOnState", { ballotTable });
    await dispatch("updateBallotSettings", { id, chain: ballotTable.chain });
    dispatch("updateBallotVotesTable", {
      id,
      chain: ballotTable.chain
    });
  } catch (error) {
    console.error("getChainBallotByID")
    commit("general/setErrorMsg", error.message || error, { root: true });
  }
};

// Get pool info from chain by id, put into store
export const getChainBallotByIDChain = async function(
  { commit, dispatch },
  payload
) {
  try {
    let rpcs = await dispatch("pools/possibleRPCs", true, { root: true });
    let api =
      rpcs.apis[rpcs.chains.findIndex(el => el.NETWORK_NAME === payload.chain)];

    const tableResults = await api.get_table_rows({
      json: true,
      code: process.env.BALLOT_ADDRESS, // Contract that we target
      scope: process.env.BALLOT_ADDRESS, // Account that owns the data
      table: "ballots", // Table name
      lower_bound: payload.id, // Table primary key value
      limit: 1, // Maximum number of rows that we want to get
      reverse: false, // Optional: Get reversed data
      show_payer: false // Optional: Show ram payer
    });
    // console.log(this.$api.currentChain);

    let ballotTable = tableResults.rows[tableResults.rows.length - 1];
    // console.log(ballotTable);

    //check dates are unix
    ballotTable.ballot_close = new Date(ballotTable.ballot_close + "Z").valueOf();
    ballotTable.pool_open = new Date(ballotTable.pool_open + "Z").valueOf();
    ballotTable.private_end = new Date(ballotTable.private_end + "Z").valueOf();
    ballotTable.public_end = new Date(ballotTable.public_end + "Z").valueOf();
    ballotTable.votes_table = [];

    // set chain in pool
    ballotTable.chain =
      rpcs.chains[
        rpcs.chains.findIndex(el => el.NETWORK_NAME === payload.chain)
      ].NETWORK_NAME;

    commit("updateBallotOnState", { ballotTable });
    await dispatch("updateBallotSettings", { id: payload.id, chain: ballotTable.chain });
    dispatch("updateBallotVotesTable", {
      id: payload.id,
      chain: ballotTable.chain,
      api
    });
  } catch (error) {
    console.error("getChainBallotByIDChain");
    commit("general/setErrorMsg", error.message || error, { root: true });
  }
};

// get all ballots from chain, populate store
export const getAllChainBallots = async function({ commit, dispatch }) {
  try {
    let rpcs = await dispatch("pools/possibleRPCs", true, { root: true });
    // console.log(rpcs);

    for (const [index, api] of rpcs.apis.entries()) {
      let tableResults;
      try {
        tableResults = await api.get_table_rows({
          json: true,
          code: process.env.BALLOT_ADDRESS, // Contract that we target
          scope: process.env.BALLOT_ADDRESS, // Account that owns the data
          table: "ballots", // Table name
          limit: 10000, // Maximum number of rows that we want to get
          reverse: false, // Optional: Get reversed data
          show_payer: false // Optional: Show ram payer
        });
      } catch (error) {
        continue;
      }

      // sort according to nearest ballot close date
      tableResults.rows.sort(function(a, b) {
        return new Date(a.ballot_close) - new Date(b.ballot_close);
      });

      for (const pool of tableResults.rows) {
        // console.log(pool);
        let id = pool.id;

        //check dates are unix
        pool.ballot_close = new Date(pool.ballot_close + "Z").valueOf();
        pool.pool_open = new Date(pool.pool_open + "Z").valueOf();
        pool.private_end = new Date(pool.private_end + "Z").valueOf();
        pool.public_end = new Date(pool.public_end + "Z").valueOf();
        pool.votes_table = [];

        let ballotTable = pool;
        // set chain in pool
        ballotTable.chain = rpcs.chains[index].NETWORK_NAME;
        commit("updateBallotOnState", { ballotTable });
        await dispatch("updateBallotSettings", {
          id,
          chain: ballotTable.chain
        });
        dispatch("updateBallotVotesTable", {
          id,
          chain: ballotTable.chain,
          api
        });
      }
    }
  } catch (error) {
    console.error("getAllChainBallots");
    commit("general/setErrorMsg", error.message || error, { root: true });
  }
};

export const updateBallotSettings = async function(
  { commit, getters, dispatch },
  payload
) {
  const pool = getters.getBallotByIDChain(payload.id, payload.chain);

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
  var progress = 0;
  // const total_raise = this.$chainToQty(pool.total_raise);
  // const hard_cap = this.$chainToQty(pool.hard_cap);
  // if (hard_cap !== 0) progress = total_raise / hard_cap;

  // Update chain on state
  commit({
    type: "setBallotSettings",
    id: payload.id,
    pool_status: poolStatus,
    access_type: access_type,
    progress: progress,
    chain: pool.chain
  });
};

export const updateBallotVotesTable = async function(
  { commit, getters, dispatch },
  payload
) {
  const pool = getters.getBallotByIDChain(payload.id, payload.chain);

  let tableResults;
  const options = {
    code: process.env.BALLOT_ADDRESS,
    scope: payload.id,
    table: "votes",
    limit: 10000,
    reverse: false,
    show_payer: false
  };
  if (payload.api) {
    tableResults = await payload.api.get_table_rows({
      json: true,
      ...options
    });
  } else tableResults = await this.$api.getTableRows(options);

  let votes = [];
  for (let v of tableResults.rows) {
    v["vote"] = this.$chainToQty(v["vote"]);
    votes.push(v);
  }
  // console.log(payload.chain, payload.id, tableResults.rows, votes);

  // Update chain on state
  commit({
    type: "setBallotVotesTable",
    id: payload.id,
    votes_table: votes,
    chain: pool.chain
  });
};

// find the created ballot id
// export const findCreatedBallotID = async function({ commit, dispatch }, owner) {
//   try {
//     const tableResults = await this.$api.getTableRows({
//       code: process.env.BALLOT_ADDRESS, // Contract that we target
//       scope: process.env.BALLOT_ADDRESS, // Account that owns the data
//       table: "ballots", // Table name
//       index_position: 2,
//       key_type: "i64",
//       lower_bound: owner,
//       upper_bound: owner,
//       limit: 10000, // Maximum number of rows that we want to get
//       reverse: false, // Optional: Get reversed data
//       show_payer: false // Optional: Show ram payer
//     });

//     const ballotTable = tableResults.rows[tableResults.rows.length - 1];
//     console.log(ballotTable);

//     return ballotTable.id;
//     // commit("updateBallotOnState", { ballotTable, id });
//     //   await dispatch("updatePoolSettings", id);
//   } catch (error) {
//     commit("general/setErrorMsg", error.message || error, { root: true });
//   }
// };

// if pool is funded with the token
export const ifBallotFunded = async function(
  { commit, rootGetters, getters },
  payload
) {
  try {
    if (payload.account !== null) {
      // get wallet table info
      const tableResults = await this.$api.getTableRows({
        code: process.env.BALLOT_ADDRESS, // Contract that we target
        scope: payload.account, // Account that owns the data
        table: "wallets", // Table name
        limit: 10000,
        reverse: false, // Optional: Get reversed data
        show_payer: false // Optional: Show ram payer
      });

      // get ballot info
      const pool = getters.getBallotByIDChain(payload.id, payload.chain);
      // console.log(pool);

      // console.log(tableResults.rows);
      let amount_inwallet = this.$chainToQty(
        tableResults.rows.find(el => el.contract === pool.swap_ratio.contract)
          .balance
      );
      // console.log(amount_inwallet);

      let amount_required = parseFloat(
        (
          this.$chainToQty(pool.swap_ratio.quantity) *
          this.$chainToQty(pool.hard_cap)
        ).toPrecision(15)
      );
      // console.log(amount_required);

      // if ammount of tokens in wallets tabel enough
      if (amount_inwallet >= amount_required) {
        // console.log("Pool is funded");
        return true;
      } else {
        // console.log("Pool not funded");
        return false;
      }
    }
  } catch (error) {
    commit("general/setErrorMsg", error.message || error, { root: true });
  }
};

// get config table of ballots
export const getBallotConfig = async function({ commit, getters, dispatch }) {
  try {
    const tableResults = await this.$api.getTableRows({
      code: process.env.BALLOT_ADDRESS, // Contract that we target
      scope: process.env.BALLOT_ADDRESS, // Account that owns the data
      table: "config", // Table name
      limit: 1000,
      index_position: 1,
      key_type: "i64",
      reverse: false, // Optional: Get reversed data
      show_payer: false // Optional: Show ram payer
    });

    return tableResults.rows[0];
  } catch (error) {
    commit("general/setErrorMsg", error.message || error, { root: true });
  }
};

// get config table of ballots for all the chains
export const getBallotConfigAllChains = async function({ commit, dispatch }) {
  try {
    let rpcs = await dispatch("pools/possibleRPCs", true, { root: true });
    let result = {};
    for (let i = 0; i < rpcs.apis.length; i++) {
      let api = rpcs.apis[i];
      let chain = rpcs.chains[i];
      const tableResults = await api.get_table_rows({
        json: true,
        code: process.env.BALLOT_ADDRESS,
        scope: process.env.BALLOT_ADDRESS,
        table: "config",
        limit: 1000,
        index_position: 1,
        key_type: "i64",
        reverse: false,
        show_payer: false
      });
      // console.log(api, chain, tableResults.rows[0]);
      result[chain.NETWORK_NAME] = tableResults.rows[0];
    }
    // console.log(result);
    return result;
  } catch (error) {
    commit("general/setErrorMsg", error.message || error, { root: true });
  }
};
