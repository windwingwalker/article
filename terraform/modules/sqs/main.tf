resource "aws_sqs_queue" "default" {
  name                        = var.resource_name
  message_retention_seconds   = var.message_retention_seconds
  visibility_timeout_seconds  = var.visibility_timeout_seconds
  receive_wait_time_seconds   = var.receive_wait_time_seconds
  redrive_policy              = jsonencode({
                                    "deadLetterTargetArn" = aws_sqs_queue.dlq.arn,
                                    "maxReceiveCount" = 5
                                })
}

resource "aws_sqs_queue" "dlq" {
  name                        = "${var.resource_name}-DLQ"
  message_retention_seconds   = var.message_retention_seconds
  visibility_timeout_seconds  = var.visibility_timeout_seconds
  receive_wait_time_seconds   = var.receive_wait_time_seconds
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