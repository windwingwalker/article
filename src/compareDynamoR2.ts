import { loadLocalEnv } from "./loadLocalEnv";
import Article from "./models/Article";
import ArticleCatalog from "./models/ArticleCatalog";
import { readDynamoCatalog, readR2JsonObject, scanDynamoArticles } from "./migrationClients";
import { compareDynamoAndR2Latest, latestArticlesByFirstPublished } from "./r2Migration";

loadLocalEnv();

const run = async (): Promise<void> => {
  const dynamoArticles = await scanDynamoArticles();
  const dynamoCatalog = await readDynamoCatalog();
  const expectedLatest = latestArticlesByFirstPublished(dynamoArticles);
  const r2LatestArticles: Record<string, Article> = {};

  for (const firstPublished of Object.keys(expectedLatest)) {
    const article = await readR2JsonObject<Article>(`articles/${firstPublished}/latest.json`);
    if (article != null) r2LatestArticles[firstPublished] = article;
  }

  const r2Catalog = await readR2JsonObject<ArticleCatalog>("catalog/latest.json");
  const result = compareDynamoAndR2Latest(
    dynamoArticles,
    r2LatestArticles,
    dynamoCatalog,
    r2Catalog,
  );

  console.log(JSON.stringify({
    ok: result.ok,
    dynamoArticleVersions: dynamoArticles.length,
    expectedLatestArticles: Object.keys(expectedLatest).length,
    r2LatestArticles: Object.keys(r2LatestArticles).length,
    differences: result.differences,
  }, null, 2));

  if (!result.ok) process.exitCode = 1;
};

if (require.main === module) {
  run().catch((err) => {
    console.error(err);
    process.exitCode = 1;
  });
}
