terraform {
  required_version = ">= 1.5.0"
}

resource "google_artifact_registry_repository" "repo" {
  for_each      = toset(var.repos)
  location      = var.region
  repository_id = each.value
  description   = "Docker repository for ${each.value}"
  format        = "DOCKER"
  project       = var.project_id
}