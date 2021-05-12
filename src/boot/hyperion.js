import axios from "axios";

let hyperion = null;

export default async ({ Vue, store }) => {
  // set and get blockchain
  if (localStorage.getItem("selectedChain") != null) {
    await store.dispatch("blockchains/setNewChain", localStorage.getItem("selectedChain"))
  } else {
    await store.dispatch("blockchains/setNewChain", "TELOS")
  }
  let currentChain = store.getters['blockchains/currentChain'];
  console.log(currentChain)

  hyperion = axios.create({
    baseURL: currentChain.HYPERION_ENDPOINT
  });


  Vue.prototype.$hyperion = hyperion;
};

export { hyperion };
