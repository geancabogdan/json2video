# Editly Web Interface

A complete web-based visual editor for Editly video creation tool.

## Features

✨ **Visual Layer Editor**
- Drag-and-drop clip management
- Real-time layer configuration
- Multiple layer types: video, image, title, solid colors
- Transition selection and timing

🎨 **Video Settings**
- Configurable resolution (width/height)
- FPS adjustment
- Title and metadata

📁 **File Upload**
- Upload video files directly from the browser
- Upload images for overlays
- Automatic file management

🔄 **Job Management**
- Real-time rendering status
- Progress tracking
- Job history
- Download completed videos

## Installation

### Prerequisites

- Node.js 18+
- FFmpeg installed on your system
- npm or yarn

### Setup

1. **Install dependencies** (already done if you followed the main setup):
```bash
cd json2video
npm install
```

2. **Build the Editly library**:
```bash
npm run build
```

3. **Ensure public folder exists**:
```bash
mkdir -p public
```

## Running the Web Server

### Option 1: Development Mode (Skips rebuild)
```bash
npm run dev
```
Runs the server at `http://localhost:5000` without rebuilding Editly.

### Option 2: Production Mode (Full build)
```bash
npm start
```
Rebuilds Editly and runs the server at `http://localhost:5000`.

### Option 3: Specific Port
```bash
PORT=3000 npm run dev
```

## How to Use

### 1. Access the Web Interface
Open your browser and go to: `http://localhost:5000`

### 2. Create Your First Video

**Step 1: Add Clips**
- Click "+ Add Clip" to create a new clip
- Each clip can have one or more layers

**Step 2: Configure Clip**
- Select a clip from the left panel
- Choose layer type:
  - **Solid Color**: Fill the clip with a solid color
  - **Video File**: Upload a .mp4, .mov, or other video
  - **Image File**: Upload .jpg, .png, or other images
  - **Title Text**: Add text overlay

**Step 3: Set Duration & Transition**
- **Duration**: How long the clip plays (in seconds)
- **Transition Type**: Effect when transitioning to the next clip
  - Cross Fade (smooth blend)
  - Circle Open (circle expands)
  - Slide Right/Left
  - Directional Wipes
  - Water Drop
  - Bounce
- **Transition Duration**: Length of the transition effect

**Step 4: Video Settings**
- Set overall video width/height (1280x720, 1920x1080, etc.)
- Set FPS (30 is standard)
- Give your video a title

**Step 5: Render**
- Click "▶️ Render Video"
- Monitor progress in the "Preview" tab
- Job status appears in the right panel

**Step 6: Download**
- Once complete, click "📥 Download Video"
- Video downloads to your computer

## API Endpoints

The web server exposes these REST API endpoints:

### Upload a File
```bash
POST /api/upload
Content-Type: multipart/form-data

file: <binary file data>

Response:
{
  "filename": "1234567890-video.mp4",
  "originalName": "video.mp4",
  "path": "/uploads/1234567890-video.mp4",
  "size": 1024000
}
```

### Submit a Render Job
```bash
POST /api/render
Content-Type: application/json

{
  "clips": [
    {
      "duration": 4,
      "layers": [
        {
          "type": "fill-color",
          "color": "#667eea"
        }
      ],
      "transition": {
        "name": "crossFade",
        "duration": 0.5
      }
    }
  ],
  "outPath": "./outputs/my-video.mp4",
  "width": 1280,
  "height": 720,
  "fps": 30
}

Response:
{
  "jobId": "uuid-here",
  "status": "submitted",
  "message": "Render job submitted. Polling status endpoint for updates."
}
```

### Get Job Status
```bash
GET /api/render/{jobId}/status

Response:
{
  "id": "uuid-here",
  "status": "processing|completed|error",
  "progress": 0.45,
  "createdAt": "2024-01-01T12:00:00Z",
  "completedAt": "2024-01-01T12:05:00Z",
  "error": null
}
```

### Download Completed Video
```bash
GET /api/render/{jobId}/download

Returns: Video file (binary MP4)
```

### Get All Jobs
```bash
GET /api/jobs

Response:
[
  {
    "id": "uuid-here",
    "status": "completed",
    "progress": 1,
    ...
  },
  ...
]
```

## File Structure

```
json2video/
├── server.js              # Express.js backend
├── public/
│   └── index.html         # React frontend (single page)
├── uploads/               # User-uploaded files (auto-created)
├── outputs/               # Rendered videos (auto-created)
├── src/                   # Editly source code
├── dist/                  # Compiled Editly (after npm run build)
└── package.json           # Dependencies & scripts
```

## Advanced Usage

### Custom JSON Configuration

For advanced users, you can directly craft Editly JSON specifications:

```json
{
  "clips": [
    {
      "duration": 5,
      "layers": [
        {
          "type": "video",
          "path": "/uploads/my-video.mp4"
        },
        {
          "type": "title",
          "text": "My Title",
          "fontSize": 80,
          "color": "white"
        }
      ],
      "transition": {
        "name": "crossFade",
        "duration": 1
      }
    }
  ],
  "outPath": "./outputs/final.mp4",
  "width": 1920,
  "height": 1080,
  "fps": 30,
  "audioFilePath": "/uploads/background-music.mp3"
}
```

Submit via API:
```bash
curl -X POST http://localhost:5000/api/render \
  -H "Content-Type: application/json" \
  -d @spec.json
```

## Performance Tips

### For Faster Rendering
- Use smaller resolutions for previews (640x360)
- Reduce FPS to 15-24 for quick tests
- Use shorter clips for testing
- Keep video files relatively short

### For Production
- Use 1920x1080 or higher resolution
- Use 30 FPS minimum
- Allow sufficient processing time
- Server should have at least 4GB RAM

## Troubleshooting

### "Module not found" error
```bash
npm run build
```

### "FFmpeg not found"
Make sure FFmpeg is installed:
- **Windows**: Install from https://ffmpeg.org/download.html
- **macOS**: `brew install ffmpeg`
- **Linux**: `sudo apt-get install ffmpeg`

### Slow rendering
- Check CPU usage
- Reduce video resolution
- Close other applications
- Use `--fast` mode for previews

### Upload fails
- Check file size (should be < 500MB)
- Ensure file format is supported (mp4, mov, jpg, png)
- Check disk space in uploads folder

### Video has no audio
- Upload audio separately in API or use `audioFilePath` parameter
- Or enable "Keep Source Audio" option

## Server Configuration

### Environment Variables

Create a `.env` file in the project root:

```env
PORT=5000
NODE_ENV=development
MAX_FILE_SIZE=500000000
UPLOADS_DIR=./uploads
OUTPUT_DIR=./outputs
```

### Running Behind a Reverse Proxy

If running behind nginx/apache:

```nginx
server {
    listen 80;
    server_name example.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Docker Support

Build and run with Docker:

```bash
docker build -t editly-web .
docker run -p 5000:5000 -v $(pwd)/uploads:/app/uploads -v $(pwd)/outputs:/app/outputs editly-web
```

See `Dockerfile` and `docker-compose.yml` for more options.

## Limitations

- **Execution Timeout**: Videos should be < 10 minutes
- **File Size**: Upload limit ~500MB per file
- **Memory**: Server needs 2-4GB RAM for HD video
- **Disk Space**: Ensure 10GB+ free space for temp files

## Support

For issues with the web interface, check:
1. Server logs in terminal
2. Browser console (F12 → Console tab)
3. Network tab for API errors

For Editly-specific issues, see: https://github.com/mifi/editly

## License

MIT - Same as Editly
