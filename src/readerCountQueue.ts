import {
  DeleteMessageBatchCommand,
  ReceiveMessageCommand,
  SQSClient,
} from "@aws-sdk/client-sqs";
import { ReaderCountMessage, ReaderCountQueue } from "./viewCounter";

export class SqsReaderCountQueue implements ReaderCountQueue {
  private client: SQSClient;
  private queueUrl: string;

  constructor(client: SQSClient, queueUrl: string) {
    this.client = client;
    this.queueUrl = queueUrl;
  }

  async receive(): Promise<ReaderCountMessage[]> {
    const response = await this.client.send(new ReceiveMessageCommand({
      QueueUrl: this.queueUrl,
      MaxNumberOfMessages: 10,
      WaitTimeSeconds: 0,
      VisibilityTimeout: 60,
    }));

    return (response.Messages || [])
      .filter((message) => message.ReceiptHandle != null && message.Body != null)
      .map((message) => ({
        id: message.ReceiptHandle,
        firstPublished: message.Body,
      }));
  }

  async delete(ids: string[]): Promise<void> {
    if (ids.length == 0) return;

    for (var i = 0; i < ids.length; i += 10) {
      await this.client.send(new DeleteMessageBatchCommand({
        QueueUrl: this.queueUrl,
        Entries: ids.slice(i, i + 10).map((id, index) => ({
          Id: index.toString(),
          ReceiptHandle: id,
        })),
      }));
    }
  }
}

export const createSqsReaderCountQueue = (queueUrl: string): SqsReaderCountQueue => {
  return new SqsReaderCountQueue(new SQSClient({ region: "us-east-1" }), queueUrl);
};
