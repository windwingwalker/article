resource "aws_api_gateway_rest_api" "default"{
  name = "${var.project_name}-gateway"
}

resource "aws_api_gateway_resource" "article" {
  parent_id   = aws_api_gateway_rest_api.default.root_resource_id
  path_part   = "article"
  rest_api_id = aws_api_gateway_rest_api.default.id
}

resource "aws_api_gateway_resource" "article-catalog" {
  parent_id   = aws_api_gateway_rest_api.default.root_resource_id
  path_part   = "article-catalog"
  rest_api_id = aws_api_gateway_rest_api.default.id
}

resource "aws_api_gateway_resource" "article-reader-count" {
  parent_id   = aws_api_gateway_rest_api.default.root_resource_id
  path_part   = "article-reader-count"
  rest_api_id = aws_api_gateway_rest_api.default.id
}

resource "aws_api_gateway_resource" "markdown" {
  parent_id   = aws_api_gateway_rest_api.default.root_resource_id
  path_part   = "markdown"
  rest_api_id = aws_api_gateway_rest_api.default.id
}

# resource "aws_api_gateway_stage" "dev" {
#   depends_on = [aws_cloudwatch_log_group.dev]

#   rest_api_id = aws_api_gateway_rest_api.default.id
#   deployment_id = "55upo8"
#   stage_name = "dev"
#   variables = {
#     alias = "dev"
#   }
#   access_log_settings {
#     destination_arn = aws_cloudwatch_log_group.dev.arn
#     format = "{ \"requestId\":\"$context.requestId\", \"ip\": \"$context.identity.sourceIp\", \"caller\":\"$context.identity.caller\", \"user\":\"$context.identity.user\",\"requestTime\":\"$context.requestTime\", \"httpMethod\":\"$context.httpMethod\",\"resourcePath\":\"$context.resourcePath\", \"status\":\"$context.status\",\"protocol\":\"$context.protocol\", \"responseLength\":\"$context.responseLength\" }"
#   }
# }

# resource "aws_api_gateway_method_settings" "dev" {
#   rest_api_id = aws_api_gateway_rest_api.default.id
#   stage_name  = aws_api_gateway_stage.dev.stage_name
#   method_path = "*/*"

#   settings {
#     metrics_enabled        = true
#     data_trace_enabled     = false
#     logging_level          = "INFO"

#     # Limit the rate of calls to prevent abuse and unwanted charges
#     throttling_rate_limit  = 100
#     throttling_burst_limit = 50
#   }
# }

# resource "aws_api_gateway_stage" "prod" {
#   depends_on = [aws_cloudwatch_log_group.prod]

#   rest_api_id = aws_api_gateway_rest_api.default.id
#   deployment_id = "55upo8"
#   stage_name = "prod"
#   variables = {
#     alias = "prod"
#   }
#   access_log_settings {
#     destination_arn = aws_cloudwatch_log_group.prod.arn
#     format = "{ \"requestId\":\"$context.requestId\", \"ip\": \"$context.identity.sourceIp\", \"caller\":\"$context.identity.caller\", \"user\":\"$context.identity.user\",\"requestTime\":\"$context.requestTime\", \"httpMethod\":\"$context.httpMethod\",\"resourcePath\":\"$context.resourcePath\", \"status\":\"$context.status\",\"protocol\":\"$context.protocol\", \"responseLength\":\"$context.responseLength\" }"
#   }
# }

# resource "aws_api_gateway_method_settings" "prod" {
#   rest_api_id = aws_api_gateway_rest_api.default.id
#   stage_name  = aws_api_gateway_stage.prod.stage_name
#   method_path = "*/*"

#   settings {
#     metrics_enabled        = true
#     data_trace_enabled     = false
#     logging_level          = "INFO"

#     # Limit the rate of calls to prevent abuse and unwanted charges
#     throttling_rate_limit  = 100
#     throttling_burst_limit = 50
#   }
# }

# resource "aws_cloudwatch_log_group" "dev" {
#   name              = "API-Gateway-Execution-Logs_${aws_api_gateway_rest_api.default.id}/dev"
#   retention_in_days = 30
# }

# resource "aws_cloudwatch_log_group" "prod" {
#   name              = "API-Gateway-Execution-Logs_${aws_api_gateway_rest_api.default.id}/prod"
#   retention_in_days = 30
# }