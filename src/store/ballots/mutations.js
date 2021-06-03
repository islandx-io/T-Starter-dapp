export const setBallotSettings = (
  state,
  { id, pool_status, access_type, progress }
) => {
  console.log("in mutation")
  let pool = state.ballots.find(el => el.id === id);
  pool.ballot_close = 1621519800000;
  pool.access_type = access_type;
  pool.progress = progress;
};

export const updateBallotOnState = (state, { ballotTable }) => {
  if (!ballotTable) {
    console.log("[ERROR] No pool table");
    return;
  }

  // if ballot in store update, else push onto store
  if (state.ballots.some(a => a.id === ballotTable.id && a.chain === ballotTable.chain)) {
    const index = state.ballots.findIndex(el => el.id === ballotTable.id && el.chain === ballotTable.chain)
    state.ballots[index] = ballotTable
    state.ballots = [...state.ballots]
  } else {
    state.ballots.push(ballotTable);
  }
};
