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

    commit("updateBallotOnState", { ballotTable, id });
    //   await dispatch("updatePoolSettings", id);
  } catch (error) {
    commit("general/setErrorMsg", error.message || error, { root: true });
  }
};

// get all ballots from chain, populate store
export const getAllChainBallots = async function({ commit, dispatch }) {
  try {
    const tableResults = await this.$api.getTableRows({
      code: process.env.BALLOT_ADDRESS, // Contract that we target
      scope: process.env.BALLOT_ADDRESS, // Account that owns the data
      table: "ballots", // Table name
      limit: 10000, // Maximum number of rows that we want to get
      reverse: false, // Optional: Get reversed data
      show_payer: false // Optional: Show ram payer
    });

    // sort according to nearest ballot close date
    tableResults.rows.sort(function(a, b) {
      return new Date(a.ballot_close) - new Date(b.ballot_close);
    });

    for (const pool of tableResults.rows) {
      //   console.log(pool);
      let id = pool.id;

      //check dates are unix
      pool.ballot_close = new Date(pool.ballot_close + "Z").valueOf();
      pool.pool_open = new Date(pool.pool_open + "Z").valueOf();
      pool.private_end = new Date(pool.private_end + "Z").valueOf();
      pool.public_end = new Date(pool.public_end + "Z").valueOf();

      const ballotTable = pool;

      commit("updateBallotOnState", { ballotTable, id });
      // await dispatch("updatePoolSettings", id);
    }
  } catch (error) {
    commit("general/setErrorMsg", error.message || error, { root: true });
  }
};

// find the created ballot id
export const findCreatedBallotID = async function({ commit, dispatch }, owner) {
  try {
    const tableResults = await this.$api.getTableRows({
      code: process.env.BALLOT_ADDRESS, // Contract that we target
      scope: process.env.BALLOT_ADDRESS, // Account that owns the data
      table: "ballots", // Table name
      index_position: 2,
      key_type: "i64",
      lower_bound: owner,
      upper_bound: owner,
      limit: 10000, // Maximum number of rows that we want to get
      reverse: false, // Optional: Get reversed data
      show_payer: false // Optional: Show ram payer
    });

    const ballotTable = tableResults.rows[tableResults.rows.length - 1];
    console.log(ballotTable);

    return ballotTable.id
    // commit("updateBallotOnState", { ballotTable, id });
    //   await dispatch("updatePoolSettings", id);
  } catch (error) {
    commit("general/setErrorMsg", error.message || error, { root: true });
  }
};
