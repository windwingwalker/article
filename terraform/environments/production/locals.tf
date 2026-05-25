locals {
  stack_project_name             = "${var.name_prefix}${var.project_name}"
  prod_stack_project_name        = "${var.name_prefix}${var.project_name}-prod"
  prod_gateway_name              = "${var.name_prefix}${var.project_name}-gateway-prod"
  prod_function_name             = "${var.name_prefix}${var.project_name}-prod"
  prod_eventbridge_resource_name = "${var.name_prefix}${var.project_name}-catalog-prod"
  prod_queue_resource_name       = "${var.name_prefix}${var.project_name}-reader-count-prod"
  prod_reader_count_queue_url    = "https://sqs.${var.aws_region}.amazonaws.com/${var.aws_account_id}/${local.prod_queue_resource_name}"
}
