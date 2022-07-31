variable "ms_name" {
  type = string 
}

variable "image_tag" {
  type = string
}

variable "lambda_env_var" {
  type = map
}

variable "timeout" {
  type = number
  default = 900
}