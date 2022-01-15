const hre = require("hardhat");

async function run(){
    await hre.run("compile");

    await deployContract();
}

async function deployContract(){
    try {
        const contractFactory = await hre.ethers.getContractFactory('SymbolBusinessMapping');
        const contract = await contractFactory.deploy();
        await contract.deployed();

        console.log(`Contract address: ${contract.address}`);

    } catch (err) {
        console.log(err);
    }
}

run()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });