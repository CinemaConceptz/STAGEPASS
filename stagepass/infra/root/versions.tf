terraform {
  required_version = ">= 1.5.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = ">= 5.30.0"
    }
  }
  backend "gcs" {
    # Bucket and prefix will be provided via CLI backend-config or partial config
  }
}