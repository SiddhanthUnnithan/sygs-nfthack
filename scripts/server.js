const { request, response } = require('express');
const express = require('express');
const lodash = require('lodash');
const cors = require('cors');
const DeploymentManager = require('./deploymentManager');
const MappingManager = require('./mappingManager');
const TemplateManager = require("./templateManager");
const FundingContractManager = require("./fundingContractManager");

// initialize app
var app = express();
app.use(cors());
app.use(express.json());
const SERVERPORT = 5678;

// providers and managers
const templateManager = new TemplateManager();
const deploymentManager = new DeploymentManager();
const mappingManager = new MappingManager();
const fundingContractManager = new FundingContractManager();

app.get("/", async function(request, response){
    response.status(200).json({'message': 'Hello from Sygs API!'});
});

// sb-input.txt
app.post('/api/sb_input', async function(request, response){
    // second-pass validation
    const requestBody = request.body;

    console.log(requestBody);
        
    const inputOptions = [
        requestBody.businessName,
        requestBody.fundingAmount, 
        requestBody.fundingPurpose, 
        requestBody.numTokensIssued
    ];

    if (inputOptions.includes(undefined)){
        send400(response, 'An invalid input option was provided.');
    }

    var fundingAmount = await validateNumeric(requestBody.fundingAmount);

    if (lodash.isNil(fundingAmount)) { send400(response, 'Non-numeric funding amount provided'); };

    var numTokensIssued = await validateNumeric(requestBody.numTokensIssued);

    if (lodash.isNil(numTokensIssued)) { send400(response, 'Non-numeric token issue amount provided'); };

    if (requestBody.businessName.length == 0){
        send400(response, 'Empty business name value.');
    } else if (requestBody.fundingPurpose.length == 0){
        send400(response, 'Empty funding purpose value.');
    }

    await templateManager.setTemplateValues(requestBody.businessName, fundingAmount, requestBody.fundingPurpose, numTokensIssued);

    const contractTokenSymbol = await templateManager.generateSmartContractTemplate();

    if (lodash.isNil(contractTokenSymbol)) { send500(response, 'Unable to generate contract template.'); };

    // contract name is <tokenSymbol>FundingPrivate.sol
    const contractName = `${contractTokenSymbol}FundingContract`;

    await deploymentManager.setDeploymentValues(contractName, contractTokenSymbol, requestBody.businessName);

    // to-optimize: compile contract before deploying
    const compileContractSwitch = await deploymentManager.compileContract();

    if (!compileContractSwitch) { send500(response, 'Unable to compile contracts.'); };

    const deployContractSwitch = await deploymentManager.deployContract();

    if (!deployContractSwitch) { send500(response, 'Unable to deploy contract.'); };

    const deployedContractAddress = await deploymentManager.getContractAddress();

    response.status(200).json({ 'message': 'Successfully deployed business contract.', 'contractAddress': deployedContractAddress});
});

app.get('/api/get_token_symbols', async function (request, response){
    await mappingManager.initializeContractReference();

    const businessList = await mappingManager.getBusinessList();

    if (lodash.isNil(businessList)){
        response.status(500).json({ 'message': 'Unable to retrieve list of businesses.' });
    }

    response.status(200).json({ 'message': 'Retrieved list of businesses.', 'businessList': businessList });
});

app.get('/api/get_contract_address', async function (request, response){
    const tokenSymbol = request.body.tokenSymbol;
    
    if (lodash.isNil(tokenSymbol)){
        send400(response, 'Invalid token symbol provided.');
    }

    await mappingManager.initializeContractReference();

    const validTokenSwitch = await mappingManager.isValidToken(tokenSymbol);

    if (!validTokenSwitch){
        send400(response, 'Token not found.');
    }

    const fundingContractAddress = await mappingManager.getFundingContractAddress(tokenSymbol);

    if (lodash.isNil(fundingContractAddress)){
        send400(response, 'Unable to retrieve funding contract address for provided token.');
    }

    response.status(200).json({ 'message': 'Retrieved funding contract address', 'fundingContractAddress': fundingContractAddress });
});

app.post('/api/mint', async function (request, response){
    if (lodash.isNil(request.body.tokenSymbol) || lodash.isNil(request.body.userAddress)){
        send400(response, 'One or more of the request options was invalid.');
    }

    // get contract address based on token symbol
    await mappingManager.initializeContractReference();

    const fundingContractAddress = mappingManager.getFundingContractAddress(tokenSymbol);

    if (lodash.isNil(fundingContractAddress)){
        send400(response, `Unable to get contract address for token symbol: ${tokenSymbol}`);
    }

    const initFcManagerSwitch = await fundingContractManager.initialize(request.body.tokenSymbol, fundingContractAddress);

    if (!initFcManagerSwitch) {
        send500(response, 'Unable to create contract reference for minting.');
    }

    const mintSwitch = await fundingContractManager.mint(request.body.userAddress);

    if (!mintSwitch){
        send500(response, 'Unable to mint.');
    }
});

function send400(res, msg){
    res.status(400).json({ 'message': msg });
}

function send500(res, msg){
    res.status(500).json({ 'message': msg });
}

function sendJsonResponse(res, msg){
    res.status(200).json({ 'message': msg });
}

async function validateNumeric(val){
    try{
        var numericVal = Number(val);
        return numericVal;
    } catch (err){
        return undefined;
    }
}

app.listen(SERVERPORT, function(err){
    if (err){
        console.log(err);
        return;
    }

    console.log(`Server listening on port: ${SERVERPORT}`);
});