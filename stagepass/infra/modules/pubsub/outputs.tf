output "topic_names" {
  value = { for t in google_pubsub_topic.topic : t.name => t.name }
}
output "topic_ids" {
  value = { for t in google_pubsub_topic.topic : t.name => t.id }
}