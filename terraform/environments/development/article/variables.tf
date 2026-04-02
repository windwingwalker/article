variable "aws_region" {
  description = "AWS region for all resources."
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Project name used to locate the API Gateway."
  type        = string
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
