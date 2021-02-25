/*
export function someGetter (state) {
}
*/
export const getAllPools = ({pools}) => pools;
export const getPoolByID = ({pools}) => (id) => pools.find(el => el.id === id); // TODO make async action?