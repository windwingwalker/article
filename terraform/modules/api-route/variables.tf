variable "project_name" {
  type = string 
}

variable "resource_name" {
  type = string 
}

variable "aws_region" {
  description = "AWS region for all resources."

  type    = string
  default = "us-east-1"
}

variable "function_arn" {
  type    = string
}

variable "http_method" {
  type    = string
  default = "GET"
}

variable "authorizer_id" {
  type    = string
  default = null
}

variable "authorization" {
  type    = string
  default = "NONE"
}