import ArticleMetadata from "./ArticleMetadata"

export default interface ArticleCatalog{
  id: number;
  lastModified: number;
  count: number;
  body: ArticleMetadata[];
}