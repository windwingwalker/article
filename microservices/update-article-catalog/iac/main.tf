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

module "lambda" {
  source = "../../../iac/modules/lambda/"
  ms_name = var.ms_name
  image_tag = var.image_tag
  lambda_env_var = null
}

module "eventbridge" {
  source = "../../../iac/modules/eventbridge"
  ms_name = var.ms_name
  function_arn = module.lambda.function_arn
  description = "Fires at 3am UTC+8 daily"
  schedule_expression = "cron(0 21 * * ? *)"
}