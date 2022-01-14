const TemplateManager = require("../scripts/templateManager");

const templateManager = new TemplateManager();

const businessName = 'TestBusiness';
const fundingAmount = 1000;
const fundingPurpose = 'Need money to buy NFTs.'
const tokenSupply = 100; // $10 denominations

async function run(){
    await templateManager.setTemplateValues(businessName, fundingAmount, fundingPurpose, tokenSupply);

    const fileName = await templateManager.generateSmartContractTemplate();

    console.log(fileName);
}

run();

