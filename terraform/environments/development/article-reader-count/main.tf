module "api-resource" {
  source        = "../../../modules/api-resource/"
  project_name  = var.project_name
  api_name      = var.api_name
  resource_name = var.api_resource_name
}

module "api-post" {
  source          = "../../../modules/api-route/"
  aws_region      = var.aws_region
  project_name    = var.project_name
  api_name        = var.api_name
  resource_name   = var.api_resource_name
  function_arn    = var.function_arn
  use_stage_alias = var.use_stage_alias
  http_method     = "POST"
  authorizer_id   = null
  authorization   = "NONE"
  depends_on = [
    module.api-resource
  ]
}

module "sqs" {
  source        = "../../../modules/sqs/"
  resource_name = var.resource_name
}

resource "aws_lambda_event_source_mapping" "default" {
  count            = var.enable_event_source_mapping ? 1 : 0
  event_source_arn = module.sqs.sqs_queue_arn
  function_name    = var.function_target
}
