import { SQSClient, SendMessageCommand, SendMessageCommandOutput } from "@aws-sdk/client-sqs";
import { SSMClient, GetParameterCommand, GetParameterCommandInput, GetParameterCommandOutput } from "@aws-sdk/client-ssm";

const sqsClient = new SQSClient({ region: "us-east-1"});

export const pushMessageToQueue = async (firstPublished: string, queueUrl: string): Promise<void> => {
  const command: SendMessageCommand = new SendMessageCommand({MessageBody: firstPublished, QueueUrl: queueUrl});
  const response: SendMessageCommandOutput = await sqsClient.send(command);
}

export const getParameterFromSSM = async (ssmPath: string, withDecryption = false): Promise<string> => {
  const client: SSMClient = new SSMClient({ region: "us-east-1" });
  const params: GetParameterCommandInput = {
    Name: ssmPath,
    WithDecryption: withDecryption,
  };
  const command: GetParameterCommand = new GetParameterCommand(params);
  const response: GetParameterCommandOutput = await client.send(command);

  if (response["$metadata"]["httpStatusCode"] != 200) throw new Error(`SSM response status code is ${response["$metadata"]["httpStatusCode"]}`);
  if (response["Parameter"] == null) throw new Error(`SSM parameter path ${ssmPath} not found`);

  return response["Parameter"]["Value"];
}
