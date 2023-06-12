import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { UpdateItemCommand, UpdateItemCommandOutput, DynamoDBClient, PutItemCommand, PutItemCommandOutput, QueryCommand, QueryCommandOutput } from "@aws-sdk/client-dynamodb";
import { SQSClient, SendMessageCommand, SendMessageCommandOutput } from "@aws-sdk/client-sqs";
import { SSMClient, GetParameterCommand, GetParameterCommandInput, GetParameterCommandOutput } from "@aws-sdk/client-ssm";
import Article from "./models/Article";
import ArticleCatalog from "./models/ArticleCatalog";
import { ArticleNotFoundError, ArticleCatalogNotFoundError, ArticleCatalogUploadError, ArticleUploadError } from "./models/Error";

const dynamodbClient = new DynamoDBClient({ region: "us-east-1" });
const sqsClient = new SQSClient({ region: "us-east-1"});

export const updateArticleReadCountToDB = async (firstPublished: number, lastModified: number): Promise<void> => {
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
  if (response["$metadata"]["httpStatusCode"] != 200) 
    throw new ArticleUploadError(firstPublished);
  // return response.$metadata.httpStatusCode
}

export const putArticleToDB = async (article: Article): Promise<void> => {
  const objectInDynamoDB = marshall(article, {convertClassInstanceToMap: true})
  const command: PutItemCommand = new PutItemCommand({Item: objectInDynamoDB, TableName: "articles"});
  const response: PutItemCommandOutput = await dynamodbClient.send(command);
  if (response["$metadata"]["httpStatusCode"] != 200) throw new ArticleUploadError(article["firstPublished"]);
}

export const getArticleFromDB = async (firstPublished: string): Promise<Article> => {
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
  return article;
}

export const getArticleCatalogFromDB = async (): Promise<ArticleCatalog> => {
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
  
  const articleCatalog: ArticleCatalog = unmarshall(response["Items"][0]) as ArticleCatalog;
  return articleCatalog;
}

export const putArticleCatalogToDB = async (articleCatalog: ArticleCatalog): Promise<void> => {
  const objectInDynamoDB = marshall(articleCatalog, {convertClassInstanceToMap: true})
  const command: PutItemCommand = new PutItemCommand({Item: objectInDynamoDB, TableName: "article-catalog"});
  const response: PutItemCommandOutput = await dynamodbClient.send(command);
  if (response["$metadata"]["httpStatusCode"] != 200) throw new ArticleCatalogUploadError();
}

export const pushMessageToQueue = async (firstPublished: string, queueUrl: string): Promise<void> => {
  const command: SendMessageCommand = new SendMessageCommand({MessageBody: firstPublished, QueueUrl: queueUrl});
  const response: SendMessageCommandOutput = await sqsClient.send(command);
}

export const getParameterFromSSM = async (ssmPath: string): Promise<string> => {
  const client: SSMClient = new SSMClient({ region: "us-east-1" });
  const params: GetParameterCommandInput = {Name: ssmPath};
  const command: GetParameterCommand = new GetParameterCommand(params);
  const response: GetParameterCommandOutput = await client.send(command);

  if (response["$metadata"]["httpStatusCode"] != 200) throw new Error(`SSM response status code is ${response["$metadata"]["httpStatusCode"]}`);
  if (response["Parameter"] == null) throw new Error(`SSM parameter path ${ssmPath} not found`);

  return response["Parameter"]["Value"];
}