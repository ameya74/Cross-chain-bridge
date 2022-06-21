import { useState, Fragment, useEffect } from "react";
import { Card, Button, Row, Col } from "react-bootstrap";
import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, SelectorIcon } from "@heroicons/react/solid";
import Web3 from "web3";
import sampleAbi from "../../utils/sampleABI.json";
import burnByPolygon from "../../utils/burnByPolygon.json";
import swal from "sweetalert";
import { useMoralisWeb3Api } from "react-moralis";
import Snackbar from "@mui/material/Snackbar";
import { api } from "../../utils/handler";
import burningChains from "../../utils/burningChains.json"
import mintingChains from "../../utils/mintingChains.json"

export default function Content(props) {

  const [selected, setSelected] = useState(burningChains[0]);
  const [selected2, setSelected2] = useState(mintingChains[1]);
  const [address, setAddress] = useState("");
  const [wallet, setWallet] = useState(false);
  const [data, setData] = useState({});
  const [nft, setNft] = useState([]);
  const [arr, setArr] = useState([]);
  const [metaData, setMetaData] = useState({});
  const [open, setOpen] = useState(false);
  const [burntChainUrl, setBurntChainUrl] = useState("");

  const Web3Api = useMoralisWeb3Api();

  //Function To chech whether metamask is connected or not
  async function checkIfConnected() {
    const isConnected = localStorage.getItem("address");
    if (isConnected) {
      setAddress(isConnected);
      setWallet(true);
      const options = {
        chain: "mumbai",
        address: isConnected,
      };
      const polygonNFTs = await Web3Api.account.getNFTs(options);
      setNft(polygonNFTs.result);
      console.log("Fetched NFTs", polygonNFTs.result);
    }
  }

  useEffect(() => {
    checkIfConnected();
  }, []);

  //Approve NFT => Burn NFT => API Call

  const approveNft = async (tokenData) => {
    
    console.log("tokenData", tokenData);
    console.log("Selected",selected)
    console.log("Selected 2",selected2)
    if (Object.keys(tokenData).length === 0) {
      alert("Please select a NFT first");
    } else {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        console.log(accounts);
        let userwalletaddresss = "0xa81784e6A9DDf986dB9681d23552e64633AC160A";
        window.web3 = new Web3(window.ethereum);
        let swaping = await new window.web3.eth.Contract(
          sampleAbi,
          tokenData.tokenAddress
        );

        swaping.methods
          .approve(
            selected.burningAddress, //burning chain contract address
            Number(tokenData.tokenId)
          )
          .send({ from: userwalletaddresss })
          .then(async (result) => {
            console.log(result);
            if (Object.keys(result).length > 0) {
              swal({
                title: "NFT Approved!",
                icon: "success",
              }).then(async () => {
                if (window.ethereum) {
                  const accounts = await window.ethereum.request({
                    method: "eth_requestAccounts",
                  });

                  let userwalletaddresss =
                    "0xa81784e6A9DDf986dB9681d23552e64633AC160A";
                  window.web3 = new Web3(window.ethereum);
                  let swaping = new window.web3.eth.Contract(
                    burnByPolygon,
                    selected.burningAddress //Burn chain TOKEN address
                  );

                  swaping.methods
                    .BurnNFTToken(
                      tokenData.tokenAddress, //NFT tokenadress
                      Number(tokenData.tokenId),
                      tokenData.tokenUri
                    )
                    .send({ from: userwalletaddresss })
                    .then((result) => {
                      console.log(result);
                      if (Object.keys(result).length > 0) {
                        swal({
                          title: "NFT Burnt Successfully!",
                          icon: "success",
                        }).then(async () => {
                          const endpoint = "api/checkPending";
                          const res = await api(
                            "POST",
                            {
                              latest: result.blockNumber,
                              burnChainURL: selected.rpcUrl,
                              mintChainURL: selected2.rpcUrl,
                              burnContractAddress: selected.burningAddress,
                              mintContractAddress: selected2.mintingAddress,
                              chainIdMint: selected2.chainId,
                              chainIdBurn: selected.chainId,
                              transactionHash: result.transactionHash,
                              tokenId: data.tokenId,
                              tokenAddress: data.tokenAddress,
                              metaData: metaData,
                              apiName:selected.apiName,
                              // nftData:tokenData.item
                            },
                            endpoint
                          );
                          console.log(res.data.data);
                        });
                      }
                    })
                    .catch();
                }
              });
            }
          })
          .catch();
      }
    }
  };

  //Handle change on selecting the different chains

  const handleChange = async (event) => {
    console.log(event);
    setSelected(burningChains[event.id - 1]);
    const filteredArray = mintingChains.filter((item) => {
      return item.id !== event.id;
    });
    console.log(filteredArray);
    setArr(filteredArray);
    setSelected2(filteredArray[0]);
    const chainId = event.chainId;
    setBurntChainUrl(event.rpcUrl);

    if (window.ethereum.networkVersion !== chainId) {
      try {
        window.web3 = new Web3(window.ethereum);
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: Web3.utils.toHex(chainId) }],
        });
        const options = {
          chain: event.apiName,
          address: address,
        };
        const polygonNFTs = await Web3Api.account.getNFTs(options);
        setNft(polygonNFTs.result);
        console.log("PolygonMfts", polygonNFTs.result);
        setOpen(false);
      } catch (err) {
        // This error code indicates that the chain has not been added to MetaMask
        if (err.code === 4902) {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainName: event.chainName,
                chainId: Web3.utils.toHex(chainId),
                nativeCurrency: {
                  name: event.nativeName,
                  decimals: 18,
                  symbol: event.symbol,
                },
                rpcUrls: [event.rpcUrl],
              },
            ],
          });
          const options = {
            chain: event.apiName,
            address: address,
          };
          const polygonNFTs = await Web3Api.account.getNFTs(options);
          setNft(polygonNFTs.result);
          console.log("PolygonMfts", polygonNFTs.result);
          setOpen(false);
        }
      }
    }
  };

  // Get NFT data on selecting a NFT
  const getNftData = (tokenId, tokenUri, tokenAddress, metadata, item) => {
    const tokenData = {
      tokenId: tokenId,
      tokenUri: tokenUri,
      tokenAddress: tokenAddress,
      // item:item
    };
    setData(tokenData);
    setMetaData(metadata);
    setOpen(true);
    console.log("MetaData",tokenAddress)
  };


  return (
    <div>
      <Row className="w-90 mx-auto">
        {nft.length > 0 ? (
          <>
            {nft.map((item) => {
              if(item.metadata!==null){
                const metaData = JSON.parse(item.metadata);
              item.imageUrl = metaData.image;
              return (
                <Col lg={1}>
                  <Button
                    variant="outline-dark"
                    className="p-1 border-4 border-black rounded-xl active:bg-red-500"
                    onClick={() =>
                      getNftData(
                        item.token_id,
                        item.token_uri,
                        item.token_address,
                        JSON.parse(item.metadata),
                        item
                      )
                    }
                  >
                    <img src={item.imageUrl} alt="" height={40} width={80} />
                  </Button>
                </Col>
              );
              }
              else{
                return (
                  <div></div>
                )
              }

            })}
          </>
        ) : (
          <>{wallet ? "No NFT in the selected chain" : ""}</>
        )}
      </Row>
      <div className="h-screen -mt-48">
        <div className="flex justify-center items-center h-full">
          <Card
            style={{
              width: "18rem",
              borderRadius: "40px",
              padding: "10px",
              borderWidth: "2px",
              borderColor: "black",
            }}
          >
            <Card.Body>
              <Card.Title className="text-center">
                Transfer NFTs between blockchains
              </Card.Title>
              <Listbox value={selected} onChange={handleChange}>
                <div className="relative mt-3">
                  <Listbox.Button className="relative w-full cursor-pointer rounded-lg bg-white py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
                    <span className="block truncate">{selected.name}</span>
                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                      <SelectorIcon
                        className="h-5 w-5 text-gray-400"
                        aria-hidden="true"
                      />
                    </span>
                  </Listbox.Button>
                  <Transition
                    as={Fragment}
                    leave="transition ease-in duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <Listbox.Options className="absolute mt-16 cursor-pointer max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                      {burningChains.map((person, personIdx) => (
                        <Listbox.Option
                          key={personIdx}
                          className={({ active }) =>
                            ` cursor-pointer py-2 px-2 ${active
                              ? "bg-amber-100 text-amber-900"
                              : "text-gray-900"
                            }`
                          }
                          value={person}
                        >
                          {({ selected }) => (
                            <div className="flex justify-between">
                              <div>
                                <img
                                  src={person.image}
                                  width="20px"
                                  height="20px"
                                  alt=""
                                />
                              </div>
                              <div
                                className={`block truncate ${selected ? "font-medium" : "font-normal"
                                  }`}
                              >
                                {person.name}
                              </div>
                            </div>
                          )}
                        </Listbox.Option>
                      ))}
                    </Listbox.Options>
                  </Transition>
                </div>
              </Listbox>
              <Listbox value={selected2} onChange={setSelected2}>
                <div className="relative mt-3">
                  <Listbox.Button className="relative w-full cursor-pointer rounded-lg bg-white py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
                    <span className="block truncate">{selected2.name}</span>
                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                      <SelectorIcon
                        className="h-5 w-5 text-gray-400"
                        aria-hidden="true"
                      />
                    </span>
                  </Listbox.Button>
                  <Transition
                    as={Fragment}
                    leave="transition ease-in duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <Listbox.Options className="absolute mt-1 cursor-pointer max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                      {arr.map((person, personIdx) => (
                        <Listbox.Option
                          key={personIdx}
                          className={({ active }) =>
                            ` cursor-pointer py-2 px-1 ${active
                              ? "bg-amber-100 text-amber-900 w-full"
                              : "text-gray-900"
                            }`
                          }
                          value={person}
                        >
                          {({ selected }) => (
                            <div className="flex justify-between">
                              <div>
                                <img
                                  src={person.image}
                                  width="20px"
                                  height="20px"
                                  alt=""
                                />
                              </div>
                              <div
                                className={`block truncate ${selected ? "font-medium" : "font-normal"
                                  }`}
                              >
                                {person.name}
                              </div>
                            </div>
                          )}
                        </Listbox.Option>
                      ))}
                    </Listbox.Options>
                  </Transition>
                </div>
              </Listbox>
              <Row className="mt-4 flex justify-center">
                <Button variant="primary" onClick={() => approveNft(data)}>
                  Transfer
                </Button>
              </Row>
            </Card.Body>
          </Card>
        </div>
      </div>
      <Snackbar
        open={open}
        message={`Token Id: ${data.tokenId},  Name: ${metaData.name}`}
      />
    </div>
  );
}
