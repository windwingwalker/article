locals {
  stack_project_name      = "${var.name_prefix}${var.project_name}"
  dev_stack_project_name  = "${var.name_prefix}${var.project_name}-dev"
  dev_gateway_name        = "${var.name_prefix}${var.project_name}-gateway-dev"
  dev_function_name       = "${var.name_prefix}${var.project_name}-dev"
  dev_eventbridge_name    = "${var.name_prefix}${var.project_name}-catalog-dev"
  dev_queue_resource_name = "${var.name_prefix}${var.project_name}-reader-count-dev"
}
