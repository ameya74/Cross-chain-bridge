// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract NFTBridging
{
    bool pause; 

    address public owner;

    modifier onlyOwner {
      require(msg.sender == owner);
      _;
    }

    event BurnNFT(address owner,uint256 tokenID,string hash);
                                                                                                                      
    constructor(
        address _owner
    )
    {
       owner = _owner;
    }

    function paused()
      external
      onlyOwner
    {
        pause = true;
    }

    function unpaused()
       external
       onlyOwner
    {
       pause = false;
    }   

    function updateOwner(
        address _owner
    ) external onlyOwner
    {
        owner = _owner;
    }

    function BurnNFTToken(
        address _nftContractAddress,
        uint256 _tokenID,
        string memory hash
    ) external
    {
       IERC721(_nftContractAddress).transferFrom(
            msg.sender,
            address(this),
            _tokenID
        );
        
        emit BurnNFT(msg.sender,_tokenID,hash);
    }

}