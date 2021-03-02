export const updatePoolStatus = async function({ commit, getters }, poolID) {
  const pool = getters.getPoolByID(poolID);
  // console.log({ pool: pool });
  var poolStatus = "loading";
  const currentDate = Date.now();
  if (currentDate < pool.start_date) {
    poolStatus = "upcoming";
  } else if (currentDate > pool.end_public_date) {
    poolStatus = "closed";
  } else {
    poolStatus = "open";
  }
  commit({
    type: "setPoolStatus",
    id: poolID,
    status: poolStatus
  });
};
