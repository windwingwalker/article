module "eventbridge" {
  source = "../../modules/eventbridge"
  resource_name = var.resource_name
  function_arn = var.function_arn
  function_name = var.function_name
  description = "Fires at 3am UTC+8 daily"
  schedule_expression = "cron(0 21 * * ? *)"
}

module "api-resource" {
  source = "../../modules/api-resource/"
  project_name = var.project_name
  resource_name = var.resource_name
}

module "api-get" {
  source = "../../modules/api-route/"
  aws_region = var.aws_region
  project_name = var.project_name
  resource_name = var.resource_name
  function_arn = var.function_arn
  http_method = "GET"
  authorizer_id = null
  authorization = "NONE"
  depends_on = [
    module.api-resource
  ]
}

module "api-put" {
  source = "../../modules/api-route/"
  aws_region = var.aws_region
  project_name = var.project_name
  resource_name = var.resource_name
  function_arn = var.function_arn
  http_method = "PUT"
  authorizer_id = var.authorizer_id
  authorization = "COGNITO_USER_POOLS"
  depends_on = [
    module.api-resource
  ]
}