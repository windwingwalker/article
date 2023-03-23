module "api-resource" {
  source = "../../modules/api-resource/"
  project_name = var.project_name
  resource_name = var.resource_name
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