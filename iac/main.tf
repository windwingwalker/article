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

module "resource_group" {
  source = "./modules/resource-group"
  project_name = var.project_name
}