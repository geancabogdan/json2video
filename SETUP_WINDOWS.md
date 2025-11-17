# Windows Setup Guide for Editly Web Interface

This guide helps you set up the Editly web interface on Windows.

## Prerequisites

You'll need to install build tools to compile the `canvas` native module.

### Option 1: Quick Install (Recommended)

Install windows-build-tools (requires Administrator):

```bash
npm install -g windows-build-tools
```

This automatically installs:
- Python 3
- Visual Studio Build Tools
- Everything needed for node-gyp

Then rebuild canvas:
```bash
npm rebuild canvas
```

### Option 2: Manual Install

1. Install Python 3.11+ from https://www.python.org/
   - Check "Add Python to PATH" during installation

2. Install Visual Studio Build Tools:
   - Download from: https://visualstudio.microsoft.com/downloads/
   - Look for "Build Tools for Visual Studio 2022"
   - Select "Desktop development with C++"
   - Install

3. Rebuild canvas:
```bash
npm rebuild canvas
```

### Option 3: Use Pre-built Binary (If Available)

Check if there's a pre-built canvas binary for your Node version:

```bash
npm install canvas@2.11.2 --no-save --verbose
```

## Starting the Web Server

Once setup is complete:

### First Time
```bash
npm install
npm run build
npm start
```

### Subsequent Times
```bash
npm run dev
```

## Verification

Test that everything works:

```bash
npm run dev
```

You should see:
```
✨ Editly Web Server running at http://localhost:5000
📂 Uploads: C:\Users\sorin\Desktop\json2video\uploads
📤 Outputs: C:\Users\sorin\Desktop\json2video\outputs
```

Open http://localhost:5000 in your browser.

## Troubleshooting

### "Cannot find module 'canvas.node'"
The canvas module wasn't built. Try:
```bash
npm rebuild canvas
```

If that fails, reinstall it:
```bash
npm uninstall canvas
npm install canvas@2.11.2
```

### "Visual Studio installation to use" not found
Install Visual Studio Build Tools (see Option 2 above)

### Port 5000 already in use
Use a different port:
```bash
set PORT=3000 && npm run dev
```

### FFmpeg not found
Download from: https://ffmpeg.org/download.html

Add to PATH or specify location in .env:
```env
FFMPEG_PATH=C:\path\to\ffmpeg.exe
```

## Docker Alternative

Skip all build tools - just use Docker:

```bash
docker build -t editly-web .
docker run -p 5000:5000 editly-web
```

Requires: Docker Desktop for Windows

## Performance Notes

Windows may be slower at rendering videos than Linux/Mac due to:
- Disk I/O with temp files
- Canvas rendering performance
- FFmpeg compilation

For production, consider deploying to Linux (cloud) instead.

## Next Steps

Once running, see **QUICK_START.md** for how to use the interface.
