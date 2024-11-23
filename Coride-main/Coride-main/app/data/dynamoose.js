const dynamoose = require('dynamoose');
const AWS = require('aws-sdk');
const accessKeyId = "";
const secretAccessKey = "";
const region = "us-east-2";


// Set up connection from dynamoose
const ddb = new dynamoose.aws.ddb.DynamoDB({
    "credentials": {
        "accessKeyId": accessKeyId,
        "secretAccessKey": secretAccessKey
    },
    "region": region
});

// Credentials for aws-sdk
AWS.config.credentials = {
    "accessKeyId": accessKeyId,
    "secretAccessKey": secretAccessKey
}


// Set DynamoDB instance to the Dynamoose DDB instance
dynamoose.aws.ddb.set(ddb);
