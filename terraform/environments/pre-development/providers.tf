provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project = local.stack_project_name
    }
  }
}
