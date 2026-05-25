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

variable "api_resource_name" {
  description = "API resource path name."
  type        = string
}

variable "resource_name" {
  description = "EventBridge rule name."
  type        = string
}

variable "function_name" {
  description = "Fallback Lambda function name for scheduled invocations."
  type        = string
}

variable "function_arn" {
  description = "Fallback Lambda function ARN for scheduled invocations."
  type        = string
}

variable "authorizer_id" {
  description = "API Gateway authorizer ID for protected routes."
  type        = string
}

variable "target_arn" {
  type    = string
  default = null
}

variable "target_function_name" {
  type    = string
  default = null
}

variable "target_qualifier" {
  type    = string
  default = null
}

variable "use_stage_alias" {
  description = "Whether API Gateway integration should invoke a Lambda alias from the stage variable."
  type        = bool
  default     = true
}
