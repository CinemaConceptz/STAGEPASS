terraform {
  required_version = ">= 1.5.0"
}

resource "google_cloud_run_service" "default" {
  name     = var.name
  location = var.region
  project  = var.project_id

  template {
    spec {
      containers {
        image = var.image
        
        dynamic "env" {
          for_each = var.env_vars
          content {
            name  = env.key
            value = env.value
          }
        }
      }
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }
}

resource "google_cloud_run_service_iam_member" "invoker" {
  count    = var.allow_unauthenticated ? 1 : 0
  service  = google_cloud_run_service.default.name
  location = google_cloud_run_service.default.location
  project  = google_cloud_run_service.default.project
  role     = "roles/run.invoker"
  member   = "allUsers"
}