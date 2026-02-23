terraform {
  required_version = ">= 1.5.0"
}

resource "google_secret_manager_secret" "secret" {
  for_each  = toset(var.secrets)
  secret_id = each.value
  project   = var.project_id
  replication {
    auto {}
  }
}