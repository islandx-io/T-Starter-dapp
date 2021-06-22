export const setBallotSettings = (
  state,
  { id, pool_status, access_type, progress, chain }
) => {
  let pool = state.ballots.find(el => el.id === id && el.chain === chain);
  pool.pool_status = pool_status;
  pool.access_type = access_type;
  pool.progress = progress;
};

export const setBallotVotesTable = (state, { id, votes_table, chain }) => {
  let pool = state.ballots.find(el => el.id === id && el.chain === chain);
  pool.votes_table = votes_table;
};

export const updateBallotOnState = (state, { ballotTable }) => {
  if (!ballotTable) {
    console.error("[ERROR] No pool table");
    return;
  }

  // if ballot in store update, else push onto store
  if (
    state.ballots.some(
      a => a.id === ballotTable.id && a.chain === ballotTable.chain
    )
  ) {
    const index = state.ballots.findIndex(
      el => el.id === ballotTable.id && el.chain === ballotTable.chain
    );
    state.ballots[index] = ballotTable;
    state.ballots = [...state.ballots];
  } else {
    state.ballots.push(ballotTable);
  }
};
