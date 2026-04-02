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
