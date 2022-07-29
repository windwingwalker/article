import { SQSClient, SendMessageCommand, SendMessageCommandOutput } from "@aws-sdk/client-sqs";
import { HTTPResponse } from "../../../model/http-response"

const client = new SQSClient({ region: "us-east-1"});

exports.lambdaHandler = async (event, context) => {
  try {
    const firstPublished: string = event["queryStringParameters"]['firstPublished']
    
    const command: SendMessageCommand = new SendMessageCommand({MessageBody: firstPublished, QueueUrl: process.env.SQS_QUEUE_URL});
    const response: SendMessageCommandOutput = await client.send(command);
    
    return new HTTPResponse(200, firstPublished);
  } catch (err) {
    console.error(err);
    return new HTTPResponse(err["status"], JSON.stringify({"Error Message: ": err["message"]}));
  }
};
