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
  lambda_env_var = {API_ID = "xvswxp2a96"}
}

resource "aws_lambda_event_source_mapping" "default" {
  event_source_arn = "arn:aws:sqs:${var.aws_region}:${var.aws_account_id}:${var.resource_name}"
  function_name    = module.lambda.function_arn
}