data "aws_api_gateway_rest_api" "default" {
  name = "${var.app_name}-gateway"
}

data "aws_iam_role" "default" {
  name = "lambda-admin"
}

resource "aws_ecr_repository" "default" {
  name                 = var.ms_name
  image_tag_mutability = "IMMUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }
}

resource "aws_lambda_function" "default" {
  # Neccessary
  function_name        = var.ms_name
  package_type         = "Image"
  image_uri            = "${aws_ecr_repository.default.repository_url}:${var.tag}"
  role                 = data.aws_iam_role.default.arn
  publish              = true

  # Optional
  depends_on           = [
    aws_ecr_repository.default,
    aws_cloudwatch_log_group.default
  ]
  timeout              = 900
  environment {
    variables = {
      API_ID = data.aws_api_gateway_rest_api.default.id
    }
  }
}

resource "aws_cloudwatch_log_group" "default" {
  name = "/aws/lambda/${var.ms_name}"

  retention_in_days = 30
}