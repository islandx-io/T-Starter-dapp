export const getAllBallots = ({ ballots }) => ballots;

export const getPublishedBallots = ({ ballots }) => ballots.filter(a => a.status === 'published');
export const getUpcomingBallots = ({ ballots }) => ballots.filter(a => a.status === 'published' && a.ballot_close > Date.now().valueOf());

export const getAllBallotIDs = ({ ballots }) => ballots.map(el => el.id);

export const getBallotByID = ({ ballots }) => id => ballots.find(el => el.id === id);

export const getBallotByIDChain = ({ ballots }) => (id, chain) =>
ballots.find(el => el.id === id && el.chain === chain);

export const getOwnedBallots = ({ ballots }) => (owner) =>
ballots.find(el => el.owner === owner);