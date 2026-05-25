import {
  getArticleCatalogFromDB,
  getArticleFromDB,
  putArticleCatalogToDB,
  putArticleToDB,
} from "./io";
import Article from "./models/Article";
import ArticleCatalog from "./models/ArticleCatalog";
import { ArticleStore } from "./viewCounter";

export class DynamoArticleStore implements ArticleStore {
  async getArticle(firstPublished: string): Promise<Article> {
    return getArticleFromDB(firstPublished);
  }

  async putArticle(article: Article): Promise<void> {
    await putArticleToDB(article);
  }

  async getArticleCatalog(): Promise<ArticleCatalog> {
    return getArticleCatalogFromDB();
  }

  async putArticleCatalog(articleCatalog: ArticleCatalog): Promise<void> {
    await putArticleCatalogToDB(articleCatalog);
  }
}
