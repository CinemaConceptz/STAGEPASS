terraform {
  required_version = ">= 1.5.0"
}

resource "google_cloud_tasks_queue" "queue" {
  for_each = toset(var.queues)
  name     = each.value
  location = var.region
  project  = var.project_id
}