const hre = require("hardhat");
const symbolBusinessMapping = require('./utils/SymbolBusinessMapping.json');

const MAPPINGCONTRACTADDRESS = '0x4EBaF2c919B27330C8d20EcF7dfE9702275B2F20';

class MappingManager {
    async initializeContractReference() {
        // initialize reference to contract
        const [contractDeployer, ] = await hre.ethers.getSigners();

        this.mappingContract = new hre.ethers.Contract(MAPPINGCONTRACTADDRESS, symbolBusinessMapping.abi, contractDeployer);
    }

    async addNewBusiness(tokenSymbol, businessName, contractAddress){ 
        try {
            const addBusinessSwitch = await this.mappingContract.addNewBusiness(tokenSymbol, businessName, contractAddress);

            return addBusinessSwitch;
        } catch (err) {
            console.log(err);
        }

        return false;
    }

    async getFundingContractAddress(tokenSymbol){
        try {
            const fundingContractAddress = await this.mappingContract.getBusinessFundingContract(tokenSymbol);

            return fundingContractAddress;
        } catch (err) {
            console.log(err);
        }
        
        return undefined;
    }

    async getBusinessList(){
        // token symbols represent a business + funding round -- this is the identifier
        try {
            const businessList = await this.mappingContract.getTokenSymbols();

            return businessList;
        } catch (err) {
            console.log(err);
        }
        
        return undefined;
    }

    async isValidToken(tokenSymbol){
        try {
            const inTokenList = await this.mappingContract.searchToken(tokenSymbol);

            return inTokenList;
        } catch (err) {
            console.log(err);
        }

        return false;
    }
}

module.exports = MappingManager;