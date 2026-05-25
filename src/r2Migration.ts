import Article from "./models/Article";
import ArticleCatalog from "./models/ArticleCatalog";

export interface R2MigrationObject {
  key: string;
  body: string;
}

export interface MigrationDifference {
  key: string;
  reason: string;
}

export interface MigrationComparisonResult {
  ok: boolean;
  differences: MigrationDifference[];
}

const stableJson = (value: any): string => JSON.stringify(value);

export const latestArticlesByFirstPublished = (articles: Article[]): Record<string, Article> => {
  const latest: Record<string, Article> = {};

  for (const article of articles) {
    const firstPublished = article.firstPublished.toString();
    if (latest[firstPublished] == null || article.lastModified > latest[firstPublished].lastModified) {
      latest[firstPublished] = article;
    }
  }

  return latest;
};

export const buildR2MigrationObjects = (
  articles: Article[],
  articleCatalog: ArticleCatalog,
): R2MigrationObject[] => {
  const versionObjects = articles
    .map((article) => ({
      key: `articles/${article.firstPublished}/versions/${article.lastModified}.json`,
      body: stableJson(article),
    }))
    .sort((left, right) => left.key.localeCompare(right.key));

  const latestObjects = Object.entries(latestArticlesByFirstPublished(articles))
    .map(([firstPublished, article]) => ({
      key: `articles/${firstPublished}/latest.json`,
      body: stableJson(article),
    }))
    .sort((left, right) => left.key.localeCompare(right.key));

  return [
    ...versionObjects,
    ...latestObjects,
    {
      key: "catalog/latest.json",
      body: stableJson(articleCatalog),
    },
  ];
};

export const compareDynamoAndR2Latest = (
  dynamoArticles: Article[],
  r2LatestArticles: Record<string, Article>,
  dynamoCatalog: ArticleCatalog,
  r2Catalog: ArticleCatalog | null,
): MigrationComparisonResult => {
  const differences: MigrationDifference[] = [];
  const expectedLatest = latestArticlesByFirstPublished(dynamoArticles);

  for (const firstPublished of Object.keys(expectedLatest).sort()) {
    const expectedArticle = expectedLatest[firstPublished];
    const actualArticle = r2LatestArticles[firstPublished];

    if (actualArticle == null) {
      differences.push({
        key: `articles/${firstPublished}/latest.json`,
        reason: "missing-r2-latest",
      });
    } else if (stableJson(actualArticle) != stableJson(expectedArticle)) {
      differences.push({
        key: `articles/${firstPublished}/latest.json`,
        reason: "latest-mismatch",
      });
    }
  }

  if (r2Catalog == null) {
    differences.push({
      key: "catalog/latest.json",
      reason: "missing-r2-catalog",
    });
  } else if (stableJson(r2Catalog) != stableJson(dynamoCatalog)) {
    differences.push({
      key: "catalog/latest.json",
      reason: "catalog-mismatch",
    });
  }

  return {
    ok: differences.length == 0,
    differences,
  };
};
