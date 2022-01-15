const hre = require("hardhat");
const symbolBusinessMapping = require('./utils/SymbolBusinessMapping.json');

const MAPPINGCONTRACTADDRESS = '0x2ac9D7122eF1B82412B8e9619221eF7159154275';

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
    
        const storeSwitch = this.storeContractAddress();

        if (!storeSwitch) { return false };

        return true;
    }

    async storeContractAddress(){
        // store contract on chain
        const [contractDeployer, ] = await hre.ethers.getSigners();

        const mappingContract = new hre.ethers.Contract(MAPPINGCONTRACTADDRESS, symbolBusinessMapping.abi, contractDeployer);
    
        // contract
        const storeAddressSwitch = await mappingContract.addNewBusiness(this._tokenSymbol, this._businessName, this.contractAddress);

        return storeAddressSwitch;
    }

    async getContractAddress(){
        return this.contractAddress;
    }
}

module.exports = DeploymentManager;