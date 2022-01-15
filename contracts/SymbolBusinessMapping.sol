//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Counters.sol";
import "hardhat/console.sol";

import { StringUtils } from "./libraries/StringUtils.sol";

contract SymbolBusinessMapping {

    // define a business
    struct Business {
        string businessName;
        address contractAddress;
    }

    // define mapping
    mapping (string => Business) symbolBusinessMap;

    // store all token symbols
    string[] private tokenSymbols;

    function addNewBusiness(string memory tokenSymbol, string memory businessName, address fundingContractAddress) public returns (bool){
        Business memory business = Business(businessName, fundingContractAddress);

        symbolBusinessMap[tokenSymbol] = business;

        tokenSymbols.push(tokenSymbol);

        return true;
    }

    function getBusinessFundingContract(string memory tokenSymbol) public view returns (address){
        return symbolBusinessMap[tokenSymbol].contractAddress;
    }

    function getNumberOfContracts() public view returns (uint){
        return tokenSymbols.length;
    }

    function getTokenSymbols() public view returns (string[] memory){
        return tokenSymbols;
    }

    function searchToken(string memory tokenSymbol) public view returns (bool){
        uint idx;

        for (idx = 0; idx < tokenSymbols.length; idx++){
            if (StringUtils.equal(tokenSymbols[idx], tokenSymbol)){
                return true;
            }
        }

        return false;
    }
}