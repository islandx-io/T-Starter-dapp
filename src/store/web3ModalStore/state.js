import {getLibrary} from "src/utils/web3";

export default function () {
  return {
    web3Modal: null,

    library: {},
    active: false,
    account: null,
    chainId: 0,
  };
}
