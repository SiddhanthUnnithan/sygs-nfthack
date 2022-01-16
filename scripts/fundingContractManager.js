const hre = require("hardhat");
const MappingManager = require('./mappingManager');

class FundingContractManager {
    async initialize(tokenSymbol, contractAddress){
        try {            
            // get abi reference
            const contractName = `${tokenSymbol}FundingContract`
            const contractArtifact = require(`../artifacts/contracts/${contractName}.sol/${contractName}.json`);
            const contractAbi = contractArtifact.abi;

            // get contract reference
            const [contractDeployer, ] = await hre.ethers.getSigners();
            this.fundingContract = new hre.ethers.Contract(contractAddress, contractAbi, contractDeployer);
        } catch (err) {
            console.log(err);
            return false;
        }

        return true;
    }

    async mint(userAddress){
        try {
            const tokenId = await this.fundingContract.createFundingToken(userAddress);
            return tokenId;
        } catch (err){
            console.log(err);
            return undefined;
        }
    }

    async validateTokenExistence(userAddress){
        try {
            const balance = await this.fundingContract.balanceOf(userAddress);

            if (balance.isZero()){
                return false;
            }

            return true;
        } catch (err){
            console.log(err);
            return undefined;
        }
    }
}

module.exports = FundingContractManager;