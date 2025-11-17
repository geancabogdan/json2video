# Quick Start - Editly Web Interface

Get the web interface running in 5 minutes!

## Step 1: Build Editly

```bash
npm run build
```

This compiles the TypeScript code to JavaScript. It may take a minute.

## Step 2: Start the Web Server

```bash
npm start
```

or for development (skips rebuild):

```bash
npm run dev
```

You should see:
```
✨ Editly Web Server running at http://localhost:5000
📂 Uploads: C:\Users\sorin\Desktop\json2video\uploads
📤 Outputs: C:\Users\sorin\Desktop\json2video\outputs
```

## Step 3: Open in Browser

Go to: **http://localhost:5000**

## Step 4: Create Your First Video

### Example 1: Simple Color Video

1. Click "+ Add Clip"
2. In the right panel, choose layer type: **Solid Color**
3. Set color to `#FF6B6B` (red)
4. Duration: 3 seconds
5. Click "▶️ Render Video"
6. Wait for completion
7. Click "📥 Download Video"

### Example 2: Text Title

1. Click "+ Add Clip"
2. Choose layer type: **Title Text**
3. Enter text: "Hello World"
4. Duration: 4 seconds
5. Render and download

### Example 3: Video with Transitions

1. Add Clip 1
   - Upload a video file
   - Duration: 5s
   - Transition: Cross Fade
   - Transition Duration: 1s

2. Add Clip 2
   - Solid color or image
   - Duration: 4s

3. Render video with transitions between clips

## Keyboard Shortcuts

- Coming soon!

## Common Tasks

### Upload a video
1. Select a clip
2. Choose layer type: **Video File**
3. Click the file input and select a .mp4 or .mov file
4. It will upload automatically

### Change video resolution
- Top of editor: "Width" and "Height" fields
- Common: 1280×720 or 1920×1080

### Add background music
- Not yet in UI - use API directly
- POST to `/api/render` with `audioFilePath` parameter

### Make a GIF instead of video
- Not yet in UI - use API directly
- Use `.gif` extension in `outPath`

## Stopping the Server

Press `Ctrl+C` in the terminal where the server is running.

## Next Steps

- Read **WEB_INTERFACE.md** for full documentation
- Check out example specs in `examples/` folder
- Use the API directly for advanced features
- Deploy to cloud (Google Cloud, AWS, Heroku)

## Troubleshooting

### "Cannot find module 'express'"
```bash
npm install
```

### "FFmpeg not found"
**Windows**: Install FFmpeg from https://ffmpeg.org/download.html

**Mac**:
```bash
brew install ffmpeg
```

**Linux**:
```bash
sudo apt-get install ffmpeg
```

### Rendering is slow
- Try reducing resolution (640×360 for testing)
- Use FPS 15-24 for preview
- Shorter clips render faster

### "dist/index.js not found"
```bash
npm run build
```

## Performance Tips

| Task | Recommendation |
|------|---|
| Preview/test | 640×360, 15 fps |
| Standard | 1280×720, 30 fps |
| HD | 1920×1080, 30 fps |
| 4K | 3840×2160, 24 fps (slow!) |

## Common Errors & Fixes

| Error | Solution |
|-------|----------|
| Upload fails | Check file size < 500MB, format is mp4/jpg/png |
| Video has no audio | Audio upload not yet in UI, use API |
| Server won't start | Check port 5000 is free, try `PORT=3000 npm run dev` |
| Rendering never completes | Check server logs, may be out of disk space |

---

**Need help?** Check WEB_INTERFACE.md or the main README.md
