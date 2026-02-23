output "raw_bucket" { value = google_storage_bucket.raw.name }
output "processed_bucket" { value = google_storage_bucket.processed.name }
output "live_bucket" { value = google_storage_bucket.live.name }