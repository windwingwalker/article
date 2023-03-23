terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 3.48.0"
    }
  }
 
  required_version = "~> 1.4"
}

provider "aws" {
  region = var.aws_region
  default_tags {
    tags = {
      "Project" = var.project_name
    }
  }
}

module "api-gateway-stage" {
  source = "../modules/api-stage"
  project_name = var.project_name
  stage_name = "prod"
}

data "aws_lambda_alias" "default" {
  function_name = "article"
  name          = "dev"
}

module "lambda-alias" {
  source = "../modules/lambda-alias"
  project_name = var.project_name
  stage_name = "prod"
  function_name = data.aws_lambda_alias.default.function_name
  function_version = data.aws_lambda_alias.default.function_version
}