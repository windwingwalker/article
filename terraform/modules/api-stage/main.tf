data "aws_api_gateway_rest_api" "default" {
  name = "${var.project_name}-gateway"
}

resource "aws_api_gateway_deployment" "default" {
  rest_api_id = data.aws_api_gateway_rest_api.default.id
  stage_name = aws_api_gateway_stage.default.stage_name

  triggers = {
    # NOTE: The configuration below will satisfy ordering considerations,
    #       but not pick up all future REST API changes. More advanced patterns
    #       are possible, such as using the filesha1() function against the
    #       Terraform configuration file(s) or removing the .id references to
    #       calculate a hash against whole resources. Be aware that using whole
    #       resources will show a difference after the initial implementation.
    #       It will stabilize to only change when resources change afterwards.
    redeployment = sha1(jsonencode([
      data.aws_api_gateway_rest_api.default.id,
    ]))
  }

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_api_gateway_stage" "default" {
  depends_on = [aws_cloudwatch_log_group.default]

  rest_api_id = data.aws_api_gateway_rest_api.default.id
  deployment_id = aws_api_gateway_deployment.default.id
  stage_name = var.stage_name
  variables = {
    alias = var.stage_name
  }
  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.default.arn
    format = "{ \"requestId\":\"$context.requestId\", \"ip\": \"$context.identity.sourceIp\", \"caller\":\"$context.identity.caller\", \"user\":\"$context.identity.user\",\"requestTime\":\"$context.requestTime\", \"httpMethod\":\"$context.httpMethod\",\"resourcePath\":\"$context.resourcePath\", \"status\":\"$context.status\",\"protocol\":\"$context.protocol\", \"responseLength\":\"$context.responseLength\" }"
  }
}

resource "aws_api_gateway_method_settings" "default" {
  rest_api_id = data.aws_api_gateway_rest_api.default.id
  stage_name  = aws_api_gateway_stage.default.stage_name
  method_path = "*/*"

  settings {
    metrics_enabled        = true
    data_trace_enabled     = false
    logging_level          = "INFO"

    # Limit the rate of calls to prevent abuse and unwanted charges
    throttling_rate_limit  = 100
    throttling_burst_limit = 50
  }
}

resource "aws_cloudwatch_log_group" "default" {
  name              = "API-Gateway-Execution-Logs_${aws_api_gateway_rest_api.default.id}/dev"
  retention_in_days = 30
}