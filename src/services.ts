import { articleIsExisted, pharseMarkdown, rewriteArticle, rewriteArticleCatalog } from "./functions";
import { getParameterFromSSM, getArticleCatalogFromDB, getArticleFromDB, pushMessageToQueue, putArticleCatalogToDB, putArticleToDB, updateArticleReadCountToDB } from "./io";
import Article from "./models/Article";
import ArticleCatalog from "./models/ArticleCatalog";
import HTTPResponse from "./models/HTTPResponse";
import PlainArticle from "./models/PlainArticle";

export const getArticleService = async (event): Promise<HTTPResponse> => {
  const firstPublished: string = event["queryStringParameters"]['firstPublished']
  const article: Article = await getArticleFromDB(firstPublished);
  return new HTTPResponse(200, article)
}

export const putArticleService = async (event): Promise<HTTPResponse> => {
  const markdownArticle: string = event["body"];
  const plainArticle: PlainArticle = pharseMarkdown(markdownArticle);
  var article: Article = new Article(plainArticle);
  var articleCatalog: ArticleCatalog = await getArticleCatalogFromDB();

  const articleIndex: number = articleIsExisted(articleCatalog, article);

  if (articleIndex != -1)
    article = rewriteArticle(articleCatalog, article, articleIndex)

  articleCatalog = rewriteArticleCatalog(articleCatalog, article, articleIndex)
  
  await putArticleToDB(article);
  await putArticleCatalogToDB(articleCatalog);

  return new HTTPResponse(200, article)
}

export const getArticleCatalogService = async (): Promise<HTTPResponse> => {
  const articleCatalog: ArticleCatalog = await getArticleCatalogFromDB()
  return new HTTPResponse(200, articleCatalog)
}

export const putArticleCatalogService = async (event): Promise<HTTPResponse>  => {
  const articleCatalog: ArticleCatalog = event["body"];
  await putArticleCatalogToDB(articleCatalog);
  return new HTTPResponse(200, articleCatalog)
}

export const scheduledPutArticleCatalogService = async (): Promise<HTTPResponse> => {
  var articleCatalog: ArticleCatalog = await getArticleCatalogFromDB()

  for (var i = 0; i < articleCatalog["body"].length; i++){
    const firstPublished: string = articleCatalog["body"][i]["firstPublished"].toString()
    const article: Article = await getArticleFromDB(firstPublished);

    articleCatalog["body"][i]["views"] = article["views"] 
  }
  await putArticleCatalogToDB(articleCatalog);
  return new HTTPResponse(200, articleCatalog)
}

export const postArticleReaderCountService = async (event): Promise<HTTPResponse> => {
  const firstPublished: string = event["queryStringParameters"]['firstPublished']
  var accountId: string = await getParameterFromSSM("/article/account-id")
  const sqs_queue_url = `https://sqs.us-east-1.amazonaws.com/${accountId}/article-reader-count`
  await pushMessageToQueue(firstPublished, sqs_queue_url);
  return new HTTPResponse(200, firstPublished)
}

export const sumArticleReaderCountService = async (event): Promise<HTTPResponse> => {
  const messageList = event["Records"]

  for (var message of messageList){
    const firstPublished: string = message["body"]
    console.info("Message is: " + firstPublished)                
    var article: Article = await getArticleFromDB(firstPublished);
  
    await updateArticleReadCountToDB(article["firstPublished"], article["lastModified"]);
  };
  return new HTTPResponse(200, `Successfully Updated ${messageList.length} views`);
}