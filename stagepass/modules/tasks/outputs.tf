output "queue_names" {
  value = { for q in google_cloud_tasks_queue.queue : q.name => q.name }
}