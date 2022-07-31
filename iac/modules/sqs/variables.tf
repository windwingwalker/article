variable "resource_name" {
  type = string 
}

variable "visibility_timeout_seconds" {
  type = number
  default = 1000
}

variable "message_retention_seconds" {
  type = number
  default = 1209600
}

variable "receive_wait_time_seconds" {
  type = number
  default = 10
}