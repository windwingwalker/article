data "aws_ssm_parameter" "article_r2_access_key_id" {
  name            = "/article/article-data-store/access-key-id"
  with_decryption = true
}

data "aws_ssm_parameter" "article_r2_account_id" {
  name = "/article/article-data-store/account-id"
}

data "aws_ssm_parameter" "article_r2_bucket_name" {
  name = "/article/article-data-store/bucket-name"
}

data "aws_ssm_parameter" "article_r2_secret_access_key" {
  name            = "/article/article-data-store/secret-access-key"
  with_decryption = true
}

module "prod-api-gateway" {
  source         = "../../modules/api-gateway"
  project_name   = local.prod_stack_project_name
  api_name       = local.prod_gateway_name
  aws_account_id = var.aws_account_id
}

module "prod-api-gateway-stage" {
  source             = "../../modules/api-stage"
  project_name       = local.prod_stack_project_name
  api_name           = local.prod_gateway_name
  stage_name         = "prod"
  base_path_override = "${local.stack_project_name}-api-prod"
  depends_on = [
    module.prod-article,
    module.prod-article-catalog,
    module.prod-article-reader-count,
  ]
}

module "prod-lambda" {
  source                = "../../modules/lambda/"
  resource_name         = local.prod_function_name
  image_repository_name = local.stack_project_name
  image_tag             = var.image_tag
  lambda_env_var = {
    R2_ACCOUNT_ID          = data.aws_ssm_parameter.article_r2_account_id.value
    R2_BUCKET_NAME         = data.aws_ssm_parameter.article_r2_bucket_name.value
    R2_ACCESS_KEY_ID       = data.aws_ssm_parameter.article_r2_access_key_id.value
    R2_SECRET_ACCESS_KEY   = data.aws_ssm_parameter.article_r2_secret_access_key.value
    READER_COUNT_QUEUE_URL = local.prod_reader_count_queue_url
  }
  depends_on = [
    module.prod-api-gateway
  ]
}

data "aws_api_gateway_rest_api" "prod" {
  name = local.prod_gateway_name
  depends_on = [
    module.prod-api-gateway
  ]
}

resource "aws_lambda_permission" "prod_api_gw" {
  statement_id  = "AllowExecutionFromProdAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = module.prod-lambda.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${data.aws_api_gateway_rest_api.prod.execution_arn}/*/*"
}

module "prod-article" {
  source          = "../development/article"
  aws_region      = var.aws_region
  project_name    = local.prod_stack_project_name
  api_name        = local.prod_gateway_name
  resource_name   = "article"
  function_arn    = module.prod-lambda.function_arn
  authorizer_id   = module.prod-api-gateway.authorizer_id
  use_stage_alias = false
  depends_on = [
    module.prod-api-gateway
  ]
}

module "prod-article-catalog" {
  source               = "../development/article-catalog"
  aws_region           = var.aws_region
  project_name         = local.prod_stack_project_name
  api_name             = local.prod_gateway_name
  api_resource_name    = "article-catalog"
  resource_name        = local.prod_eventbridge_resource_name
  function_name        = module.prod-lambda.function_name
  function_arn         = module.prod-lambda.function_arn
  authorizer_id        = module.prod-api-gateway.authorizer_id
  target_arn           = module.prod-lambda.function_arn
  target_function_name = module.prod-lambda.function_name
  target_qualifier     = null
  use_stage_alias      = false
  depends_on = [
    module.prod-api-gateway
  ]
}

module "prod-article-reader-count" {
  source                      = "../development/article-reader-count"
  aws_region                  = var.aws_region
  project_name                = local.prod_stack_project_name
  api_name                    = local.prod_gateway_name
  api_resource_name           = "article-reader-count"
  resource_name               = local.prod_queue_resource_name
  function_arn                = module.prod-lambda.function_arn
  function_target             = module.prod-lambda.function_name
  authorizer_id               = module.prod-api-gateway.authorizer_id
  use_stage_alias             = false
  enable_event_source_mapping = false
  depends_on = [
    module.prod-api-gateway
  ]
}
