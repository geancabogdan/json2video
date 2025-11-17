# Google Cloud Deployment Checklist

Use this checklist to track your deployment progress.

## ✅ Pre-Deployment (Windows Machine)

- [ ] Editly project is at: `C:\Users\sorin\Desktop\json2video`
- [ ] Run: `npm run build` successfully
- [ ] `dist/` folder exists with compiled files
- [ ] Google Cloud SDK installed (gcloud command works)
- [ ] Have SSH access to: `instance-20251117-105725`

## ✅ Step 1: Build Project

- [ ] Open Command Prompt/PowerShell
- [ ] Navigate to: `C:\Users\sorin\Desktop\json2video`
- [ ] Run: `npm run build`
- [ ] Wait for build to complete
- [ ] Verify `dist/` folder exists with `index.js`

## ✅ Step 2: Copy to Cloud

- [ ] Open NEW PowerShell window
- [ ] Run copy command:
  ```bash
  gcloud compute scp --recursive C:\Users\sorin\Desktop\json2video/* instance-20251117-105725:/opt/editly/ --zone=us-central1-a
  ```
- [ ] Wait for files to upload (may take 1-2 minutes)
- [ ] See "Transfer complete" message

## ✅ Step 3: SSH Into Instance

- [ ] Run SSH command:
  ```bash
  gcloud compute ssh instance-20251117-105725 --zone=us-central1-a
  ```
- [ ] See Linux terminal prompt: `sos_sorin30@instance...`
- [ ] You're now in SSH session

## ✅ Step 4: Install Dependencies

In SSH terminal, run these commands ONE AT A TIME:

- [ ] `sudo apt-get update -y`
  - Wait for "Reading package lists..."
  - See "done" message

- [ ] `curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -`
  - Wait for setup script to complete

- [ ] `sudo apt-get install -y nodejs ffmpeg`
  - Wait for installation to complete
  - See packages being installed

## ✅ Step 5: Verify Installations

Still in SSH, run:

- [ ] `node --version`
  - Should see: `v18.x.x` or higher

- [ ] `npm --version`
  - Should see: `8.x.x` or higher

- [ ] `ffmpeg -version`
  - Should see FFmpeg version info

## ✅ Step 6: Build and Start Server

Still in SSH:

- [ ] `cd /opt/editly`
  - Should navigate without errors

- [ ] `npm install`
  - Wait for packages to install
  - May take 1-2 minutes

- [ ] `npm run build`
  - Should compile successfully
  - See "Done" message

- [ ] `node server.js`
  - Should see:
    ```
    ✨ Editly Web Server running at http://localhost:5000
    📂 Uploads: /opt/editly/uploads
    📤 Outputs: /opt/editly/outputs
    ```

## ✅ Step 7: Configure Firewall

**IMPORTANT: Keep SSH terminal running! Don't close it!**

Open NEW PowerShell window:

- [ ] Run firewall command:
  ```bash
  gcloud compute firewall-rules create allow-editly --allow=tcp:5000 --source-ranges=0.0.0.0/0
  ```

- [ ] Wait for success message
- [ ] See something like: "Created [https://www.googleapis.com/compute/v1/projects/...]"

## ✅ Step 8: Get Public IP

In the NEW PowerShell (not SSH):

- [ ] Run:
  ```bash
  gcloud compute instances describe instance-20251117-105725 --zone=us-central1-a --format='get(networkInterfaces[0].accessConfigs[0].natIP)'
  ```

- [ ] Copy the IP address returned (e.g., 35.184.15.33)
- [ ] Save it somewhere - you'll need it!

## ✅ Step 9: Test in Browser

- [ ] Open new browser tab
- [ ] Go to: `http://<YOUR_IP>:5000`
  - Replace `<YOUR_IP>` with the IP from Step 8
  - Example: `http://35.184.15.33:5000`

- [ ] See the Editly web interface with:
  - [ ] Left panel with "Clips"
  - [ ] Center panel with "Visual Editor"
  - [ ] Right panel with "Render Jobs"
  - [ ] Purple/blue gradient background

## ✅ Step 10: Create Test Video (Optional)

- [ ] Click "+ Add Clip"
- [ ] Choose "Solid Color"
- [ ] Set color: `#667EEA`
- [ ] Set duration: `3`
- [ ] Click "Render Video"
- [ ] Wait for rendering
- [ ] See "completed" status
- [ ] Download video

## ✅ Step 11: Keep Server Running Permanently (Optional)

If you want the server to run even after closing SSH:

In SSH terminal (that's running the server):

- [ ] Press `Ctrl+C` to stop current server
- [ ] Run:
  ```bash
  cd /opt/editly
  nohup node server.js > server.log 2>&1 &
  ```

- [ ] See shell prompt return
- [ ] Can now close SSH safely
- [ ] Server keeps running in background

## ✅ Verification Commands

Anytime, to verify things are working:

```bash
# Check server is running
ps aux | grep "node server"

# View logs
tail -f server.log

# Check disk space
df -h

# Check system memory
free -h

# Check ports open
sudo netstat -tlnp | grep :5000
```

## 🎉 COMPLETE!

Your Editly video editor is now:
- ✅ Running on Google Cloud
- ✅ Publicly accessible
- ✅ Ready to use

### Share the link:
```
http://<YOUR_IP>:5000
```

### Document for later:
- Instance: `instance-20251117-105725`
- IP Address: `__________________` (fill in)
- SSH User: `sos_sorin30`
- Project Location: `/opt/editly`
- Server Log: `/opt/editly/server.log`

## 🆘 Troubleshooting

| Problem | Solution |
|---------|----------|
| Can't SSH in | Check zone is `us-central1-a` |
| Server won't start | Check Node.js installed: `node --version` |
| Can't reach web interface | Check firewall rule created, check IP is correct |
| Videos won't render | Check FFmpeg installed: `ffmpeg -version` |
| Can't copy files | Check `gcloud` CLI installed |

## 📚 Need Help?

See these files for detailed instructions:
- `CLOUD_QUICKSTART.txt` - Quick reference
- `GOOGLE_CLOUD_DEPLOY_GUIDE.md` - Detailed guide
- `START_HERE.md` - General getting started

---

**Status:** Go through this checklist step by step. Check off each item as you complete it. You're on track! 🚀
