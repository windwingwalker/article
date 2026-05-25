import { loadLocalEnv } from "./loadLocalEnv";
import { buildR2MigrationObjects } from "./r2Migration";
import { putR2Objects, readDynamoCatalog, scanDynamoArticles } from "./migrationClients";

loadLocalEnv();

const dryRun = process.argv.includes("--dry-run");

const run = async (): Promise<void> => {
  const articles = await scanDynamoArticles();
  const catalog = await readDynamoCatalog();
  const objects = buildR2MigrationObjects(articles, catalog);

  console.log(JSON.stringify({
    dryRun,
    articleVersions: articles.length,
    r2Objects: objects.length,
    latestObjects: objects.filter((object) => object.key.endsWith("/latest.json") && object.key.startsWith("articles/")).length,
    catalogObjects: objects.filter((object) => object.key == "catalog/latest.json").length,
  }, null, 2));

  if (dryRun) return;

  await putR2Objects(objects);
  console.log(`Uploaded ${objects.length} objects to R2.`);
};

if (require.main === module) {
  run().catch((err) => {
    console.error(err);
    process.exitCode = 1;
  });
}
