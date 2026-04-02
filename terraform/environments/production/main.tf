module "api-gateway-stage" {
  source       = "../../modules/api-stage"
  project_name = local.stack_project_name
  stage_name   = "prod"
}

data "aws_lambda_alias" "default" {
  function_name = local.function_name
  name          = var.source_stage_name
}

module "lambda-alias" {
  source           = "../../modules/lambda-alias"
  project_name     = local.stack_project_name
  stage_name       = "prod"
  function_name    = data.aws_lambda_alias.default.function_name
  function_version = data.aws_lambda_alias.default.function_version
}
