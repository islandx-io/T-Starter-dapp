const getPoolState = (state, id) => {
  // Returns pool state of the corresponding pool ID
  for (var i = 0; i < state.pools.length; i += 1) {
    if (state.pools[i].id === id) {
      return state.pools[i];
    }
  }
};

export const setPoolStatus = (state, { id, status }) => {
  getPoolState(state, id).status = status;
};

export const updatePoolOnState = (state, {poolTable, id}) => {
    if (!poolTable) {
      return;
    }
    state.pools.find(el => el.id === id); //FIXME
  };
