output "function_arn" {  
  value = aws_lambda_function.default.arn
}

output "function_name" {
  value = aws_lambda_function.default.function_name
}

output "function_version" {
  value = aws_lambda_function.default.version
}