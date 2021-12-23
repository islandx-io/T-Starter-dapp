import {ethers} from 'ethers'
import web3 from 'web3'

const POLLING_INTERVAL = 12000
const RPC_URL = "https://ropsten.infura.io/v3/070239498bd64e588d26301a8c2ef6e6"
export const getLibrary = () => {
    console.log("getLibrary")
    const httpProvider = new web3.providers.HttpProvider(RPC_URL)
    const web3NoAccount = new ethers.providers.Web3Provider(httpProvider)
    web3NoAccount.pollingInterval = POLLING_INTERVAL;
    return web3NoAccount
}


export const simpleRpcProvider = new ethers.providers.JsonRpcProvider(RPC_URL)