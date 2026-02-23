variable "project_id" {}
variable "region" {}
variable "name" {}
variable "image" {}
variable "env_vars" { type = map(string) }
variable "secrets" { type = map(string) }
variable "allow_unauthenticated" { type = bool }