import { createR2ArticleStore } from "./r2ArticleStore";
import { ArticleStore } from "./viewCounter";

export const createArticleStore = (): ArticleStore => {
  return createR2ArticleStore();
};
