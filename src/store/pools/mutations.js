export const setPoolStatus = (state, { id, status }) => {
  state.pools.find(el => el.id === id).status = status;
};

export const updatePoolOnState = (state, { poolTable, id }) => {
  if (!poolTable) {
    console.log('[ERROR] No pool table')
    return;
  }

  // if pool in store update, else push
  if (state.pools.map(a => a.id).includes(id)) {
    state.pools[state.pools.findIndex(el => el.id === id)] = poolTable; //TODO only update with new values, rather than rewrite state
    // console.log(poolTable);
  } else {    
    state.pools.push(poolTable);
    // console.log(poolTable);
  }
};
