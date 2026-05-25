variable "aws_region" {
  description = "AWS region for all resources."
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Base project name used when composing resource names."
  type        = string
}

variable "aws_account_id" {
  description = "AWS account ID used by modules that need account-scoped ARNs."
  type        = string
  default     = "730917489165"
}

variable "name_prefix" {
  description = "Prefix added to resource names for parallel stacks such as _tmp."
  type        = string
  default     = ""
}

variable "image_tag" {
  description = "Container image tag to deploy to the production Lambda function."
  type        = string
  default     = "062f74b668a36992c48c67e4fcde1bfda8fc0bd6"
}

variable "api_domain_name" {
  description = "Shared custom domain name used for API Gateway base path mappings."
  type        = string
  default     = "api.windwingwalker.xyz"
}
