import { DynamoDBClient, QueryCommand, QueryCommandOutput } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { HTTPResponse } from "../../../model/http-response"
import { Article } from "../../../model/model";
import { ArticleNotFoundError } from "../../../model/error";

const dynamodbClient = new DynamoDBClient({ region: "us-east-1" });

exports.lambdaHandler = async (event, context) => {
  try {
    const firstPublished: string = event["queryStringParameters"]['firstPublished']
    const queryCommand = new QueryCommand({
      TableName: "articles", 
      KeyConditionExpression: "#firstPublished = :firstPublished",
      ExpressionAttributeNames:{
        "#firstPublished": "firstPublished"
      },
      ExpressionAttributeValues: {
        ":firstPublished": {"N": firstPublished}
      },
      ScanIndexForward: false,
      Limit: 1
      })
    const response: QueryCommandOutput = await dynamodbClient.send(queryCommand);
    if (response["$metadata"]["httpStatusCode"] == 200 && response["Count"] == 0) throw new ArticleNotFoundError(firstPublished);
    
    const article: Article = unmarshall(response["Items"][0]) as Article;
    return new HTTPResponse(200, JSON.stringify(article));
  } catch (err) {
    console.error(err);
    return new HTTPResponse(err["status"], JSON.stringify({"Error Message: ": err["message"]}));
  }
};
