import React from "react";
import { Navbar, Container } from "react-bootstrap";
import { useState } from "react";
import { shortenAddress } from "../../utils/shortenAddress";
import { useMoralisWeb3Api } from "react-moralis";
import { Card, Button, Row, Col } from "react-bootstrap";
import Content from "../Content"
import {concat} from 'uint8arrays'
import * as IPFS from 'ipfs-core'

export default function NavBar() {
  const [address, setAddress] = useState("");
  const [wallet, setWallet] = useState(false);
  const [nft, setNft] = useState([]);
  const Web3Api = useMoralisWeb3Api();


  async function checkIfConnected() {
    const isConnected = localStorage.getItem("address");
    //.log(isConnected);
    if (isConnected) {
      setAddress(isConnected);
      setWallet(true);
      const options = {
        chain: "mumbai",
        address: isConnected,
        // address: "0x75e3e9c92162e62000425c98769965a76c2e387a",
      };
      const polygonNFTs = await Web3Api.account.getNFTs(options);
      setNft(polygonNFTs.result);
      console.log("Hey",polygonNFTs.result);
      // console.log("Hey")
    }
  }
  //.log(nft);

  React.useEffect(() => {
    checkIfConnected();
    // //.log(nft)
  }, []);

  async function connectWithMetaMask() {
    if (window.ethereum) {
      window.ethereum
        .request({ method: "eth_requestAccounts" })
        .then(async (res) => {
          setAddress(res);
          setWallet(true);
          const add = shortenAddress(res);
          localStorage.setItem("address", res[0]);
          const options = {
            chain: "mumbai",
            address: res[0],
            // address: "0x75e3e9c92162e62000425c98769965a76c2e387a"
          };
          const polygonNFTs = await Web3Api.account.getNFTs(options);
          console.log(polygonNFTs);
        }).then(()=>{
          window.location.reload()
        });
    } else {
      alert("Please install the metamask extension");
    }
  }


  // //.log("Data",data)

  return (
    <div>
      <>
        <Navbar bg="">
          <Container>
            <div className="flex bg-white w-full justify-between">
              <div className="mt-2">
                <button
                  variant="primary"
                  className="border-2 border-black p-3 rounded-full"
                  onClick={connectWithMetaMask}
                >
                  <div className="flex">
                    <div>
                      <img
                        src="/assets/metamask.png"
                        width="50px"
                        height="50px"
                        alt=""
                      />
                    </div>
                    <div>{wallet ? address : "Connect with metamask"}</div>
                  </div>
                </button>
              </div>
            </div>
          </Container>  
        </Navbar>
        <br />
      </>
      {/* {JSON.parse(nft.metadata)} */}
      <Content/>
    </div>
  );
}
