# Input variable definitions
variable "aws_region" {
  description = "AWS region for all resources."

  type    = string
  default = "us-east-1"
}

variable "app_name" {
  type = string 
}

variable "resource_name" {
  type = string 
}

variable "ms_name" {
  type = string 
}

variable "tag" {
  type = string
}