output "sqs_queue_url" {  
    value = aws_sqs_queue.default.url
}

output "sqs_queue_arn" {  
    value = aws_sqs_queue.default.arn
}