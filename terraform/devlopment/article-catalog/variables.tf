variable "aws_region" {
  description = "AWS region for all resources."

  type    = string
  default = "us-east-1"
}

variable "project_name" {
  type = string 
}

variable "resource_name" {
  type = string 
}

variable "function_name" {
  type = string 
}

variable "function_arn" {
  type = string 
}

variable "authorizer_id" {
  type = string
}