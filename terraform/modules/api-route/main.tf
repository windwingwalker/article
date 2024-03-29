data "aws_api_gateway_rest_api" "default" {
  name = "${var.project_name}-gateway"
}

data "aws_api_gateway_resource" "default" {
  rest_api_id = data.aws_api_gateway_rest_api.default.id
  path        = "/${var.resource_name}"
}

resource "aws_api_gateway_method" "default" {
  http_method   = var.http_method
  authorization = var.authorization
  authorizer_id = var.authorizer_id
  rest_api_id   = data.aws_api_gateway_rest_api.default.id
  resource_id   = data.aws_api_gateway_resource.default.id
}

resource "aws_api_gateway_integration" "default" {
  rest_api_id             = data.aws_api_gateway_rest_api.default.id
  resource_id             = data.aws_api_gateway_resource.default.id
  http_method             = aws_api_gateway_method.default.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = "arn:aws:apigateway:${var.aws_region}:lambda:path/2015-03-31/functions/${var.function_arn}:$${stageVariables.alias}/invocations"
  # uri                     = "arn:aws:apigateway:${var.aws_region}:lambda:path/2015-03-31/functions/arn:aws:lambda:${var.aws_region}:${var.aws_account_id}:function:${var.function_name}:$${stageVariables.alias}/invocations"

  depends_on              = [aws_api_gateway_method.default]
}

resource "aws_api_gateway_method_response" "default" {
  rest_api_id = data.aws_api_gateway_rest_api.default.id
  resource_id = data.aws_api_gateway_resource.default.id
  http_method = aws_api_gateway_method.default.http_method
  status_code = 200
}