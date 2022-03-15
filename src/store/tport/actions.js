// Get evm bridge tokens from tokens table of tport.start
export const setTPortTokens = async function ({ commit, getters }) {
    try {
        let tokens = [];
        const tableResults = await this.$api.getTableRows({
            code: process.env.TPORT_ADDRESS,
            scope: process.env.TPORT_ADDRESS,
            table: "tokens",
            limit: 10000,
            reverse: false,
            show_payer: false
        });
        for (let asset of tableResults.rows) {
            // console.log("Asset: ", asset);
            asset.token = {
                sym: this.$getSymFromAsset(asset.token),
                decimals: this.$getDecimalFromAsset(asset.token),
                contract: asset.token.contract
            };
            tokens.push(asset);
        }
        // console.log("TPort Tokens:", tokens);
        commit("updateTPortTokens", { tokens });
    } catch (error) {
        commit("general/setErrorMsg", error.message || error, { root: true });
    }
};

export const setTeleports = async function ({ commit }, account) {
    try {
        let res = await this.$api.getTableRows({
            code: process.env.TPORT_ADDRESS,
            scope: process.env.TPORT_ADDRESS,
            table: "teleports",
            key_type: "i64",
            index_position: 2,
            lower_bound: account,
            upper_bound: account,
            limit: 10000,
            reverse: false,
            show_payer: false
        });

        let cancelsTable = await this.$api.getTableRows({
            code: process.env.TPORT_ADDRESS,
            scope: process.env.TPORT_ADDRESS,
            table: "cancels",
            limit: 10000,
            reverse: true,
        });

        let cancelArr = cancelsTable.rows.map(t => t.teleport_id)

        // console.log("Teleports: ", res.rows);
        // console.log("Cancels: ", cancelArr);

        let teleports = [];
        res.rows.forEach(r => {
            r.processing = r.oracles.length <= 1;
            if (!cancelArr.includes(r.id)) {
                teleports.push(r);
            }
        });

        teleports = teleports
            .map(t => {
                if (t.date) {
                    t.time = new Date(t.date + "Z").valueOf();
                }
                return t;
            })
            .sort((a, b) => (a.time < b.time ? 1 : -1));

        // console.log("Teleports:", teleports);
        commit("updateTeleports", { teleports });
    } catch (error) {
        commit("general/setErrorMsg", error.message || error, { root: true });
    }
};
