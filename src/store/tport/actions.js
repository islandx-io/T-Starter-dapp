// Get evm bridge tokens from tokens table of tport.start
export const setTPortTokens = async function({ commit, getters }) {
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

export const setTeleports = async function({ commit }, account) {
  try {
    let teleports = [];
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

    res.rows.forEach(r => {
      r.class = "toevm";
      r.completed = r.claimed;
      r.claimable = r.oracles.length >= 1 && !r.completed;
      // r.correct_login =
      //   "0x" + r.eth_address.substr(0, 40) ==
      //   evmAccount.toLowerCase();
      r.valid_chain = true; // TODO Add check
      // if (this.getChainId.ethereum == 1 && r.chain_id === 1){
      //     r.valid_chain = true
      // }
      // else if (this.getChainId.ethereum == 3 && r.chain_id === 1){
      //     r.valid_chain = true
      // }
      // else if (this.getChainId.ethereum == 56 && r.chain_id === 2){
      //     r.valid_chain = true
      // }
      teleports.push(r);
    });
    res = await this.$api.getTableRows({
      code: process.env.TPORT_ADDRESS,
      scope: process.env.TPORT_ADDRESS,
      table: "receipts",
      index_position: 3,
      key_type: "i64",
      lower_bound: account,
      upper_bound: account,
      reverse: true
    });
    console.log("resEth", res);
    res.rows.forEach(r => {
      r.class = "fromevm";
      teleports.push(r);
    });

    teleports = teleports
      .map(t => {
        if (t.date) {
          t.time = new Date(t.date + "Z").valueOf();
        }
        return t;
      })
      .sort((a, b) => (a.time < b.time ? 1 : -1));

    console.log("Teleports:", teleports);
    commit("updateTeleports", { teleports });
  } catch (error) {
    commit("general/setErrorMsg", error.message || error, { root: true });
  }
};
