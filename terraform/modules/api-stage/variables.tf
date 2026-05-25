variable "stage_name" {
  type = string
}

variable "project_name" {
  type = string
}

variable "api_name" {
  type    = string
  default = null
}

variable "domain_name" {
  type    = string
  default = "api.windwingwalker.xyz"
}

variable "base_path_override" {
  type    = string
  default = null
}

variable "create_base_path_mapping" {
  type    = bool
  default = true
}
