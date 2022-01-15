const hre = require("hardhat");
const MappingManager = require("./mappingManager");
const symbolBusinessMapping = require('./utils/SymbolBusinessMapping.json');

const MAPPINGCONTRACTADDRESS = '0x2ac9D7122eF1B82412B8e9619221eF7159154275';

// providers and managers
const mappingManager = new MappingManager();

class DeploymentManager {
    async setDeploymentValues(contractName, tokenSymbol, businessName){
        this._contractName = contractName;
        this._tokenSymbol = tokenSymbol;
        this._businessName = businessName;
    }

    async compileContract(){
        try {
            await hre.run("compile");
            return true;
        } catch (err) {
            console.log(err);
            return false;
        }
    }

    async deployContract(){
        try {
            const contractFactory = await hre.ethers.getContractFactory(this._contractName);
            const contract = await contractFactory.deploy();
            await contract.deployed();

            this.contractAddress = contract.address;

            console.log(`Deployed contract address: ${this.contractAddress}`);
        } catch (err) {
            console.log(err);
            return false;
        }
        
        const addBusinessSwitch = await mappingManager.addNewBusiness(this._tokenSymbol, this._businessName, this.contractAddress);

        if (!addBusinessSwitch) { return false };

        return true;
    }

    async getContractAddress(){
        return this.contractAddress;
    }
}

module.exports = DeploymentManager;