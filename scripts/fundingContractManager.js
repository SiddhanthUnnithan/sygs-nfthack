const hre = require("hardhat");
const MappingManager = require('./mappingManager');

class FundingContractManager {
    async initialize(tokenSymbol, contractAddress){
        try {
            const contractAddress = contractAddress;
            const tokenSymbol = tokenSymbol;
            
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
            await this.fundingContract.mint(userAddress);
        } catch (err){
            console.log(err);
            return false;
        }

        return true;
    }

    async burn(userAddress){
        return;
    }
}

module.exports = FundingContractManager;