import { DynamoDBClient, UpdateItemCommand, UpdateItemCommandOutput } from "@aws-sdk/client-dynamodb";
import { HTTPResponse } from "../../../model/http-response"
import { Article, StatusCode } from "../../../model/model";
import axios, { AxiosResponse } from "axios";
import { ArticleNotFoundError, ArticleUploadError } from "../../../model/error";
import { SQSHandler, SQSEvent } from "aws-lambda";

const dynamodbClient = new DynamoDBClient({ region: "us-east-1" });

const updateArticle = async (firstPublished: number, lastModified: number): Promise<StatusCode> => {
  const command: UpdateItemCommand = new UpdateItemCommand({
    Key: {
      "firstPublished": {'N': firstPublished.toString()},
      "lastModified": {'N': lastModified.toString()}
    },
    UpdateExpression: 'SET #views = #views + :incr',    
    ExpressionAttributeValues: { ':incr': {'N': '1'}},
    ExpressionAttributeNames: { "#views": "views"},
    TableName: "articles"
  });
  const response: UpdateItemCommandOutput = await dynamodbClient.send(command);
  return response.$metadata.httpStatusCode
}

interface SQSRecord{
  messageId: string,
  receiptHandle: string,
  body: string,
  attributes: any
  messageAttributes: any
  md5OfBody: string
  eventSource: string
  eventSourceARN: string
  awsRegion: string
}

exports.lambdaHandler = async (event: SQSEvent, context) => {
  /**
   * 1) Get message list from event, and loop the following
   * 2) Get article firstPublished from message
   * 3) Get the article based on article firstPublished
   * 4) Update article's views, and update article's view attribute to db
   */
  try {
    const messageList: SQSRecord[] = event["Records"]
    console.info("Message length is: " + messageList.length)

    for (var message of messageList){
      const firstPublished: string = message["body"]
      console.info("Message is: " + firstPublished)

      const articleResponse: AxiosResponse = await axios.get(`https://${process.env.API_ID}.execute-api.us-east-1.amazonaws.com/prod/article?firstPublished=${firstPublished}`)
      if (articleResponse["status"] == 404) throw new ArticleNotFoundError(firstPublished);
      var article: Article = articleResponse["data"] as Article;
    
      const articleStatusCode: number = await updateArticle(article["firstPublished"], article["lastModified"]);
      if (articleStatusCode != 200) throw new ArticleUploadError(article["firstPublished"]);
    };

    return new HTTPResponse(200, "Successfully Updated Views");
  } catch (err) {
    console.error(err);
    return new HTTPResponse(err["status"], JSON.stringify({"Error Message: ": err["message"]}));
  }
};
