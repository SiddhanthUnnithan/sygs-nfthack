const hre = require("hardhat");
const { isNil } = require("lodash");
const PrivateConstantsManager = require("./utils/privateConstants");

// to-do: change to be environment based (vars)
const targetNetwork = 'rinkeby';
const privateConstantsManager = new PrivateConstantsManager();
const alchemyApiKey = privateConstantsManager.getConstant('alchemyApiKey');

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
            const tokenIdObj = await this.fundingContract.createFundingToken(userAddress);

            console.log(`Minting txn: tokenIdObj['hash']`);
            
            try {
                // return the token id if the transaction is successful
                const provider = new hre.ethers.getDefaultProvider('rinkeby', {
                    alchemy: alchemyApiKey
                });

                const txnReceipt = await provider.waitForTransaction(tokenIdObj['hash']);

                const tokenId = txnReceipt.logs[0].topics[3];

                // hack -- convert the returned string into a numeric token
                const numericTokenId = await this._tokenIdStringToNumeric(tokenId);

                if (isNil(numericTokenId)) { return { successfulMint: true, tokenId: numericTokenId } };

                return { successfulMint: true, tokenId: numericTokenId };

            } catch (err) {
                console.log(err);

                return { successfulMint: true, tokenId: undefined };
            }

        } catch (err){
            console.log(err);
            return { successfulMint: false, tokenId: undefined };
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

    async _tokenIdStringToNumeric(tokenIdString){
        // param value: 0x00...00[N]
        // split on 'x' and strip 0
        const tokenIdSplit = tokenIdString.split('x');
        const tokenIdTrimmed = tokenIdSplit[1].replace(new RegExp('0', 'g'), '');

        if (tokenIdTrimmed.length === 0){
            return undefined
        }

        try {
            const numericTokenId = Number(tokenIdTrimmed);

            return numericTokenId;
        } catch (err) {
            console.log(err);
            return undefined
        }
    }
}

module.exports = FundingContractManager;