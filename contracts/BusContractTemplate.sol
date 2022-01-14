//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/ownership/Ownable.sol";
import "hardhat/console.sol";

contract ReplaceWithBusinessNameFundingContract is ERC721URIStorage, Ownable {
    // track token ids
    using Counters for Cunters.Counter;

    Counters.Counter private _tokenIds;

    uint256 private _tokenSupply = ReplaceWithTokenSupply;

    string private _fundingDescription = 'ReplaceWithFundingPurpose';

    string private _tokenSymbol = 'ReplaceWithTokenSymbol';

    constructor() ERC721 ("ReplaceWithBusinessNameFundingReplaceWithCurrentDateTimeToken", "ReplaceWithTokenSymbol") {
        console.log('Initializing funding contract for ReplaceWithBusinessName.');
    }

    // token minting -- only contract owner can call
    function createFundingToken(address userAddress) public ownlyOwner returns (uint){
        uint256 newItemId = _tokenIds.current();
        
        // confirm that we haven't exceeded the token supply
        require(newItemId < _tokenSupply, 'ReplaceWithTokenSymbol: Token supply limit reached. Unable to mint.');

        // json metadata to store on chain
        string memory encodedJson = Base64.encode(
            bytes(
                string(
                    abi.encodePacked(
                        '{ "name": "',
                        // name: {tokenSymbol}UserToken
                        _tokenSymbol,
                        'UserToken", "description": "User token representing ReplaceWithBusinessName funding round.", "attributes": [{ "trait_type": "funding_purpose", "value": "',
                        _fundingDescription,
                       '"}]'
                )
            )
        );

        // create the final token URI
        string memory finalTokenUri = string(
            abi.encodePacked("data:application/json;base64", encodedJson)
        );

        console.log("\n--------------------");
        console.log(finalTokenUri);
        console.log("--------------------\n");

        // mint nft with user address
        _safeMint(userAddress, newItemId);

        _setTokenURI(newItemId, finalTokenUri);

        console.log('An NFT with the ID %s has been minted to %s', newItemId, userAddress);

        _tokenIds.increment();
    }
}