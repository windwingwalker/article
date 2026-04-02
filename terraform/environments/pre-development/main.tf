module "resource_group" {
  source = "../../modules/resource-group"
  project_name = local.stack_project_name
}

module "ecr" {
  source = "../../modules/ecr"
  resource_name = local.ecr_repository_name
}
