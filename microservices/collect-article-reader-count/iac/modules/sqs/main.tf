resource "aws_sqs_queue" "default" {
  name                      = var.resource_name
  message_retention_seconds = 1209600 # 14 days
  visibility_timeout_seconds = 1000
  receive_wait_time_seconds = 10
  redrive_policy             = jsonencode({
                                    "deadLetterTargetArn" = aws_sqs_queue.dlq.arn,
                                    "maxReceiveCount" = 5
                                })
}

resource "aws_sqs_queue" "dlq" {
  name                        = "${var.resource_name}-DLQ"
  message_retention_seconds = 1209600 # 14 days
  visibility_timeout_seconds = 1000
  receive_wait_time_seconds = 10
}

resource "aws_sqs_queue_policy" "default" {
  queue_url = aws_sqs_queue.default.id

  policy = jsonencode({
    Version = "2012-10-17",
    Id = "Queue1_Policy_UUID",
    Statement = [{
      Sid = "First"
      Effect = "Allow"
      Principal = "*",
      Action = "sqs:SendMessage",
      Resource = "${aws_sqs_queue.default.arn}",
      }
    ]
  })
}