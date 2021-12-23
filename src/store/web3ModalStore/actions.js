import {ethers} from "ethers";
import {parseInt} from 'lodash'

export async function connect({ state, commit, dispatch }) {
  console.log("connect")
  const provider = await state.web3Modal.connect();

  const library = new ethers.providers.Web3Provider(provider);

  library.pollingInterval = 12000;
  commit("setLibrary", library);

  const accounts = await library.listAccounts();
  if (accounts.length > 0) {
    commit("setAccount", accounts[0]);
  }
  const network = await library.getNetwork();
  commit("setChainId", network.chainId);
  commit("setActive", true);

  provider.on("connect", async (info) => {
    let chainId = parseInt(info.chainId);
    commit("setChainId", chainId);
    console.log("connect", info);
  });

  provider.on("accountsChanged", async (accounts) => {
    if (accounts.length > 0) {
      commit("setAccount", accounts[0]);
    } else {
      await dispatch("resetApp");
    }
    console.log("accountsChanged");
  });
  provider.on("chainChanged", async (chainId) => {
    chainId = parseInt(chainId);
    commit("setChainId", chainId);
    console.log("chainChanged", chainId);
  });
}

export async function resetApp({ state, commit }) {
  console.log("resetApp")
  try {
    await state.web3Modal.clearCachedProvider();
  } catch (error) {
    console.error(error);
  }
  commit("setAccount", null);
  commit("setActive", false);
  commit("setLibrary", getLibrary());
}
