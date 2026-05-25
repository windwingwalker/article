import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import Article from "./models/Article";
import ArticleCatalog from "./models/ArticleCatalog";
import { ArticleCatalogNotFoundError, ArticleCatalogUploadError, ArticleNotFoundError, ArticleUploadError } from "./models/Error";
import { ArticleStore } from "./viewCounter";

const readBodyAsString = async (body: any): Promise<string> => {
  if (body == null) return "";
  if (typeof body.transformToString == "function") return body.transformToString();

  const chunks = [];
  for await (const chunk of body) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString("utf8");
};

export class R2ArticleStore implements ArticleStore {
  private client: S3Client;
  private bucketName: string;

  constructor(client: S3Client, bucketName: string) {
    this.client = client;
    this.bucketName = bucketName;
  }

  async getArticle(firstPublished: string): Promise<Article> {
    try {
      const response = await this.client.send(new GetObjectCommand({
        Bucket: this.bucketName,
        Key: `articles/${firstPublished}/latest.json`,
      }));
      return JSON.parse(await readBodyAsString(response.Body)) as Article;
    } catch (err) {
      throw new ArticleNotFoundError(firstPublished);
    }
  }

  async putArticle(article: Article): Promise<void> {
    try {
      const body = JSON.stringify(article);
      await this.client.send(new PutObjectCommand({
        Bucket: this.bucketName,
        Key: `articles/${article.firstPublished}/versions/${article.lastModified}.json`,
        Body: body,
        ContentType: "application/json",
      }));
      await this.client.send(new PutObjectCommand({
        Bucket: this.bucketName,
        Key: `articles/${article.firstPublished}/latest.json`,
        Body: body,
        ContentType: "application/json",
      }));
    } catch (err) {
      throw new ArticleUploadError(article.firstPublished);
    }
  }

  async getArticleCatalog(): Promise<ArticleCatalog> {
    try {
      const response = await this.client.send(new GetObjectCommand({
        Bucket: this.bucketName,
        Key: "catalog/latest.json",
      }));
      return JSON.parse(await readBodyAsString(response.Body)) as ArticleCatalog;
    } catch (err) {
      throw new ArticleCatalogNotFoundError();
    }
  }

  async putArticleCatalog(articleCatalog: ArticleCatalog): Promise<void> {
    try {
      await this.client.send(new PutObjectCommand({
        Bucket: this.bucketName,
        Key: "catalog/latest.json",
        Body: JSON.stringify(articleCatalog),
        ContentType: "application/json",
      }));
    } catch (err) {
      throw new ArticleCatalogUploadError();
    }
  }
}

export const createR2ArticleStore = (): R2ArticleStore => {
  const accountId = process.env.R2_ACCOUNT_ID?.trim();
  const bucketName = process.env.R2_BUCKET_NAME?.trim();
  const accessKeyId = process.env.R2_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY?.trim();
  const sessionToken = process.env.R2_SESSION_TOKEN?.trim();

  if (bucketName == null || bucketName == "") throw new Error("R2_BUCKET_NAME is required");
  if ((accountId == null || accountId == "") && process.env.R2_ENDPOINT == null) throw new Error("R2_ACCOUNT_ID or R2_ENDPOINT is required");
  if (accessKeyId == null || accessKeyId == "") throw new Error("R2_ACCESS_KEY_ID is required");
  if (secretAccessKey == null || secretAccessKey == "") throw new Error("R2_SECRET_ACCESS_KEY is required");

  const endpoint = process.env.R2_ENDPOINT?.trim() || `https://${accountId}.r2.cloudflarestorage.com`;
  const forcePathStyle = process.env.R2_FORCE_PATH_STYLE?.trim() == "true";
  const client = new S3Client({
    region: "auto",
    endpoint,
    forcePathStyle,
    requestChecksumCalculation: "WHEN_REQUIRED",
    credentials: {
      accessKeyId,
      secretAccessKey,
      sessionToken: sessionToken == "" ? undefined : sessionToken,
    },
  });

  return new R2ArticleStore(client, bucketName);
};
