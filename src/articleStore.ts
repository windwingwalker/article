import { createR2ArticleStore } from "./r2ArticleStore";
import { ArticleStore } from "./viewCounter";

export const createArticleStore = async (): Promise<ArticleStore> => {
  return await createR2ArticleStore();
};
