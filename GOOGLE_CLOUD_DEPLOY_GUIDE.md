# Deploy Editly Web to Google Cloud - Complete Guide

You have a Linux instance on Google Cloud. Here's how to deploy Editly there in 15 minutes.

## 📋 Your Instance Info

```
Instance: instance-20251117-105725
OS: Debian Linux (6.1.0-40-cloud-amd64)
User: sos_sorin30
```

## 🚀 Step 1: Prepare Your Local Machine

On your Windows machine, in the project folder:

```bash
# Make sure you have the built project
npm run build
```

## 🚀 Step 2: Copy Project to Cloud (From Windows)

Open Windows PowerShell or Command Prompt and run:

```bash
gcloud compute scp --recursive C:\Users\sorin\Desktop\json2video/* instance-20251117-105725:/opt/editly/ --zone=us-central1-a
```

**What this does:**
- Copies all project files to `/opt/editly/` on the cloud instance
- Uses gcloud CLI (must be installed)

**If you don't have gcloud CLI:**
```bash
# Download from: https://cloud.google.com/sdk/docs/install
# Or use Cloud Shell in Google Cloud Console
```

## 🚀 Step 3: Set Up Server Dependencies

SSH into your instance:

```bash
gcloud compute ssh instance-20251117-105725 --zone=us-central1-a
```

Once connected, run this setup script:

```bash
# Update system
sudo apt-get update -y
sudo apt-get upgrade -y

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install FFmpeg
sudo apt-get install -y ffmpeg

# Verify installations
node --version    # Should be v18+
npm --version     # Should be v8+
ffmpeg -version   # Should show FFmpeg version
```

## 🚀 Step 4: Build and Start the Server

Still in SSH:

```bash
cd /opt/editly

# Install dependencies
npm install

# Build Editly
npm run build

# Start the server
node server.js
```

You should see:
```
✨ Editly Web Server running at http://localhost:5000
📂 Uploads: /opt/editly/uploads
📤 Outputs: /opt/editly/outputs
```

## 🚀 Step 5: Configure Firewall (Important!)

**In a NEW terminal on your local machine:**

Allow port 5000 traffic:

```bash
gcloud compute firewall-rules create allow-editly \
  --allow=tcp:5000 \
  --source-ranges=0.0.0.0/0 \
  --description="Allow Editly web editor access"
```

## 🚀 Step 6: Get Your Public IP

In local terminal:

```bash
gcloud compute instances describe instance-20251117-105725 \
  --zone=us-central1-a \
  --format='get(networkInterfaces[0].accessConfigs[0].natIP)'
```

You'll get an IP like: `35.xxx.xxx.xxx`

## 🌐 Access Your Editor!

Open your browser to:

```
http://<YOUR_IP>:5000
```

Example:
```
http://35.235.244.33:5000
```

## ⚡ Run Server in Background (Recommended)

To keep the server running even after you close the SSH connection:

**In SSH terminal:**

```bash
cd /opt/editly

# Run in background with nohup
nohup node server.js > server.log 2>&1 &

# Verify it's running
ps aux | grep "node server.js"

# View logs anytime
tail -f server.log
```

Or use `screen`:

```bash
# Install screen
sudo apt-get install -y screen

# Start a new screen session
screen -S editly

# In the screen session
cd /opt/editly
node server.js

# Detach: Press Ctrl+A then D
# Reattach: screen -r editly
```

Or use systemd (permanent):

```bash
# Create service file
sudo tee /etc/systemd/system/editly.service > /dev/null << EOF
[Unit]
Description=Editly Web Server
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=/opt/editly
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Enable and start
sudo systemctl daemon-reload
sudo systemctl enable editly
sudo systemctl start editly

# Check status
sudo systemctl status editly

# View logs
sudo journalctl -u editly -f
```

## 📊 Full Terminal Commands (Copy & Paste)

### On Local Machine - Copy Files:
```bash
gcloud compute scp --recursive C:\Users\sorin\Desktop\json2video/* instance-20251117-105725:/opt/editly/ --zone=us-central1-a
```

### Setup Firewall:
```bash
gcloud compute firewall-rules create allow-editly --allow=tcp:5000 --source-ranges=0.0.0.0/0
```

### Get Public IP:
```bash
gcloud compute instances describe instance-20251117-105725 --zone=us-central1-a --format='get(networkInterfaces[0].accessConfigs[0].natIP)'
```

### On Cloud Instance - Full Setup:
```bash
# SSH in
gcloud compute ssh instance-20251117-105725 --zone=us-central1-a

# Once in SSH:
sudo apt-get update -y
sudo apt-get upgrade -y
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs ffmpeg
cd /opt/editly
npm install
npm run build
nohup node server.js > server.log 2>&1 &
```

## 🎯 Usage

1. **Open browser**: `http://<YOUR_IP>:5000`
2. **Create video** - Use the visual editor
3. **Upload files** - Click upload buttons
4. **Render** - Click render video
5. **Download** - Get your MP4

## 🔍 Monitoring

Check server is running:
```bash
# SSH in
gcloud compute ssh instance-20251117-105725 --zone=us-central1-a

# Check logs
tail -f server.log

# Or if using systemd
sudo journalctl -u editly -f
```

## 🛑 Stop Server

If you need to stop it:

```bash
# If running with nohup
pkill -f "node server.js"

# Or if using systemd
sudo systemctl stop editly
```

## 🔐 Security Notes

- Currently allows public access on port 5000
- For production, consider:
  - Adding authentication
  - Using HTTPS with Let's Encrypt
  - Restricting source IPs
  - Using a reverse proxy (nginx)

## 💰 Cost

Google Cloud free tier includes:
- 1 f1-micro instance free for 12 months
- Standard traffic pricing applies

Your editor won't consume much resources!

## 📚 Troubleshooting

### Server won't start
```bash
# Check Node.js installed
node --version

# Check FFmpeg installed
ffmpeg -version

# Check permissions
ls -la /opt/editly

# Check port is available
sudo lsof -i :5000
```

### Can't access from browser
```bash
# Verify firewall rule
gcloud compute firewall-rules list --filter="name:allow-editly"

# Check server is running
ps aux | grep "node server"

# Check IP is correct
gcloud compute instances describe instance-20251117-105725 --zone=us-central1-a
```

### Videos won't render
```bash
# Check FFmpeg
ffmpeg -version

# Check disk space
df -h

# Check logs
tail -f server.log
```

## 🎉 You're Done!

Your Editly web editor is now live on the internet!

Share the URL: `http://<YOUR_IP>:5000`

---

## Next Steps

1. ✅ Set up firewall rules
2. ✅ Copy project files
3. ✅ Install dependencies
4. ✅ Start server
5. 📝 (Optional) Set up custom domain
6. 🔒 (Optional) Add HTTPS with Let's Encrypt
7. 🔑 (Optional) Add authentication

## Support

See DEPLOY_GOOGLE_CLOUD.md for more options and configurations.
