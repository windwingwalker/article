resource "aws_api_gateway_rest_api" "default"{
  name = "${var.project_name}-gateway"
}

resource "aws_api_gateway_authorizer" "default" {
  name          = "CognitoUserPoolAuthorizer"
  type          = "COGNITO_USER_POOLS"
  rest_api_id   = aws_api_gateway_rest_api.default.id
  provider_arns = ["arn:aws:cognito-idp:us-east-1:${var.aws_account_id}:userpool/us-east-1_Nm3Y2dwMj"]
}