export const getChainData = async function({ commit }, id) {
    try {
      const tableResults = await this.$api.getTableRows({
        code: 'eosio.token',      // Contract that we target
        scope: 'testacc',         // Account that owns the data
        table: 'accounts',        // Table name
        lower_bound: id,     // Table primary key value
        limit: 1,                // Maximum number of rows that we want to get
        reverse: false,           // Optional: Get reversed data
        show_payer: false          // Optional: Show ram payer
      });
      console.log(tableResults);
  
    //   const profile = tableResults.rows[0];
    // commit("setProfile", profile);
    } catch (error) {
      commit("general/setErrorMsg", error.message || error, { root: true });
    }
  };