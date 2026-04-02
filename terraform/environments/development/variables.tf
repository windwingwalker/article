variable "aws_region" {
  description = "AWS region for all resources."
  type    = string
  default = "us-east-1"
}

variable "project_name" {
  description = "Base project name used when composing resource names."
  type        = string
}

variable "name_prefix" {
  description = "Prefix added to resource names for parallel stacks such as _tmp."
  type    = string
  default = ""
}

variable "image_tag" {
  description = "Container image tag to deploy to the Lambda function."
  type        = string
}

variable "lambda_architecture" {
  description = "Lambda execution architecture for this environment."
  type        = string
  default     = "x86_64"
}

variable "cognito_user_pool_arn" {
  description = "Shared Cognito user pool ARN used by the API Gateway authorizer."
  type    = string
  default = "arn:aws:cognito-idp:us-east-1:730917489165:userpool/us-east-1_Nm3Y2dwMj"
}

variable "api_domain_name" {
  description = "Shared custom domain name used for API Gateway base path mappings."
  type    = string
  default = "api.windwingwalker.xyz"
}
