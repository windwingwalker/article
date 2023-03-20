module "api-resource" {
  source = "../../../iac/modules/api-resource/"
  project_name = var.project_name
  resource_name = var.resource_name
}

module "api-put" {
  source = "../../../iac/modules/api-route/"
  aws_region = var.aws_region
  project_name = var.project_name
  resource_name = var.resource_name
  function_name = var.function_name
  function_arn = var.function_arn
  http_method = "PUT"
  authorizer_id = "npizu5"
  authorization = "COGNITO_USER_POOLS"
}

module "api-get" {
  source = "../../../iac/modules/api-route/"
  aws_region = var.aws_region
  project_name = var.project_name
  resource_name = var.resource_name
  function_name = var.function_name
  function_arn = var.function_arn
  http_method = "GET"
  authorizer_id = null
  authorization = "NONE"
}