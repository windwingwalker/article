import { DynamoDBClient, QueryCommand, QueryCommandOutput } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { ArticleCatalogNotFoundError } from "../../../model/error";
import { HTTPResponse } from "../../../model/http-response"
import { ArticleCatalog } from "../../../model/model";

const dynamodbClient = new DynamoDBClient({ region: "us-east-1" });

exports.lambdaHandler = async (event, context) => {
  try {
    const command = new QueryCommand({
      TableName: "article-catalog", 
      KeyConditionExpression: "#id = :id",
      ExpressionAttributeNames:{
        "#id": "id"
      },
      ExpressionAttributeValues: {
        ":id": {"N": "1"}
      },
      ScanIndexForward: false,
      Limit: 1
    })
    const response: QueryCommandOutput = await dynamodbClient.send(command);
    if (response["$metadata"]["httpStatusCode"] == 200 && response["Count"] == 0) throw new ArticleCatalogNotFoundError();
    
    const articleIndex: ArticleCatalog = unmarshall(response["Items"][0]) as ArticleCatalog;
    return new HTTPResponse(200, JSON.stringify(articleIndex));
  } catch (err) {
    console.error(err);
    return new HTTPResponse(err["status"], JSON.stringify({"Error Message: ": err["message"]}));
  }
};
