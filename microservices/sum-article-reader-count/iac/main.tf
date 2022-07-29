terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 3.48.0"
    }
  }
 
  required_version = "~> 1.0"
}

provider "aws" {
  region = var.aws_region
  default_tags {
    tags = {
      "app" = var.app_name
    }
  }
}

module "lambda" {
  source = "./modules/lambda/"
  app_name = var.app_name
  ms_name = var.ms_name
  tag = var.tag
  aws_account_id = var.aws_account_id
}
