import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import Article from "./models/Article";
import ArticleCatalog from "./models/ArticleCatalog";
import { ArticleCatalogNotFoundError, ArticleCatalogUploadError, ArticleNotFoundError, ArticleUploadError } from "./models/Error";
import { ArticleStore } from "./viewCounter";
import { getParameterFromSSM } from "./io";

interface R2StoreConfig {
  accountId: string;
  bucketName: string;
  accessKeyId: string;
  secretAccessKey: string;
}

const parameterPath = (name: string): string => `/article/article-data-store/${name}`;

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

export const createR2ArticleStore = async (): Promise<R2ArticleStore> => {
  const config: R2StoreConfig = {
    accountId: await getParameterFromSSM(parameterPath("account-id")),
    bucketName: await getParameterFromSSM(parameterPath("bucket-name")),
    accessKeyId: await getParameterFromSSM(parameterPath("access-key-id"), true),
    secretAccessKey: await getParameterFromSSM(parameterPath("secret-access-key"), true),
  };

  if (config.accountId.trim() == "") throw new Error(`${parameterPath("account-id")} is required`);
  if (config.bucketName.trim() == "") throw new Error(`${parameterPath("bucket-name")} is required`);
  if (config.accessKeyId.trim() == "") throw new Error(`${parameterPath("access-key-id")} is required`);
  if (config.secretAccessKey.trim() == "") throw new Error(`${parameterPath("secret-access-key")} is required`);

  const client = new S3Client({
    region: "auto",
    endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
    requestChecksumCalculation: "WHEN_REQUIRED",
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });

  return new R2ArticleStore(client, config.bucketName);
};
