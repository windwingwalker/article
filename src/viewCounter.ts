import Article from "./models/Article";
import ArticleCatalog from "./models/ArticleCatalog";

export interface ReaderCountMessage {
  id: string;
  firstPublished: string;
}

export interface ReaderCountQueue {
  receive(): Promise<ReaderCountMessage[]>;
  delete(ids: string[]): Promise<void>;
}

export interface ArticleStore {
  getArticle(firstPublished: string): Promise<Article>;
  putArticle(article: Article): Promise<void>;
  getArticleCatalog(): Promise<ArticleCatalog>;
  putArticleCatalog(articleCatalog: ArticleCatalog): Promise<void>;
}

export interface ReaderCountDrainResult {
  received: number;
  updatedArticles: number;
  incrementsByFirstPublished: Record<string, number>;
}

export const drainArticleReaderCounts = async (
  queue: ReaderCountQueue,
  store: ArticleStore,
): Promise<ReaderCountDrainResult> => {
  const incrementsByFirstPublished: Record<string, number> = {};
  const messageIds: string[] = [];
  var received = 0;

  while (true) {
    const messages = await queue.receive();
    if (messages.length == 0) break;

    for (const message of messages) {
      incrementsByFirstPublished[message.firstPublished] =
        (incrementsByFirstPublished[message.firstPublished] || 0) + 1;
      messageIds.push(message.id);
    }

    received += messages.length;
  }

  const firstPublishedList = Object.keys(incrementsByFirstPublished);
  if (firstPublishedList.length == 0) {
    return {
      received,
      updatedArticles: 0,
      incrementsByFirstPublished,
    };
  }

  const articleCatalog = await store.getArticleCatalog();
  var updatedArticles = 0;

  for (const firstPublished of firstPublishedList) {
    const article = await store.getArticle(firstPublished);
    article.views += incrementsByFirstPublished[firstPublished];
    await store.putArticle(article);
    updatedArticles++;

    const catalogArticle = articleCatalog.body.find(
      (metadata) => metadata.firstPublished.toString() == firstPublished,
    );
    if (catalogArticle != null) {
      catalogArticle.views = article.views;
      catalogArticle.lastModified = article.lastModified;
    }
  }

  articleCatalog.lastModified = Date.now();
  await store.putArticleCatalog(articleCatalog);
  await queue.delete(messageIds);

  return {
    received,
    updatedArticles,
    incrementsByFirstPublished,
  };
};
