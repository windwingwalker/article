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

module "api-gateway" {
  source = "../modules/api-gateway"
  project_name = var.project_name
  aws_account_id = var.aws_account_id
}

module "api-gateway-stage" {
  source = "../modules/api-stage"
  project_name = var.project_name
  stage_name = "dev"
  depends_on = [
    module.article,
    module.article-catalog,
    module.article-reader-count,
  ]
}

module "lambda" {
  source = "../modules/lambda/"
  resource_name = "article"
  image_tag = var.image_tag
  lambda_env_var = null
  depends_on = [
    module.api-gateway
  ]
}

module "lambda-alias" {
  source = "../modules/lambda-alias"
  project_name = var.project_name
  stage_name = "dev"
  function_name = module.lambda.function_name
  function_version = module.lambda.function_version
  depends_on = [
    module.lambda
  ]
}

module "article" {
  source = "./article"
  aws_region = var.aws_region
  project_name = var.project_name
  resource_name = "article"
  function_arn = module.lambda.function_arn
  authorizer_id = module.api-gateway.authorizer_id
  depends_on = [
    module.api-gateway
  ]
}

module "article-catalog" {
  source = "./article-catalog"
  aws_region = var.aws_region
  project_name = var.project_name
  resource_name = "article-catalog"
  function_name = module.lambda.function_name
  function_arn = module.lambda.function_arn
  authorizer_id = module.api-gateway.authorizer_id
  depends_on = [
    module.api-gateway
  ]
}

module "article-reader-count" {
  source = "./article-reader-count"
  aws_region = var.aws_region
  project_name = var.project_name
  resource_name = "article-reader-count"
  function_arn = module.lambda.function_arn
  authorizer_id = module.api-gateway.authorizer_id
  depends_on = [
    module.api-gateway
  ]
}