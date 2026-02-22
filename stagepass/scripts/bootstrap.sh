#!/bin/bash
set -e

# Colors
BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔵 STAGEPASS Phase 1: Infrastructure Bootstrap${NC}"
echo "------------------------------------------------"

# 1. Configuration
echo -e "${YELLOW}Enter your Google Cloud Project ID (must be unique, e.g., stagepass-prod-123):${NC}"
read PROJECT_ID

echo -e "${YELLOW}Enter GCP Region (default: us-central1):${NC}"
read REGION
REGION=${REGION:-us-central1}

echo -e "${BLUE}👀 Checking gcloud authentication...${NC}"
if ! command -v gcloud &> /dev/null; then
    echo "❌ gcloud CLI not found. Please install Google Cloud SDK."
    exit 1
fi

gcloud auth print-access-token >/dev/null 2>&1 || { echo "❌ Please run 'gcloud auth login' first"; exit 1; }

# 2. Project Setup
echo -e "${BLUE}🚀 Setting up project $PROJECT_ID...${NC}"
gcloud projects create $PROJECT_ID --name="StagePass Production" || echo "⚠️ Project might already exist"
gcloud config set project $PROJECT_ID

echo -e "${YELLOW}💳 IMPORTANT: Ensure billing is enabled for this project via Google Cloud Console.${NC}"
echo "Press Enter after you have verified Billing is enabled..."
read

# 3. Enable Service APIs (Terraform needs these to run)
echo -e "${BLUE}🔌 Enabling Service Usage API...${NC}"
gcloud services enable serviceusage.googleapis.com cloudresourcemanager.googleapis.com

# 4. Create Terraform State Bucket
BUCKET_NAME="${PROJECT_ID}-tfstate"
echo -e "${BLUE}📦 Creating Terraform State Bucket: $BUCKET_NAME...${NC}"
if ! gcloud storage buckets describe gs://$BUCKET_NAME &> /dev/null; then
  gcloud storage buckets create gs://$BUCKET_NAME --location=$REGION
else
  echo "⚠️ Bucket already exists"
fi
gcloud storage buckets update gs://$BUCKET_NAME --versioning-enabled

# 5. Prepare Terraform
echo -e "${BLUE}🏗 Preparing Terraform...${NC}"
# Navigate to infra root relative to script location
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR/../infra/root"

# Generate backend config
cat > backend.hcl <<EOF
bucket = "$BUCKET_NAME"
prefix = "prod/state"
EOF

# Generate terraform.tfvars
cat > terraform.tfvars <<EOF
project_id = "$PROJECT_ID"
env        = "prod"
region     = "$REGION"
location   = "us"
domain_web = "stagepass.com"
domain_api = "api.stagepass.com"
enabled_services = [
  "run.googleapis.com",
  "firestore.googleapis.com",
  "storage.googleapis.com",
  "livestream.googleapis.com",
  "transcoder.googleapis.com",
  "networkservices.googleapis.com",
  "compute.googleapis.com",
  "secretmanager.googleapis.com",
  "artifactregistry.googleapis.com",
  "iam.googleapis.com",
  "logging.googleapis.com",
  "cloudtasks.googleapis.com",
  "pubsub.googleapis.com",
  "aiplatform.googleapis.com"
]
image_web = "us-docker.pkg.dev/cloudrun/container/hello"
image_api = "us-docker.pkg.dev/cloudrun/container/hello"
image_media_worker = "us-docker.pkg.dev/cloudrun/container/hello"
image_mod_worker = "us-docker.pkg.dev/cloudrun/container/hello"
budget_amount_usd = 100
max_upload_mb = 1024
signed_url_ttl_seconds = 3600
vertex_region = "$REGION"
EOF

echo -e "${GREEN}✅ Configuration generated at infra/root/terraform.tfvars${NC}"

# 6. Run Terraform
if command -v terraform &> /dev/null; then
    echo -e "${BLUE}🚀 Initializing Terraform...${NC}"
    terraform init -backend-config=backend.hcl
    
    echo "------------------------------------------------"
    echo -e "${GREEN}✅ Bootstrap Complete. Ready to Provision.${NC}"
    echo -e "${YELLOW}To apply infrastructure, run:${NC}"
    echo "  cd ../infra/root"
    echo "  terraform apply"
else
    echo "⚠️ Terraform not found. Please install Terraform to proceed."
    echo "Configuration files have been prepared."
fi
