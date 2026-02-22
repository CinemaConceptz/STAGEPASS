variable "project_id" { type = string }
variable "env"        { type = string } # dev|stage|prod
variable "region"     { type = string } # ex: us-central1
variable "location"   { type = string } # ex: us

variable "domain_web" { type = string } # web domain
variable "domain_api" { type = string } # api domain

variable "enabled_services" { type = list(string) }

# Images (Artifact Registry)
variable "image_web"   { type = string }
variable "image_api"   { type = string }
variable "image_media_worker" { type = string }
variable "image_mod_worker"   { type = string }

# Cost controls
variable "budget_amount_usd" { type = number }

# Media
variable "max_upload_mb" { type = number }
variable "signed_url_ttl_seconds" { type = number }

# Butler / AI
variable "vertex_region" { type = string }