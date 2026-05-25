import { DynamoArticleStore } from "./dynamoArticleStore";
import { createR2ArticleStore } from "./r2ArticleStore";
import { ArticleStore } from "./viewCounter";

export const createArticleStore = (): ArticleStore => {
  const readStore = process.env.ARTICLE_READ_STORE || "dynamodb";

  if (readStore == "r2") return createR2ArticleStore();

  return new DynamoArticleStore();
};
