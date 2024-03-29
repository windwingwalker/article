module "api-resource" {
  source = "../../modules/api-resource/"
  project_name = var.project_name
  resource_name = var.resource_name
}

module "api-post" {
  source = "../../modules/api-route/"
  aws_region = var.aws_region
  project_name = var.project_name
  resource_name = var.resource_name
  function_arn = var.function_arn
  http_method = "POST"
  authorizer_id = null
  authorization = "NONE"
  depends_on = [
    module.api-resource
  ]
}

module "sqs"{
  source = "../../modules/sqs/"
  resource_name = var.resource_name
}

resource "aws_lambda_event_source_mapping" "default" {
  event_source_arn = module.sqs.sqs_queue_arn
  function_name    = var.function_arn
}