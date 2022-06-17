
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract NFTMint is ERC721, ERC721Enumerable, Ownable {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIds;

    mapping (uint256 => string) public tokenURIs;
    mapping(address => uint256[]) public ownerToIds; 
    
    
    constructor(string memory _name , string memory _symbol) ERC721(_name, _symbol) {}


    function _beforeTokenTransfer(address from, address to, uint256 tokenId)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
    
    function mintNFT(address to,string memory _tokenURI) external returns (uint256) {
        _tokenIds.increment();
        uint256 newNftTokenId = _tokenIds.current();

        _mint(to, newNftTokenId);
        setTokenURI(newNftTokenId,_tokenURI);
        ownerToIds[to].push(newNftTokenId);
        return newNftTokenId;
    }
   
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");

        string memory uri=tokenURIs[tokenId];
        return uri;
        
    }
    
      function setTokenURI(uint256 tokenId, string memory _tokenURI) internal {
        require(_exists(tokenId), "ERC721URIStorage: URI set of nonexistent token");
        tokenURIs[tokenId] = _tokenURI;
    }
    
    
    
    function tokensOwnedByUser(address _owner) external view returns(uint256[] memory tokensowned){
        uint256 tokencount=balanceOf(_owner);
        for(uint256 i=1;i<=tokencount;i++){
        tokensowned[i] = tokenOfOwnerByIndex(_owner,i);
         }

        return tokensowned;
    }

}