variable "aws_region" {
  description = "AWS region for all resources."

  type    = string
  default = "us-east-1"
}

variable "project_name" {
  type = string 
}

variable "aws_account_id" {
  type = string
}