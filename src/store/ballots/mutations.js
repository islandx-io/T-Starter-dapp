// export const setPoolSettings = (
//   state,
//   { id, pool_status, access_type, progress }
// ) => {
//   var pool = state.pools.find(el => el.id === id);
//   pool.pool_status = pool_status;
//   pool.access_type = access_type;
//   pool.progress = progress;
// };

export const updateBallotOnState = (state, { ballotTable, id }) => {
  if (!ballotTable) {
    console.log("[ERROR] No pool table");
    return;
  }

  if (!id) {
    console.log("[ERROR] No pool id");
    return;
  }

  // if ballot in store update, else push onto store
  if (state.ballots.map(a => a.id).includes(id)) {
    state.ballots[state.ballots.findIndex(el => el.id === id)] = ballotTable;
    // console.log(ballotTable);
  } else {
    state.ballots.push(ballotTable);
    // console.log(ballotTable);
  }
};
