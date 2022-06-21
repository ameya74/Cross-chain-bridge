var Web3 = require("web3");
const config = require('./config.json');
const bridgeAbi = require('./nftAbi.json');
const swapbridgeAbi = require('./swapabi.json');

const GAS_LIMIT = config.GAS_LIMIT_bsc;

const OWNER_ADDRESS = config.OWNER_ADDRESS;
const pKey = config.pKey;


async function checkPending(latest,mintContractAddress,burnContractAddress,mintChainURL,burnChainURL,chainIdMint,transactionHash) {

    let mintData;
    
    const CHAIN_ID_bsc = chainIdMint;
    const swapContractAddress = mintContractAddress;
    const crossSwapContractAddress = burnContractAddress;

    const web3BSC = new Web3(new Web3.providers.HttpProvider(mintChainURL)); // for minting
    const web3Polygon = new Web3(new Web3.providers.HttpProvider(burnChainURL)); // for burning

    const SWAP_INSTANCE = new web3Polygon.eth.Contract(swapbridgeAbi,crossSwapContractAddress);
    
    // let test = await SWAP_INSTANCE.getPastEvents({},{fromBlock: latest-1,toBlock: latest})
    // console.log(test)

    return SWAP_INSTANCE.getPastEvents({},
    {
        fromBlock: latest-1,
        toBlock: latest // You can also specify 'latest'          
    })
    .then(async function (resp) {
        for (let i = 0; i < resp.length; i++) {
            if (resp[i].event === "BurnNFT" && resp[i].transactionHash===transactionHash) {
                console.log("burn token emitted");
                let isAlreadyProcessed = false;
                if(resp[i].returnValues.nonce) {
                    isAlreadyProcessed = await SWAP_INSTANCE.methods.nonceProcessed(resp[i].returnValues.nonce).call();
                }
                console.log(resp[i].returnValues[0]);
                if(!isAlreadyProcessed){
                    mintData = await SwapRequest(resp[i].returnValues[0],resp[i].returnValues[2],swapContractAddress,web3BSC,CHAIN_ID_bsc);
                }
                return mintData;
            }
        }
    
    })
    .catch((err) => console.error(err));
};


async function SwapRequest(to,tokenURI,swapContractAddress,web3BSC,CHAIN_ID_bsc){
    try 
    {  
       var contractAddress = swapContractAddress;
    //var gasLimit = GAS_LIMIT;
        
       var count = await web3BSC.eth.getTransactionCount(OWNER_ADDRESS);
       var chainId = CHAIN_ID_bsc;              
       var contract = await new web3BSC.eth.Contract(bridgeAbi , web3BSC); 
    

       var gasEstimatimate = await web3BSC.eth.estimateGas({
        "from"      : OWNER_ADDRESS,       
        "nonce"     : '0x' + count.toString(16), 
        "to"        : contractAddress,     
        "data"      : contract.methods.mintNFT(to,tokenURI).encodeABI()
      })

       const txobject = {
           "from": OWNER_ADDRESS,
           "nonce": "0x" + count.toString(16),
           "gasPrice": web3BSC.utils.toHex(web3BSC.utils.toWei('25', 'gwei')),
           "gasLimit": gasEstimatimate,
           "to": contractAddress,
           "value": "0x0",
           "data":contract.methods.mintNFT(to,tokenURI).encodeABI(),
           "chainId": chainId    
       }
           
       const signedTx = await web3BSC.eth.accounts.signTransaction(txobject, pKey);
       let mintAttempTimestamp = Date.now();
       let mintData = await web3BSC.eth.sendSignedTransaction(signedTx.rawTransaction)
       mintData["mintAttemptTimestamp"] = mintAttempTimestamp
       return mintData;
   } 
   catch (err) 
   {
     console.log(err);
   } 
}

module.exports = {
    checkPending
}


