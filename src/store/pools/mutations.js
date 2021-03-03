export const setPoolStatus = (state, { id, status }) => {
  state.pools.find(el => el.id === id).status = status;
};

export const updatePoolOnState = (state, { poolTable, id }) => {
  if (!poolTable) {
    return;
  }
  state.pools[state.pools.findIndex(el => el.id === id)] = poolTable;   //TODO only update with new values, rather than rewrite state
  console.log(poolTable);
};
