import { articleIsExisted, pharseMarkdown, rewriteArticle, rewriteArticleCatalog } from "./functions";
import { getParameterFromSSM, pushMessageToQueue } from "./io";
import Article from "./models/Article";
import ArticleCatalog from "./models/ArticleCatalog";
import HTTPResponse from "./models/HTTPResponse";
import PlainArticle from "./models/PlainArticle";
import { createArticleStore } from "./articleStore";
import { createSqsReaderCountQueue } from "./readerCountQueue";
import { drainArticleReaderCounts } from "./viewCounter";

export const getArticleService = async (event): Promise<HTTPResponse> => {
  const firstPublished: string = event["queryStringParameters"]['firstPublished']
  const article: Article = await createArticleStore().getArticle(firstPublished);
  return new HTTPResponse(200, article);
}

export const putArticleService = async (event): Promise<HTTPResponse> => {
  const markdownArticle: string = event["body"];
  const plainArticle: PlainArticle = pharseMarkdown(markdownArticle);
  var article: Article = new Article(plainArticle);
  const store = createArticleStore();
  var articleCatalog: ArticleCatalog = await store.getArticleCatalog();

  const articleIndex: number = articleIsExisted(articleCatalog, article);

  if (articleIndex != -1)
    article = rewriteArticle(articleCatalog, article, articleIndex)

  articleCatalog = rewriteArticleCatalog(articleCatalog, article, articleIndex)
  
  await store.putArticle(article);
  await store.putArticleCatalog(articleCatalog);

  return new HTTPResponse(200, article)
}

export const getArticleCatalogService = async (): Promise<HTTPResponse> => {
  const articleCatalog: ArticleCatalog = await createArticleStore().getArticleCatalog()
  return new HTTPResponse(200, articleCatalog)
}

export const putArticleCatalogService = async (event): Promise<HTTPResponse>  => {
  const articleCatalog: ArticleCatalog = event["body"];
  await createArticleStore().putArticleCatalog(articleCatalog);
  return new HTTPResponse(200, articleCatalog)
}

export const scheduledPutArticleCatalogService = async (): Promise<HTTPResponse> => {
  return drainArticleReaderCountService();
}

export const drainArticleReaderCountService = async (): Promise<HTTPResponse> => {
  const queueUrl = await getReaderCountQueueUrl();
  const result = await drainArticleReaderCounts(
    createSqsReaderCountQueue(queueUrl),
    createArticleStore(),
  );
  return new HTTPResponse(200, result)
}

export const postArticleReaderCountService = async (event): Promise<HTTPResponse> => {
  const firstPublished: string = event["queryStringParameters"]['firstPublished']
  await pushMessageToQueue(firstPublished, await getReaderCountQueueUrl());
  return new HTTPResponse(200, firstPublished)
}

const getReaderCountQueueUrl = async (): Promise<string> => {
  if (process.env.READER_COUNT_QUEUE_URL != null) return process.env.READER_COUNT_QUEUE_URL;

  var accountId: string = await getParameterFromSSM("/article/account-id")
  return `https://sqs.us-east-1.amazonaws.com/${accountId}/article-reader-count`
}
