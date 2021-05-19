export const getAllBallots = ({ ballots }) => ballots;

export const getPublishedBallots = ({ ballots }) => ballots.filter(a => a.status === 'published');

export const getAllBallotIDs = ({ ballots }) => ballots.map(el => el.id);

export const getBallotByID = ({ ballots }) => id => ballots.find(el => el.id === id);
