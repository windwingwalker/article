locals {
  stack_project_name        = "${var.name_prefix}${var.project_name}"
  function_name             = "${var.name_prefix}article"
  eventbridge_resource_name = "${var.name_prefix}article-catalog"
  queue_resource_name       = "${var.name_prefix}article-reader-count"
}
