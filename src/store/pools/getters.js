/*
export function someGetter (state) {
}
*/
export const getAllPools = ({pools}) => pools;
export const getAllPoolIDs = ({pools}) => pools.map(a => a.id);
export const getPoolByID = ({pools}) => (id) => pools.find(el => el.id === id); // TODO make async action?