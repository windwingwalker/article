locals {
  environment_map = var.lambda_env_var == null ? [] : [var.lambda_env_var]
}

data "aws_iam_role" "default" {
  name = "lambda-admin"
}

data "aws_ecr_repository" "default" {
  name = var.resource_name
}

resource "aws_lambda_function" "default" {
  # Neccessary
  function_name        = "${var.resource_name}"
  package_type         = "Image"
  image_uri            = "${data.aws_ecr_repository.default.repository_url}:${var.image_tag}"

  role                 = data.aws_iam_role.default.arn
  publish              = true
  timeout              = var.timeout
  
  # Optional
  dynamic "environment" {
    for_each = local.environment_map
    content {
      variables = environment.value
    }
  }

  depends_on = [
    aws_cloudwatch_log_group.default
  ]
}

resource "aws_cloudwatch_log_group" "default" {
  name = "/aws/lambda/${var.resource_name}"

  retention_in_days = var.log_retention_in_days
}