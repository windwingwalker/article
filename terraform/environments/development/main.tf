module "api-gateway" {
  source                = "../../modules/api-gateway"
  project_name          = local.stack_project_name
  cognito_user_pool_arn = var.cognito_user_pool_arn
}

module "api-gateway-stage" {
  source       = "../../modules/api-stage"
  project_name = local.stack_project_name
  stage_name   = "dev"
  domain_name  = var.api_domain_name
  depends_on = [
    module.article,
    module.article-catalog,
    module.article-reader-count,
  ]
}

module "lambda" {
  source         = "../../modules/lambda/"
  resource_name  = local.function_name
  image_tag      = var.image_tag
  architecture   = var.lambda_architecture
  lambda_env_var = null
  depends_on = [
    module.api-gateway
  ]
}

module "lambda-alias" {
  source           = "../../modules/lambda-alias"
  project_name     = local.stack_project_name
  stage_name       = "dev"
  function_name    = module.lambda.function_name
  function_version = module.lambda.function_version
  depends_on = [
    module.lambda
  ]
}

module "article" {
  source        = "./article"
  aws_region    = var.aws_region
  project_name  = local.stack_project_name
  resource_name = "article"
  function_arn  = module.lambda.function_arn
  authorizer_id = module.api-gateway.authorizer_id
  depends_on = [
    module.api-gateway
  ]
}

module "article-catalog" {
  source               = "./article-catalog"
  aws_region           = var.aws_region
  project_name         = local.stack_project_name
  api_resource_name    = "article-catalog"
  resource_name        = local.eventbridge_resource_name
  function_name        = module.lambda.function_name
  function_arn         = module.lambda.function_arn
  authorizer_id        = module.api-gateway.authorizer_id
  target_arn           = module.lambda-alias.alias_arn
  target_function_name = module.lambda.function_name
  target_qualifier     = module.lambda-alias.alias_name
  depends_on = [
    module.api-gateway
  ]
}

module "article-reader-count" {
  source            = "./article-reader-count"
  aws_region        = var.aws_region
  project_name      = local.stack_project_name
  api_resource_name = "article-reader-count"
  resource_name     = local.queue_resource_name
  function_arn      = module.lambda.function_arn
  function_target   = module.lambda-alias.alias_arn
  authorizer_id     = module.api-gateway.authorizer_id
  depends_on = [
    module.api-gateway
  ]
}
