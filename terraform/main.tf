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
      "Project" = var.project_name
    }
  }
}

module "api-gateway" {
  source = "./modules/api-gateway"
  project_name = var.project_name
  aws_account_id = var.aws_account_id
}

module "api-gateway-stage-dev" {
  source = "./modules/api-stage"
  project_name = var.project_name
  stage_name = "dev"
}

module "api-gateway-stage-prod" {
  source = "./modules/api-stage"
  project_name = var.project_name
  stage_name = "prod"
}

module "lambda" {
  source = "../../../iac/modules/lambda/"
  resource_name = "article"
  image_tag = var.image_tag
  lambda_env_var = null
}

module "resource_group" {
  source = "./modules/resource-group"
  project_name = var.project_name
}

module "article" {
  source = "./article"
  project_name = var.project_name
  resource_name = "article"
  function_name = module.lambda.function_name
  function_arn = module.lambda.function_arn
}

module "article-catalog" {
  source = "./article-catalog"
  project_name = var.project_name
  resource_name = "article-catalog"
  function_name = module.lambda.function_name
  function_arn = module.lambda.function_arn
}

module "article-reader-count" {
  source = "./article-reader-count"
  project_name = var.project_name
  resource_name = "article-reader-count"
  function_name = module.lambda.function_name
  function_arn = module.lambda.function_arn
}