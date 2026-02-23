terraform {
  required_version = ">= 1.5.0"
}

resource "google_billing_budget" "budget" {
  billing_account = data.google_billing_account.account.id
  display_name    = "Budget for ${var.project_id}"

  budget_filter {
    projects = ["projects/${var.project_id}"]
  }

  amount {
    specified_amount {
      currency_code = "USD"
      units         = var.amount_usd
    }
  }

  threshold_rules {
    threshold_percent = 0.5
  }
  threshold_rules {
    threshold_percent = 0.9
  }
}

data "google_project" "project" {
    project_id = var.project_id
}

data "google_billing_account" "account" {
  billing_account = data.google_project.project.billing_account
}