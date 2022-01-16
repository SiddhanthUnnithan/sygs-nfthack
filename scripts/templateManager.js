const fs = require('fs');

class TemplateManager {
    async setTemplateValues(businessName, fundingAmount, fundingPurpose, numTokens){
        this._businessName = businessName;
        this._fundingAmount = fundingAmount;
        this._fundingPurpose = fundingPurpose;
        this._tokenSupply = numTokens;
    }

    async getPartialTokenSymbol(){
        // logic: remove vowels from business namd and add current date time string
        let partialTokenSymbol = '';
        const vowels = ['a', 'e', 'i', 'o', 'u'];
        const businessNameLower = this._businessName.toLowerCase();

        for (let idx=0; idx < businessNameLower.length; idx++){
            if (vowels.indexOf(businessNameLower[idx]) === -1){
                partialTokenSymbol += businessNameLower[idx];
            }
        }

        return partialTokenSymbol;
    }

    async generateSmartContractTemplate(){
        const currentDateTimeString = String(Date.now());

        // to-do: generate symbol
        const partialTokenSymbol = await this.getPartialTokenSymbol();

        const generatedTokenSymbol = partialTokenSymbol + currentDateTimeString;

        const contractTemplate = `//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

import { Base64 } from "./libraries/Base64.sol";

contract ${generatedTokenSymbol}FundingContract is ERC721URIStorage, Ownable {
    // track token ids
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIds;

    uint256 private _tokenSupply = ${this._tokenSupply};

    string private _fundingDescription = '${this._fundingPurpose}';

    string private _tokenSymbol = '${generatedTokenSymbol}';

    constructor() ERC721 ("${this._businessName}Funding${currentDateTimeString}", "${generatedTokenSymbol}") {
        console.log('Initializing funding contract for ${this._businessName}.');
    }

    // token minting -- only contract owner can call
    function createFundingToken(address userAddress) public onlyOwner returns (uint256){
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
                        'UserToken", "description": "User token representing ${this._businessName} funding round of $${this._fundingAmount}.", "attributes": [{ "trait_type": "funding_purpose", "value": "',
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

        return newItemId;
    }
}
`       
        try {
            fs.writeFileSync(`./contracts/${generatedTokenSymbol}FundingContract.sol`, contractTemplate);
        } catch (err) {
            console.log(err);
            return undefined;
        }

        return generatedTokenSymbol;
    }
}

module.exports = TemplateManager;