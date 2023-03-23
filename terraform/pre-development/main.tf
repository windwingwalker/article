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

module "resource_group" {
  source = "../modules/resource-group"
  project_name = var.project_name
}

module "ecr" {
  source = "../modules/ecr"
  resource_name = "article"
}

