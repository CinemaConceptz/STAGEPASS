terraform {
  required_version = ">= 1.5.0"
}

resource "google_pubsub_topic" "topic" {
  for_each = toset(var.topics)
  name     = each.value
  project  = var.project_id
}