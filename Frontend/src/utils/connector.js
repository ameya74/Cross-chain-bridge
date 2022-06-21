module.exports.ConnectWithMetaMask = async () => {
  if(window.ethereum){
      // const web3=new web3(window.ethereum)
      window.ethereum
      .request({ method: "eth_requestAccounts" })
      .then((res) => console.log(res));
//       const chainId = 137; // Polygon Mainnet

//   if (window.ethereum.networkVersion !== chainId) {
//     try {
//       await window.ethereum.request({
//         method: "wallet_switchEthereumChain",
//         params: [{ chainId: web3.utils.toHex(chainId) }],
//       });
//     } catch (err) {
//       // This error code indicates that the chain has not been added to MetaMask
//       if (err.code === 4902) {
//         await window.ethereum.request({
//           method: "wallet_addEthereumChain",
//           params: [
//             {
//               chainName: "Polygon Mainnet",
//               chainId: web3.utils.toHex(chainId),
//               nativeCurrency: { name: "MATIC", decimals: 18, symbol: "MATIC" },
//               rpcUrls: ["https://polygon-rpc.com/"],
//             },
//           ],
//         });
//       }
//   }
// }
  }
  
   else {
    alert("Please install the metamask extension");
  }
};
