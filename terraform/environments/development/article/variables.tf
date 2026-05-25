variable "aws_region" {
  description = "AWS region for all resources."
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Project name used to locate the API Gateway."
  type        = string
}

variable "api_name" {
  description = "Exact API Gateway name. Defaults to the shared module project-name pattern."
  type        = string
  default     = null
}

variable "resource_name" {
  description = "API resource path name."
  type        = string
}

variable "function_arn" {
  description = "Unqualified Lambda function ARN used by API Gateway integration."
  type        = string
}

variable "authorizer_id" {
  description = "API Gateway authorizer ID for protected routes."
  type        = string
}

variable "use_stage_alias" {
  description = "Whether API Gateway integration should invoke a Lambda alias from the stage variable."
  type        = bool
  default     = true
}
