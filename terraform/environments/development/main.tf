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

module "dev-api-gateway" {
  source         = "../../modules/api-gateway"
  project_name   = local.dev_stack_project_name
  api_name       = local.dev_gateway_name
  aws_account_id = var.aws_account_id
}

module "dev-api-gateway-stage" {
  source             = "../../modules/api-stage"
  project_name       = local.dev_stack_project_name
  api_name           = local.dev_gateway_name
  stage_name         = "dev"
  base_path_override = "${local.stack_project_name}-api-dev"
  depends_on = [
    module.dev-article,
    module.dev-article-catalog,
    module.dev-article-reader-count,
  ]
}

module "dev-lambda" {
  source                = "../../modules/lambda/"
  resource_name         = local.dev_function_name
  image_repository_name = local.stack_project_name
  image_tag             = var.image_tag
  lambda_env_var = {
    R2_ACCOUNT_ID          = data.aws_ssm_parameter.article_r2_account_id.value
    R2_BUCKET_NAME         = data.aws_ssm_parameter.article_r2_bucket_name.value
    R2_ACCESS_KEY_ID       = data.aws_ssm_parameter.article_r2_access_key_id.value
    R2_SECRET_ACCESS_KEY   = data.aws_ssm_parameter.article_r2_secret_access_key.value
    READER_COUNT_QUEUE_URL = "https://sqs.${var.aws_region}.amazonaws.com/${var.aws_account_id}/${local.dev_queue_resource_name}"
  }
  depends_on = [
    module.dev-api-gateway
  ]
}

data "aws_api_gateway_rest_api" "dev" {
  name = local.dev_gateway_name
  depends_on = [
    module.dev-api-gateway
  ]
}

resource "aws_lambda_permission" "dev_api_gw" {
  statement_id  = "AllowExecutionFromDevAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = module.dev-lambda.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${data.aws_api_gateway_rest_api.dev.execution_arn}/*/*"
}

module "dev-article" {
  source          = "./article"
  aws_region      = var.aws_region
  project_name    = local.dev_stack_project_name
  api_name        = local.dev_gateway_name
  resource_name   = "article"
  function_arn    = module.dev-lambda.function_arn
  authorizer_id   = module.dev-api-gateway.authorizer_id
  use_stage_alias = false
  depends_on = [
    module.dev-api-gateway
  ]
}

module "dev-article-catalog" {
  source               = "./article-catalog"
  aws_region           = var.aws_region
  project_name         = local.dev_stack_project_name
  api_name             = local.dev_gateway_name
  api_resource_name    = "article-catalog"
  resource_name        = local.dev_eventbridge_name
  function_name        = module.dev-lambda.function_name
  function_arn         = module.dev-lambda.function_arn
  authorizer_id        = module.dev-api-gateway.authorizer_id
  target_arn           = module.dev-lambda.function_arn
  target_function_name = module.dev-lambda.function_name
  target_qualifier     = null
  use_stage_alias      = false
  depends_on = [
    module.dev-api-gateway
  ]
}

module "dev-article-reader-count" {
  source                      = "./article-reader-count"
  aws_region                  = var.aws_region
  project_name                = local.dev_stack_project_name
  api_name                    = local.dev_gateway_name
  api_resource_name           = "article-reader-count"
  resource_name               = local.dev_queue_resource_name
  function_arn                = module.dev-lambda.function_arn
  function_target             = module.dev-lambda.function_name
  authorizer_id               = module.dev-api-gateway.authorizer_id
  use_stage_alias             = false
  enable_event_source_mapping = false
  depends_on = [
    module.dev-api-gateway
  ]
}
