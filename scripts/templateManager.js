const fs = require('fs');

class TemplateManager {
    async setTemplateValues(businessName, fundingAmount, fundingPurpose, numTokens){
        this.businessName = businessName;
        this.fundingAmount = fundingAmount;
        this.fundingPurpose = fundingPurpose;
        this.tokenSupply = numTokens;
    }

    async generateSmartContractTemplate(){
        const currentDateTimeString = '1142021';

        // to-do: generate symbol
        const generatedTokenSymbol = 'TSTTKN';

        const contractTemplate = `//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

import { Base64 } from "./libraries/Base64.sol";

contract ${this.businessName}FundingContract is ERC721URIStorage, Ownable {
    // track token ids
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIds;

    uint256 private _tokenSupply = ${this.tokenSupply};

    string private _fundingDescription = '${this.fundingPurpose}';

    string private _tokenSymbol = '${generatedTokenSymbol}';

    constructor() ERC721 ("${this.businessName}Funding${currentDateTimeString}", "${generatedTokenSymbol}") {
        console.log('Initializing funding contract for ${this.businessName}.');
    }

    // token minting -- only contract owner can call
    function createFundingToken(address userAddress) public onlyOwner {
        uint256 newItemId = _tokenIds.current();
        
        // confirm that we haven't exceeded the token supply
        require(newItemId < _tokenSupply, '${generatedTokenSymbol}: Token supply limit reached. Unable to mint.');

        // json metadata to store on chain
        string memory encodedJson = Base64.encode(
            bytes(
                string(
                    abi.encodePacked(
                        '{ "name": "',
                        // name: {tokenSymbol}UserToken
                        _tokenSymbol,
                        'UserToken", "description": "User token representing ${this.businessName} funding round of $${this.fundingAmount}.", "attributes": [{ "trait_type": "funding_purpose", "value": "',
                        _fundingDescription,
                        '"}]'
                    )
                )
            )
        );

        // create the final token URI
        string memory finalTokenUri = string(
            abi.encodePacked("data:application/json;base64", encodedJson)
        );

        console.log("\\n--------------------");
        console.log(finalTokenUri);
        console.log("--------------------\\n");

        // mint nft with user address
        _safeMint(userAddress, newItemId);

        _setTokenURI(newItemId, finalTokenUri);

        console.log('An NFT with the ID %s has been minted to %s', newItemId, userAddress);

        _tokenIds.increment();
    }
}
`       
        try {
            fs.writeFileSync(`../contracts/${generatedTokenSymbol}-private.sol`, contractTemplate);
        } catch (err) {
            return undefined;
        }

        return generatedTokenSymbol;
    }
}

module.exports = TemplateManager;