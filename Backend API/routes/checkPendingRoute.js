const express = require("express");
const router = express.Router();
const {mqttC} = require("../utils/mqtt");
const axios = require('axios').default;
require("dotenv").config()


const {checkPending} = require("../bscSwap");

router.post("/checkPending",async(req,res) =>{
    try{
        let finalData = {}
        const {latest,mintChainURL,burnChainURL,mintContractAddress,burnContractAddress,chainIdMint,chainIdBurn,transactionHash,tokenAddress,tokenId,metaData,apiName,burnAttemptTimestamp} = req.body;
        let mintResponse = await checkPending(latest,mintContractAddress,burnContractAddress,mintChainURL,burnChainURL,chainIdMint,transactionHash);
        if(!mintResponse){
            return res.status(401).json({
                status:false,
                msg:"There is an error in minting."
            })
        }
        let response = await axios({
            method:"get",
            url:`https://deep-index.moralis.io/api/v2/nft/${tokenAddress}/${tokenId}/transfers?chain=${apiName}&format=decimal`,
             //make dyanamic
            // url:`https://deep-index.moralis.io/api/v2/nft/${tokenAddress}/${tokenId}/transfers?chain=eth&format=decimal`, //make dyanamic
            headers:{
                Accept:"application/json",
                "Content-Type":"application/json; charset=UTF-8",
                "x-api-key":process.env.MORALIS_X_API_KEY
            }
        })
        // console.log(response.data.result)
        for(let i=0;i<response.data.result.length;i++){
            // console.log("hello")
            if(response.data.result[i].transaction_hash===transactionHash){
                finalData.burnTimestamp=response.data.result[i].block_timestamp
            }else if(response.data.result[i].transaction_hash===mintResponse.logs[0].transactionHash){
                finalData.mintTimestamp=response.data.result[i].block_timestamp
            }
        }
        finalData.trasactions = response.data
        finalData.burnHash = transactionHash,
        finalData.metaData = metaData
        finalData.mintHash = mintResponse.logs[0].transactionHash
        finalData.mintAttemptTimestamp = mintResponse.mintAttemptTimestamp
        finalData.burnAttemptTimestamp = burnAttemptTimestamp
        console.log("FinalData",finalData)
        await mqttC(finalData)
        res.status(200).json({
            status:true,
            msg:"Data sent to MQTT successfully.",
            data:finalData
        })
        
    }catch(err){
        console.log(err)
        return res.status(500).json({
            status:false,
            msg:err.message
        })
    }
})

module.exports = router;