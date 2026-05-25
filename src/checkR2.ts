import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadBucketCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { loadLocalEnv } from "./loadLocalEnv";
import { createR2Client } from "./migrationClients";

loadLocalEnv();

const describeError = (err: any): object => ({
  name: err?.name,
  code: err?.Code,
  statusCode: err?.$metadata?.httpStatusCode,
  message: err?.message,
});

const run = async (): Promise<void> => {
  const requiredKeys = [
    "R2_ACCOUNT_ID",
    "R2_BUCKET_NAME",
    "R2_ACCESS_KEY_ID",
    "R2_SECRET_ACCESS_KEY",
    "R2_SESSION_TOKEN",
  ];

  for (const key of requiredKeys) {
    const value = process.env[key]?.trim();
    console.log(`${key}: ${value == null || value == "" ? "missing" : "set, length " + value.length}`);
  }

  const { client, bucketName } = createR2Client();
  const probeKey = `_migration-check/${Date.now()}.json`;
  const probeBody = JSON.stringify({ ok: true, createdAt: new Date().toISOString() });

  try {
    await client.send(new HeadBucketCommand({ Bucket: bucketName }));
    console.log("headBucket: ok");
  } catch (err) {
    console.log("headBucket: failed");
    console.log(JSON.stringify(describeError(err), null, 2));
  }

  try {
    await client.send(new PutObjectCommand({
      Bucket: bucketName,
      Key: probeKey,
      Body: probeBody,
      ContentType: "application/json",
    }));
    console.log("putObject: ok");
  } catch (err) {
    console.log("putObject: failed");
    console.log(JSON.stringify(describeError(err), null, 2));
    process.exitCode = 1;
    return;
  }

  try {
    const response = await client.send(new GetObjectCommand({
      Bucket: bucketName,
      Key: probeKey,
    }));
    const body = await response.Body.transformToString();
    console.log(`getObject: ${body == probeBody ? "ok" : "mismatch"}`);
  } catch (err) {
    console.log("getObject: failed");
    console.log(JSON.stringify(describeError(err), null, 2));
    process.exitCode = 1;
  }

  try {
    await client.send(new DeleteObjectCommand({
      Bucket: bucketName,
      Key: probeKey,
    }));
    console.log("deleteObject: ok");
  } catch (err) {
    console.log("deleteObject: failed");
    console.log(JSON.stringify(describeError(err), null, 2));
    process.exitCode = 1;
  }
};

if (require.main === module) {
  run().catch((err) => {
    console.error(err);
    process.exitCode = 1;
  });
}
