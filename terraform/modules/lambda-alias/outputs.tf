output "alias_arn" {
  description = "ARN of the Lambda alias."
  value       = aws_lambda_alias.default.arn
}

output "alias_name" {
  description = "Name of the Lambda alias."
  value       = aws_lambda_alias.default.name
}
