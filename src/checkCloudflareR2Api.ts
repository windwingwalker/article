import { loadLocalEnv } from "./loadLocalEnv";

loadLocalEnv();

const apiToken = (
  process.env.CLOUDFLARE_API_TOKEN ||
  process.env.CF_API_TOKEN ||
  process.env.R2_API_TOKEN ||
  process.env.R2_TOKEN_VALUE ||
  ""
).trim();
const accountId = (process.env.R2_ACCOUNT_ID || "").trim();
const bucketName = (process.env.R2_BUCKET_NAME || "").trim();

interface CloudflareApiResult {
  label: string;
  status: number;
  ok: boolean;
  success?: boolean;
  errors?: object[];
  resultSummary?: object;
}

const summarizeResult = (result: any): object => {
  if (Array.isArray(result)) return { count: result.length };
  if (result?.buckets != null && Array.isArray(result.buckets)) return { bucketCount: result.buckets.length };
  if (result?.name != null) return { name: result.name, location: result.location, jurisdiction: result.jurisdiction };
  if (result != null && typeof result == "object") return { keys: Object.keys(result).sort() };
  return { type: typeof result };
};

const requestCloudflareApi = async (label: string, path: string): Promise<CloudflareApiResult> => {
  const response = await fetch(`https://api.cloudflare.com/client/v4${path}`, {
    headers: {
      Authorization: `Bearer ${apiToken}`,
      "Content-Type": "application/json",
    },
  });
  const body = await response.json();

  return {
    label,
    status: response.status,
    ok: response.ok,
    success: body.success,
    errors: body.errors,
    resultSummary: summarizeResult(body.result),
  };
};

const run = async (): Promise<void> => {
  console.log(`CLOUDFLARE_API_TOKEN/CF_API_TOKEN/R2_API_TOKEN/R2_TOKEN_VALUE: ${apiToken == "" ? "missing" : "set, length " + apiToken.length}`);
  console.log(`R2_ACCOUNT_ID: ${accountId == "" ? "missing" : "set, length " + accountId.length}`);
  console.log(`R2_BUCKET_NAME: ${bucketName == "" ? "missing" : "set, length " + bucketName.length}`);

  if (apiToken == "") throw new Error("Set CLOUDFLARE_API_TOKEN, CF_API_TOKEN, R2_API_TOKEN, or R2_TOKEN_VALUE in .env");
  if (accountId == "") throw new Error("Set R2_ACCOUNT_ID in .env");
  if (bucketName == "") throw new Error("Set R2_BUCKET_NAME in .env");

  const checks = [
    await requestCloudflareApi("listBuckets", `/accounts/${accountId}/r2/buckets`),
    await requestCloudflareApi("getBucket", `/accounts/${accountId}/r2/buckets/${bucketName}`),
  ];

  for (const check of checks) {
    console.log(JSON.stringify(check, null, 2));
    if (!check.ok || check.success === false) process.exitCode = 1;
  }
};

if (require.main === module) {
  run().catch((err) => {
    console.error(err);
    process.exitCode = 1;
  });
}
