# Deploy Editly Web to Google Cloud

This guide shows how to deploy the Editly web interface to Google Cloud Platform.

## Prerequisites

1. Google Cloud Account (free trial available)
2. `gcloud` CLI installed: https://cloud.google.com/sdk/docs/install
3. Docker installed (for local testing)

## Option 1: Cloud Run (Easiest)

Cloud Run is serverless - you pay only for execution time.

### Step 1: Create Google Cloud Project

```bash
# Login
gcloud auth login

# Create project
gcloud projects create editly-app --name="Editly Web"

# Set as current project
gcloud config set project editly-app

# Enable required APIs
gcloud services enable containerregistry.googleapis.com
gcloud services enable run.googleapis.com
```

### Step 2: Build Docker Image

The project already has a Dockerfile. Build it:

```bash
# From project root
docker build -t gcr.io/editly-app/editly-web:latest .
```

### Step 3: Push to Container Registry

```bash
# Configure Docker auth
gcloud auth configure-docker

# Push image
docker push gcr.io/editly-app/editly-web:latest
```

### Step 4: Deploy to Cloud Run

```bash
gcloud run deploy editly-web \
  --image gcr.io/editly-app/editly-web:latest \
  --platform managed \
  --region us-central1 \
  --memory 2Gb \
  --timeout 1800 \
  --allow-unauthenticated
```

**Parameters explained:**
- `--memory 2Gb`: 2GB RAM (increase for HD videos)
- `--timeout 1800`: 30 minutes max execution (for long videos)
- `--allow-unauthenticated`: Allow public access

### Step 5: Access Your App

Cloud Run will output a URL like:
```
https://editly-web-xxxxxxxx-uc.a.run.app
```

### Step 6: Upload Storage Handling

Cloud Run has ephemeral storage. Use Google Cloud Storage instead:

1. Create a bucket:
```bash
gsutil mb gs://editly-app-storage
```

2. Update server.js to use Cloud Storage (requires additional setup)

## Option 2: Compute Engine (More Control)

For persistent VMs with more resources.

### Step 1: Create VM Instance

```bash
gcloud compute instances create editly-vm \
  --image-family=debian-11 \
  --image-project=debian-cloud \
  --machine-type=n1-standard-2 \
  --zone=us-central1-a \
  --scopes=https://www.googleapis.com/auth/cloud-platform
```

### Step 2: SSH into VM

```bash
gcloud compute ssh editly-vm --zone=us-central1-a
```

### Step 3: Install Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install FFmpeg
sudo apt install -y ffmpeg

# Install build tools
sudo apt install -y build-essential python3
```

### Step 4: Deploy Application

```bash
# Clone or copy your project
cd /opt
sudo git clone <your-repo> editly
cd editly

# Install dependencies
npm install
npm run build

# Run with systemd for persistence
sudo cat > /etc/systemd/system/editly.service << EOF
[Unit]
Description=Editly Web Server
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/editly
ExecStart=/usr/bin/node server.js
Restart=always

[Install]
WantedBy=multi-user.target
EOF

# Enable and start
sudo systemctl enable editly
sudo systemctl start editly
```

### Step 5: Configure Firewall

```bash
gcloud compute firewall-rules create allow-editly \
  --allow=tcp:5000 \
  --source-ranges=0.0.0.0/0
```

### Step 6: Get IP Address

```bash
gcloud compute instances describe editly-vm --zone=us-central1-a \
  | grep EXTERNAL_IP
```

Access at: `http://<EXTERNAL_IP>:5000`

## Option 3: App Engine (Standard)

For simple, auto-scaling deployments.

### Step 1: Create app.yaml

```yaml
runtime: nodejs18

env: standard

handlers:
- url: /.*
  script: auto

env_variables:
  NODE_ENV: "production"
  PORT: "8080"

automatic_scaling:
  min_instances: 1
  max_instances: 10
```

### Step 2: Deploy

```bash
gcloud app deploy
```

Access at: `https://editly-app.appspot.com`

## Option 4: Cloud Build + Cloud Run (CI/CD)

Automatic deployment from GitHub.

### Step 1: Connect GitHub

```bash
gcloud builds connect --repository-name=editly
```

### Step 2: Create cloudbuild.yaml

```yaml
steps:
  # Build Docker image
  - name: 'gcr.io/cloud-builders/docker'
    args:
      - 'build'
      - '-t'
      - 'gcr.io/$PROJECT_ID/editly-web:$SHORT_SHA'
      - '.'

  # Push to Container Registry
  - name: 'gcr.io/cloud-builders/docker'
    args:
      - 'push'
      - 'gcr.io/$PROJECT_ID/editly-web:$SHORT_SHA'

  # Deploy to Cloud Run
  - name: 'gcr.io/cloud-builders/gke-deploy'
    args:
      - 'run'
      - '--filename=.'
      - '--image=gcr.io/$PROJECT_ID/editly-web:$SHORT_SHA'
      - '--region=us-central1'

images:
  - 'gcr.io/$PROJECT_ID/editly-web:$SHORT_SHA'
```

### Step 3: Push to GitHub

```bash
git add .
git commit -m "Add cloudbuild.yaml"
git push origin main
```

Cloud Build will auto-deploy on every push!

## Monitoring & Logs

### View Cloud Run Logs

```bash
gcloud run logs read editly-web --limit 50
```

### View Compute Engine Logs

```bash
gcloud compute instances tail editly-vm \
  --zone=us-central1-a
```

## Cost Estimation

| Service | Cost |
|---------|------|
| Cloud Run (1M requests) | ~$50/month |
| Compute Engine (n1-standard-2) | ~$50/month |
| Cloud Storage | ~$0.02/GB stored |
| Network egress | ~$0.12/GB |

**Example**: 1000 videos/month, 100MB each
- Cloud Run: $50 + $20 (execution) + $2.40 (storage) = ~$72/month
- Compute Engine: $50 + $2.40 = ~$52/month

## Environment Variables

Create `.env.yaml` for sensitive config:

```yaml
env_variables:
  MAX_FILE_SIZE: "500000000"
  UPLOADS_DIR: "/tmp/uploads"
  OUTPUT_DIR: "/tmp/outputs"
  NODE_ENV: "production"
```

## Scaling

### Cloud Run
- Auto-scales to handle traffic
- Set `--max-instances` to control costs
- Memory increases improve performance

### Compute Engine
- Manual scaling with instance groups
- Load balancer for distribution
- More control but more complexity

## Backup & Restore

### Backup Outputs to Cloud Storage

```bash
# In server.js, add:
const storage = require('@google-cloud/storage');
const bucket = storage.bucket('editly-outputs');

// After rendering:
await bucket.upload(outputPath);
```

## Security

1. **Authenticate users** (optional):
```bash
gcloud run deploy editly-web --no-allow-unauthenticated
```

2. **Use Cloud IAM** for access control

3. **Enable HTTPS** (automatic on Cloud Run)

4. **Restrict file uploads**:
```javascript
// In server.js
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
```

## Domain & SSL

### Use Custom Domain

```bash
gcloud run domain-mappings create \
  --service=editly-web \
  --domain=editly.yourcompany.com
```

SSL is automatic!

## Advanced: Use Cloud Storage for Files

Replace local file storage:

```javascript
// Install package
// npm install @google-cloud/storage

const {Storage} = require('@google-cloud/storage');
const storage = new Storage();
const bucket = storage.bucket('editly-app-files');

// Upload endpoint
app.post('/api/upload', async (req, res) => {
  const file = req.file;
  const gcsFile = bucket.file(file.filename);

  await gcsFile.save(file.buffer);

  res.json({
    filename: file.filename,
    path: `gs://editly-app-files/${file.filename}`
  });
});
```

## Troubleshooting

### Cloud Run timeout
Increase `--timeout` value (max 3600 seconds)

### Out of memory
Increase `--memory` (max 8Gb)

### Cold starts slow
Set `--min-instances=1` to keep warm

### Cannot reach from internet
Check firewall rules and authentication

## Support & Resources

- Google Cloud Docs: https://cloud.google.com/docs
- Cloud Run Pricing: https://cloud.google.com/run/pricing
- Example projects: https://cloud.google.com/run/docs/quickstarts

## Next Steps

1. Deploy using one of the methods above
2. Monitor logs and performance
3. Set up CI/CD for auto-deployment
4. Add authentication if needed
5. Scale based on usage

Good luck! 🚀
