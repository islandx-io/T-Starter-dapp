export const getAllPools = ({ pools }) => pools;
export const getAllPoolIDs = ({ pools }) => pools.map(a => a.id);
export const getPoolIDsByStatus = ({ pools }) => status =>
  pools.filter(a => a.status === status).map(a => a.id);
export const getPoolByID = ({ pools }) => id => pools.find(el => el.id === id);
export const getCreatedPoolIDs =  ({pools}) => owner => pools.filter(el => el.owner === owner).map(a => a.id);
