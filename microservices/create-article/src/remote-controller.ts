import { DynamoDBClient, PutItemCommand, PutItemCommandOutput } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import { HTTPResponse } from "../../../model/http-response"
import { Article, ArticleCatalog, ArticleMetadata, PlainArticle, StatusCode } from "../../../model/model";
import axios, { AxiosResponse } from "axios";
import { ArticleCatalogNotFoundError, ArticleCatalogUploadError, ArticleUploadError } from "../../../model/error";

const dynamodbClient = new DynamoDBClient({ region: "us-east-1" });

const putArticle = async (article: Article): Promise<StatusCode> => {
  const objectInDynamoDB = marshall(article, {convertClassInstanceToMap: true})
  const command: PutItemCommand = new PutItemCommand({Item: objectInDynamoDB, TableName: "articles"});
  const response: PutItemCommandOutput = await dynamodbClient.send(command);
  return response.$metadata.httpStatusCode
}

const rewriteArticleCatalog = (articleCatalog: ArticleCatalog, article: Article): ArticleCatalog => {
  var filoArticles: ArticleMetadata[] = articleCatalog["body"]
  var fifoArticles: ArticleMetadata[] = filoArticles.reverse();

  fifoArticles.push({
    firstPublished: article["firstPublished"], 
    lastModified: article["lastModified"], 
    title: article["title"], 
    subtitle: article["subtitle"],
    type: article["type"],
    edition: article["edition"],
    views: article["views"],
    tags: article["tags"],
    series: article["series"]
  });
  
  filoArticles = fifoArticles.reverse();

  articleCatalog["body"] = filoArticles;
  articleCatalog["count"]++;
  articleCatalog["lastModified"] = article["lastModified"];
  return articleCatalog;
}

const putArticleCatalog = async (articleCatalog: ArticleCatalog): Promise<number> => {
  const objectInDynamoDB = marshall(articleCatalog, {convertClassInstanceToMap: true})
  const command: PutItemCommand = new PutItemCommand({Item: objectInDynamoDB, TableName: "article-catalog"});
  const response: PutItemCommandOutput = await dynamodbClient.send(command);
  return response.$metadata.httpStatusCode
}

exports.lambdaHandler = async (event, context) => {
  /**
   * 1) Receive plain article from other microservice
   * 2) Create article from plain article
   * 3) Get the article catalog
   * 4) Update article catalog based on article
   * 5) Put article to db
   * 6) Put article catalog to db if 5) succeed
   */
  try {
    const plainArticle: PlainArticle = JSON.parse(event["body"]);
    var article: Article = new Article(plainArticle);

    const articleCatalogResponse: AxiosResponse = await axios.get<ArticleCatalog>("https://api.windwingwalker.xyz/article/article-catalog")
    if (articleCatalogResponse["status"] == 404) throw new ArticleCatalogNotFoundError();
    var articleCatalog: ArticleCatalog = articleCatalogResponse["data"] as ArticleCatalog;

    const articleStatusCode: number = await putArticle(article);
    if (articleStatusCode != 200) throw new ArticleUploadError(article["firstPublished"]);

    articleCatalog = rewriteArticleCatalog(articleCatalog, article);
    const catalogStatusCode: number = await putArticleCatalog(articleCatalog);
    if (catalogStatusCode != 200) throw new ArticleCatalogUploadError();

    return new HTTPResponse(200, JSON.stringify(article));
  } catch (err) {
    console.error(err);
    return new HTTPResponse(err["status"], JSON.stringify({"Error Message: ": err["message"]}));
  }
};
