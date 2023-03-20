data "aws_api_gateway_rest_api" "default" {
  name = "${var.project_name}-gateway"
}

resource "aws_api_gateway_resource" "default" {
  parent_id   = data.aws_api_gateway_rest_api.default.root_resource_id
  path_part   = "${var.resource_name}"
  rest_api_id = data.aws_api_gateway_rest_api.default.id
}
