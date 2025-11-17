# Editly Web Interface

🎬 **Create beautiful videos programmatically with an intuitive web interface**

A complete web-based editor for [Editly](https://github.com/mifi/editly) - the declarative video editing engine.

## ✨ Features

- 🎯 **Visual Clip Editor** - Drag-and-drop interface for managing clips and layers
- 📁 **File Upload** - Upload videos, images, and audio files directly from browser
- 🎨 **Layer Support** - Text, images, videos, gradients, and solid colors
- 🔄 **Transitions** - 40+ built-in transition effects
- 📊 **Real-time Status** - Monitor rendering progress with live updates
- 📥 **Download** - Get your finished videos instantly
- 🔌 **REST API** - Full API for programmatic access
- ☁️ **Cloud Ready** - Deploy to Google Cloud, AWS, or anywhere

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- FFmpeg installed on your system
- (Windows: Visual Studio Build Tools for canvas module)

### Installation

```bash
# Install dependencies
npm install

# Build Editly
npm run build

# Start web server
npm run dev
```

Open browser to: **http://localhost:5000**

## 📖 Documentation

| Document | Purpose |
|----------|---------|
| **QUICK_START.md** | Get running in 5 minutes with examples |
| **WEB_INTERFACE.md** | Complete feature docs and API reference |
| **WEB_SETUP_SUMMARY.md** | Overview of what was created |
| **SETUP_WINDOWS.md** | Windows-specific setup instructions |
| **DEPLOY_GOOGLE_CLOUD.md** | Deploy to Google Cloud Platform |

## 🎯 First Video

1. Open http://localhost:5000
2. Click "+ Add Clip"
3. Select layer type (e.g., "Solid Color")
4. Set duration to 3 seconds
5. Click "▶️ Render Video"
6. Download when complete!

## 📁 What Was Created

```
json2video/
├── server.js              # Express.js API server
├── public/
│   └── index.html         # React web interface
├── uploads/               # User-uploaded files
├── outputs/               # Rendered videos
└── WEB_*.md              # Documentation files
```

## 🔧 How It Works

```
Browser UI (React)
    ↓ (JSON config)
Express API Server
    ↓ (calls)
Editly Engine (Frame rendering)
    ↓ (raw frames)
FFmpeg (Video encoding)
    ↓ (file)
Downloaded MP4 Video
```

## 📊 Layer Types

| Type | Description |
|------|-------------|
| `fill-color` | Solid color background |
| `video` | Video file playback |
| `image` | Static image display |
| `title` | Text/title overlay |
| `image-overlay` | Positioned image |
| `linear-gradient` | Gradient fills |
| `radial-gradient` | Radial gradients |
| `canvas` | Custom HTML5 Canvas |
| `fabric` | Fabric.js graphics |

## 🔄 Transitions

Choose from 40+ transitions including:
- Cross Fade
- Circle Open
- Slide Left/Right
- Directional Wipes
- Water Drop
- Bounce
- And many more!

## 📡 API Endpoints

### Upload File
```bash
POST /api/upload
```

### Render Video
```bash
POST /api/render
Body: { clips, width, height, fps, outPath }
```

### Get Job Status
```bash
GET /api/render/:jobId/status
```

### Download Video
```bash
GET /api/render/:jobId/download
```

## 🌐 Environment Variables

```env
PORT=5000                    # Server port
NODE_ENV=development         # development or production
MAX_FILE_SIZE=500000000      # Max upload size in bytes
UPLOADS_DIR=./uploads        # Upload directory
OUTPUT_DIR=./outputs         # Output directory
```

## ⚙️ Performance

| Setting | Recommendation |
|---------|---|
| **Preview** | 640×360, 15 fps |
| **Standard** | 1280×720, 30 fps |
| **HD** | 1920×1080, 30 fps |
| **4K** | 3840×2160, 24 fps |

Memory needed: 2-4GB for HD video

## 🐳 Docker

```bash
# Build and run with Docker
docker-compose up

# Access at http://localhost:5000
```

Or:

```bash
docker build -t editly-web .
docker run -p 5000:5000 editly-web
```

## ☁️ Cloud Deployment

Deploy to Google Cloud in minutes:

```bash
# Cloud Run (serverless)
gcloud run deploy editly-web \
  --source . \
  --region us-central1 \
  --allow-unauthenticated

# Or see DEPLOY_GOOGLE_CLOUD.md for detailed instructions
```

Estimated cost: $50-100/month

## 🎨 Example Usage

### Simple Color Video

```javascript
// Via UI: Just select "Solid Color" layer
// Or via API:
POST /api/render
{
  "clips": [{
    "duration": 5,
    "layers": [{
      "type": "fill-color",
      "color": "#667eea"
    }],
    "transition": {
      "name": "crossFade",
      "duration": 1
    }
  }],
  "width": 1280,
  "height": 720,
  "fps": 30,
  "outPath": "./outputs/demo.mp4"
}
```

### Video with Text Overlay

```javascript
{
  "clips": [{
    "duration": 4,
    "layers": [
      {
        "type": "video",
        "path": "/uploads/video.mp4"
      },
      {
        "type": "title",
        "text": "My Video",
        "fontSize": 80,
        "color": "white"
      }
    ]
  }],
  "width": 1920,
  "height": 1080,
  "fps": 30,
  "outPath": "./outputs/with-text.mp4"
}
```

## 🔌 Integration Examples

### Node.js Client

```javascript
import fetch from 'node-fetch';

async function renderVideo() {
  const response = await fetch('http://localhost:5000/api/render', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      clips: [{
        duration: 4,
        layers: [{ type: 'fill-color', color: '#667eea' }]
      }],
      width: 1280,
      height: 720,
      fps: 30,
      outPath: './outputs/test.mp4'
    })
  });

  const { jobId } = await response.json();
  console.log('Rendering job:', jobId);
}

renderVideo();
```

### cURL

```bash
curl -X POST http://localhost:5000/api/render \
  -H "Content-Type: application/json" \
  -d @spec.json

# Check status
curl http://localhost:5000/api/render/{jobId}/status
```

## 🛠️ Development

### Project Structure

```
server.js           - Express API server
public/index.html   - React frontend (all-in-one file)
dist/               - Compiled Editly (generated)
uploads/            - User uploads
outputs/            - Rendered videos
```

### Scripts

```bash
npm run build       # Build Editly
npm run dev         # Run server (no rebuild)
npm start           # Build + run server
npm run web         # Alias for start
```

### Modifying the Frontend

Edit `public/index.html` - it's a single React file with inline styles.

### Customizing the Backend

Edit `server.js` to:
- Change port
- Add authentication
- Modify file upload limits
- Add new API endpoints
- Integrate with cloud storage

## 📚 Learn More

- **Editly Main Repo**: https://github.com/mifi/editly
- **Editly Documentation**: https://github.com/mifi/editly#readme
- **Node.js/Express**: https://expressjs.com/
- **React**: https://react.dev/

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| Canvas module error | `npm rebuild canvas` (Windows) |
| Port already in use | `PORT=3000 npm run dev` |
| FFmpeg not found | Install FFmpeg from ffmpeg.org |
| Server won't start | Check logs, rebuild: `npm run build` |
| Slow rendering | Reduce resolution/FPS for testing |
| Upload fails | Check file size < 500MB |

See **WEB_INTERFACE.md** for more troubleshooting.

## 🔐 Security

- Currently allows public access
- Consider adding authentication for production:
  ```javascript
  // In server.js
  app.use((req, res, next) => {
    if (!req.headers.authorization) return res.status(401).send('Unauthorized');
    next();
  });
  ```

- File uploads validated by MIME type
- FFmpeg runs in separate process (sandboxed)
- Set `MAX_FILE_SIZE` environment variable for limits

## 📦 Deployment Checklist

- [ ] Install Node.js 18+
- [ ] Install FFmpeg
- [ ] Clone/download project
- [ ] Run `npm install`
- [ ] Run `npm run build`
- [ ] Start with `npm start` or `npm run dev`
- [ ] Test at http://localhost:5000
- [ ] (Optional) Deploy to cloud using DEPLOY_GOOGLE_CLOUD.md

## 📝 License

MIT - Same as Editly

## 🙏 Credits

- **Editly**: Created by [Mikael Finstad](https://github.com/mifi)
- **Web Interface**: Built with Express.js and React

## 🆘 Support

### Having issues?

1. Read QUICK_START.md (5-min guide)
2. Check WEB_INTERFACE.md (detailed docs)
3. Review error messages in console
4. Check browser console (F12)
5. Check server logs in terminal

### Report bugs

- Editly bugs: https://github.com/mifi/editly/issues
- Web interface: Check error messages in logs

---

**Ready to create videos?** 🎬

```bash
npm run dev
# Open http://localhost:5000
```

Start with QUICK_START.md or jump right in!
