#!/bin/bash

# Editly Web Interface - Google Cloud Deployment Script
# Run this on your Google Cloud Linux instance

set -e  # Exit on error

echo "╔════════════════════════════════════════════════════════════════════════╗"
echo "║                                                                        ║"
echo "║   Editly Web Interface - Google Cloud Deployment Setup                ║"
echo "║                                                                        ║"
echo "╚════════════════════════════════════════════════════════════════════════╝"
echo ""

# Step 1: Update system
echo "📦 Step 1: Updating system packages..."
sudo apt-get update -y
sudo apt-get upgrade -y

# Step 2: Install Node.js 18+
echo "📦 Step 2: Installing Node.js 18+..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify Node.js installation
echo "✅ Node.js version:"
node --version
echo "✅ npm version:"
npm --version
echo ""

# Step 3: Install FFmpeg
echo "📦 Step 3: Installing FFmpeg..."
sudo apt-get install -y ffmpeg

# Verify FFmpeg
echo "✅ FFmpeg installed:"
ffmpeg -version | head -3
echo ""

# Step 4: Install Git (if not already installed)
echo "📦 Step 4: Installing Git..."
sudo apt-get install -y git

# Step 5: Create app directory
echo "📦 Step 5: Setting up application directory..."
mkdir -p /opt/editly
cd /opt/editly

echo "✅ Project directory: /opt/editly"
echo ""

# Step 6: Instructions for copying files
echo "╔════════════════════════════════════════════════════════════════════════╗"
echo "║                                                                        ║"
echo "║  ✅ SERVER SETUP COMPLETE!                                            ║"
echo "║                                                                        ║"
echo "║  Next Steps:                                                           ║"
echo "║                                                                        ║"
echo "║  1. On your LOCAL machine, copy the project:                          ║"
echo "║                                                                        ║"
echo "║     gcloud compute scp --recursive \\                                 ║"
echo "║       C:\\Users\\sorin\\Desktop\\json2video/* \\                       ║"
echo "║       instance-20251117-105725:/opt/editly/ \\                        ║"
echo "║       --zone=us-central1-a                                            ║"
echo "║                                                                        ║"
echo "║  2. Then SSH back and finish setup:                                   ║"
echo "║                                                                        ║"
echo "║     gcloud compute ssh instance-20251117-105725 \\                    ║"
echo "║       --zone=us-central1-a                                            ║"
echo "║                                                                        ║"
echo "║  3. Continue with STEP 2 in the deployment instructions               ║"
echo "║                                                                        ║"
echo "╚════════════════════════════════════════════════════════════════════════╝"
