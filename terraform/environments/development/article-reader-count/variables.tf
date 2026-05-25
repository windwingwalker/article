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
  description = "SQS queue name."
  type        = string
}

variable "function_arn" {
  description = "Unqualified Lambda function ARN used by API Gateway integration."
  type        = string
}

variable "function_target" {
  description = "Qualified Lambda alias ARN used by the SQS event source mapping."
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

variable "enable_event_source_mapping" {
  description = "Whether SQS messages should invoke Lambda immediately."
  type        = bool
  default     = true
}
