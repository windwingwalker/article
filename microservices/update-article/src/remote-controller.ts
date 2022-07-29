import { DynamoDBClient, PutItemCommand, PutItemCommandOutput } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import { HTTPResponse } from "../../../model/http-response"
import { Article, ArticleCatalog, PlainArticle, StatusCode } from "../../../model/model";
import axios, { AxiosResponse } from "axios";
import { ArticleCatalogNotFoundError, ArticleCatalogUploadError, ArticleNotFoundError, ArticleUploadError } from "../../../model/error";

const dynamodbClient = new DynamoDBClient({ region: "us-east-1" });

const putArticle = async (article: Article): Promise<StatusCode> => {
  const objectInDynamoDB = marshall(article, {convertClassInstanceToMap: true})
  const command: PutItemCommand = new PutItemCommand({Item: objectInDynamoDB, TableName: "articles"});
  const response: PutItemCommandOutput = await dynamodbClient.send(command);
  return response["$metadata"]["httpStatusCode"]
}

const rewriteArticleCatalog = (articleCatalog: ArticleCatalog, article: Article, index: number): ArticleCatalog => {
  // Handle new article
  articleCatalog["body"][index] = {
    firstPublished: article["firstPublished"],
    lastModified: article["lastModified"],
    title: article["title"],
    subtitle: article["subtitle"],
    type: article["type"],
    edition: article["edition"],
    views: article["views"],
    tags: article["tags"],
    series: article["series"]
  }

  articleCatalog["lastModified"] = article["lastModified"];
  return articleCatalog;
}

const putArticleCatalog = async (articleCatalog: ArticleCatalog): Promise<number> => {
  const objectInDynamoDB = marshall(articleCatalog, {convertClassInstanceToMap: true})
  const command: PutItemCommand = new PutItemCommand({Item: objectInDynamoDB, TableName: "article-catalog"});
  const response: PutItemCommandOutput = await dynamodbClient.send(command);
  return response["$metadata"]["httpStatusCode"]
}

const articleIsExisted = (articleCatalog: ArticleCatalog, article: Article): number => {
  for (var i = 0; i < articleCatalog["body"].length; i++){
    if (articleCatalog["body"][i]["firstPublished"] == article["firstPublished"]){
      return i;
    }
  }
  return -1;
}

const rewriteArticle = (articleCatalog: ArticleCatalog, article: Article, index: number): Article => {
  article["edition"] = articleCatalog["body"][index]["edition"] != null ? articleCatalog["body"][index]["edition"] + 1 : article["edition"];
  article["views"] = articleCatalog["body"][index]["views"] != null ? articleCatalog["body"][index]["views"] : article["views"];
  return article;
}

exports.lambdaHandler = async (event, context) => {
  /**
   * 1) Receive article firstPublished in url query
   * 2) Receive plain article from other service 
   * 3) Create detailed article, i.e. Article object from plain article based on firstPublished
   * 4) Get the article catalog
   * 5) Check if article exists in the article catalog by article firstPublished
   * 6) If article exists, update first_published in article with old value, plus 1 to old edition
   * 7) If article do not exist, throw error
   * 8) Put article to db
   * 9) Update article catalog based on article
   * 10) Put article catalog to db
   */
  try {
    const firstPublished: number = +event["queryStringParameters"]['firstPublished']
    const plainArticle: PlainArticle = JSON.parse(event["body"]);
    var article: Article = new Article(plainArticle);

    const articleCatalogResponse: AxiosResponse = await axios.get(`https://${process.env.API_ID}.execute-api.us-east-1.amazonaws.com/prod/article-catalog`)
    if (articleCatalogResponse["status"] == 404) throw new ArticleCatalogNotFoundError();
    var articleCatalog: ArticleCatalog = articleCatalogResponse["data"] as ArticleCatalog;

    const pageIndex: number = articleIsExisted(articleCatalog, article);
    if (pageIndex == -1) throw new ArticleNotFoundError(article["firstPublished"]);

    article = rewriteArticle(articleCatalog, article, pageIndex)
    const articleStatusCode: number = await putArticle(article);
    if (articleStatusCode != 200) throw new ArticleUploadError(article["firstPublished"]);

    articleCatalog = rewriteArticleCatalog(articleCatalog, article, pageIndex)
    const catalogStatusCode: number = await putArticleCatalog(articleCatalog);
    if (catalogStatusCode != 200) throw new ArticleCatalogUploadError();

    return new HTTPResponse(200, JSON.stringify(article));
  } catch (err) {
    console.error(err);
    return new HTTPResponse(err["status"], JSON.stringify({"Error Message: ": err["message"]}));
  }
};
