data "aws_api_gateway_rest_api" "default" {
  name = "${var.project_name}-gateway"
}

resource "aws_lambda_alias" "default" {
  name             = var.stage_name
  function_name    = var.function_name
  function_version = var.function_version
}

resource "aws_lambda_permission" "api_gw" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = var.function_name
  principal     = "apigateway.amazonaws.com"

  source_arn    = "${data.aws_api_gateway_rest_api.default.execution_arn}/*/*"
  qualifier      = var.stage_name
  lifecycle {
    ignore_changes = [
      source_arn
    ]
  }
}