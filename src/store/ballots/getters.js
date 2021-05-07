export const getAllBallots = ({ ballots }) => ballots;

export const getAllBallotIDs = ({ ballots }) => ballots.map(el => el.id);

export const getBallotByID = ({ ballots }) => id => ballots.find(el => el.id === id);
