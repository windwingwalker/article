"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const util_dynamodb_1 = require("@aws-sdk/util-dynamodb");
const error_1 = require("../../../model/error");
const http_response_1 = require("../../../model/http-response");
const dynamodbClient = new client_dynamodb_1.DynamoDBClient({ region: "us-east-1" });
exports.lambdaHandler = (event, context) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const command = new client_dynamodb_1.QueryCommand({
            TableName: "article-catalog",
            KeyConditionExpression: "#id = :id",
            ExpressionAttributeNames: {
                "#id": "id"
            },
            ExpressionAttributeValues: {
                ":id": { "N": "1" }
            },
            ScanIndexForward: false,
            Limit: 1
        });
        const response = yield dynamodbClient.send(command);
        if (response["$metadata"]["httpStatusCode"] == 200 && response["Count"] == 0)
            throw new error_1.ArticleCatalogNotFoundError();
        const articleIndex = (0, util_dynamodb_1.unmarshall)(response["Items"][0]);
        return new http_response_1.HTTPResponse(200, JSON.stringify(articleIndex));
    }
    catch (err) {
        console.error(err);
        return new http_response_1.HTTPResponse(err["status"], JSON.stringify({ "Error Message: ": err["message"] }));
    }
});
//# sourceMappingURL=remote-controller.js.map