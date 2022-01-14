import * as express from 'express';
import { isNil, template } from 'lodash';
import { TemplateManager } from './templateManager';

// initialize app
var app = express();
app.use(express.json());
const SERVERPORT = 3000;

// providers and managers
const templateManager = TemplateManager();

// sb-input.txt
app.post('/api/sb_input', function(request, response){
    // second-pass validation
    const requestBody = request.body;

    const inputOptions = [
        requestBody.businessName,
        requestBody.fundingAmount, 
        requestBody.fundingPurpose, 
        requestBody.numTokensIssued
    ];

    if (inputOptions.includes(undefined)){
        send400(response, 'An invalid input option was provided.');
    }

    var fundingAmount = validateNumeric(requestBody.fundingAmount);

    if (isNil(fundingAmount)) { send400(response, 'Non-numeric funding amount provided') };

    var numTokensIssued = validateNumeric(requestBody.numTokensIssued);

    if (isNil(numTokensIssued)) { send400(response, 'Non-numeric token issue amount provided') };

    if (requestBody.businessName.length == 0){
        send400(response, 'Empty business name value.');
    } else if (requestBody.fundingPurpose.length == 0){
        send400(response, 'Empty funding purpose value.');
    }

    // to-do: deploy contract with input options
    templateManager.setTemplateValues(businessName, fundingAmount, fundingPurpose, numTokensIssued);

    const contractFileName = templateManager.generateSmartContractTemplate();
});

function send400(res, msg){
    res.status(400).json({ 'message': msg });
}

function validateNumeric(val){
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