export const setPoolSettings = (
  state,
  { id, pool_status, access_type, progress }
) => {
  let pool = state.pools.find(el => el.id === id);
  pool.pool_status = pool_status;
  pool.access_type = access_type;
  pool.progress = progress;
};

export const updatePoolOnState = (state, { poolTable, id }) => {
  if (!poolTable) {
    console.error("No pool table");
    return;
  }

  // if pool in store update, else push
  if (state.pools.map(a => a.id).includes(id)) {
    state.pools[state.pools.findIndex(el => el.id === id)] = poolTable;
    // console.log(poolTable);
  } else {
    state.pools.push(poolTable);
    // console.log(poolTable);
  }
};

export const setPoolSentimentTable = (state, { id, sentiment_table }) => {
  let pool = state.pools.find(el => el.id === id);
  pool.sentiment_table = sentiment_table;
};

export const setPoolCommentsTable = (state, { id, comments_table }) => {
  let pool = state.pools.find(el => el.id === id);
  pool.comments_table = comments_table;
};
