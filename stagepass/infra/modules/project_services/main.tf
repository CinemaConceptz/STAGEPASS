terraform {
  required_version = ">= 1.5.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = ">= 5.0.0"
    }
  }
}

resource "google_project_service" "services" {
  for_each = toset(var.services)
  project  = var.project_id
  service  = each.value

  disable_on_destroy = false
}