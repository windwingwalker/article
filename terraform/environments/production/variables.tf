variable "aws_region" {
  description = "AWS region for all resources."
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Base project name used when composing resource names."
  type        = string
}

variable "name_prefix" {
  description = "Prefix added to resource names for parallel stacks such as _tmp."
  type        = string
  default     = ""
}

variable "api_domain_name" {
  description = "Shared custom domain name used for API Gateway base path mappings."
  type        = string
  default     = "api.windwingwalker.xyz"
}

variable "source_stage_name" {
  description = "Alias name used as the source when promoting the production alias."
  type        = string
  default     = "dev"
}
