const express = require('express');
const lodash = require('lodash');
const DeploymentManager = require('./deploymentManager');
const TemplateManager = require("./templateManager");

// initialize app
var app = express();
app.use(express.json());
const SERVERPORT = 3000;

// providers and managers
const templateManager = new TemplateManager();
const deploymentManager = new DeploymentManager();

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