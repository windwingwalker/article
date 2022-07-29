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

variable "ms_name" {
  type = string 
}

variable "http_method" {
  type = string 
}

variable "image_tag" {
  type = string 
}