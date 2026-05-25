import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";
import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { getArticleCatalogFromDB } from "./io";
import Article from "./models/Article";
import ArticleCatalog from "./models/ArticleCatalog";
import { R2MigrationObject } from "./r2Migration";

export const createR2Client = (): { client: S3Client; bucketName: string } => {
  const accountId = process.env.R2_ACCOUNT_ID?.trim();
  const bucketName = process.env.R2_BUCKET_NAME?.trim();
  const accessKeyId = process.env.R2_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY?.trim();
  const sessionToken = process.env.R2_SESSION_TOKEN?.trim();

  if (bucketName == null || bucketName == "") throw new Error("R2_BUCKET_NAME is required");
  if ((accountId == null || accountId == "") && process.env.R2_ENDPOINT == null) throw new Error("R2_ACCOUNT_ID or R2_ENDPOINT is required");
  if (accessKeyId == null || accessKeyId == "") throw new Error("R2_ACCESS_KEY_ID is required");
  if (secretAccessKey == null || secretAccessKey == "") throw new Error("R2_SECRET_ACCESS_KEY is required");

  const forcePathStyle = process.env.R2_FORCE_PATH_STYLE?.trim() == "true";

  return {
    bucketName,
    client: new S3Client({
      region: "auto",
      endpoint: process.env.R2_ENDPOINT?.trim() || `https://${accountId}.r2.cloudflarestorage.com`,
      forcePathStyle,
      requestChecksumCalculation: "WHEN_REQUIRED",
      credentials: {
        accessKeyId,
        secretAccessKey,
        sessionToken: sessionToken == "" ? undefined : sessionToken,
      },
    }),
  };
};

export const scanDynamoArticles = async (): Promise<Article[]> => {
  const client = new DynamoDBClient({ region: "us-east-1" });
  const articles: Article[] = [];
  var exclusiveStartKey = null;

  do {
    const response = await client.send(new ScanCommand({
      TableName: "articles",
      ExclusiveStartKey: exclusiveStartKey,
    }));

    for (const item of response.Items || []) {
      articles.push(unmarshall(item) as Article);
    }

    exclusiveStartKey = response.LastEvaluatedKey;
  } while (exclusiveStartKey != null);

  return articles;
};

export const readDynamoCatalog = async (): Promise<ArticleCatalog> => {
  return getArticleCatalogFromDB();
};

export const putR2Objects = async (objects: R2MigrationObject[]): Promise<void> => {
  const { client, bucketName } = createR2Client();

  for (const object of objects) {
    await client.send(new PutObjectCommand({
      Bucket: bucketName,
      Key: object.key,
      Body: object.body,
      ContentType: "application/json",
    }));
  }
};

export const readR2JsonObject = async <T>(key: string): Promise<T | null> => {
  const { client, bucketName } = createR2Client();

  try {
    const response = await client.send(new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    }));

    const body = await response.Body.transformToString();
    return JSON.parse(body) as T;
  } catch (err) {
    return null;
  }
};
