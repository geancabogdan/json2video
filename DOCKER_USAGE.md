# Editly Docker Usage Guide

## What is Editly?

Editly is a declarative, programmatic video editing framework. You describe your video as JSON/JSON5 configuration, and Editly generates MP4/MKV/GIF files.

## Quick Start with Docker

### Build the Docker Image
```bash
docker-compose build
```

### Generate a Video
```bash
docker-compose run editly test-docker.json5 --out test-video.mp4
```

The output will be saved to `./outputs/test-video.mp4`

## Configuration Format

Editly uses JSON5 format with these main concepts:

### Basic Structure
```json5
{
  outPath: "./outputs/my-video.mp4",  // Output file path
  width: 1280,
  height: 720,
  fps: 30,

  clips: [
    // Array of video clips
  ]
}
```

### Clip Structure
```json5
{
  duration: 5,  // Duration in seconds
  layers: [
    // Array of visual layers (stacked)
  ]
}
```

### Available Layer Types

#### 1. **fill-color** - Solid color background
```json5
{
  type: 'fill-color',
  color: '#FF6B6B'  // Hex color
}
```

#### 2. **title** - Large text
```json5
{
  type: 'title',
  text: 'Hello World',
  fontSize: 100,
  color: '#ffffff',
  fontFamily: 'Arial'
}
```

#### 3. **subtitle** - Smaller text
```json5
{
  type: 'subtitle',
  text: 'Subtitle text',
  fontSize: 60,
  color: '#ffffff',
  fontFamily: 'Arial'
}
```

#### 4. **linear-gradient** - Gradient background
```json5
{
  type: 'linear-gradient',
  color0: '#FF6B6B',
  color1: '#4ECDC4'
}
```

#### 5. **radial-gradient** - Circular gradient
```json5
{
  type: 'radial-gradient',
  color0: '#FF6B6B',
  color1: '#4ECDC4'
}
```

#### 6. **image** - Static image
```json5
{
  type: 'image',
  path: './assets/my-image.png'
}
```

#### 7. **video** - Video clip
```json5
{
  type: 'video',
  path: './assets/my-video.mp4',
  cutFrom: 0,  // Start time (seconds)
  cutTo: 5     // End time (seconds)
}
```

## Example: Multi-Slide Video

Create `my-video.json5`:

```json5
{
  outPath: "./outputs/presentation.mp4",
  width: 1280,
  height: 720,
  fps: 30,

  clips: [
    // Slide 1
    {
      duration: 3,
      layers: [
        { type: 'fill-color', color: '#1e88e5' },
        { type: 'title', text: 'Slide 1', fontSize: 100, color: '#ffffff' }
      ]
    },

    // Slide 2
    {
      duration: 3,
      layers: [
        { type: 'fill-color', color: '#43a047' },
        { type: 'title', text: 'Slide 2', fontSize: 100, color: '#ffffff' }
      ]
    },

    // Slide 3
    {
      duration: 3,
      layers: [
        { type: 'fill-color', color: '#e53935' },
        { type: 'title', text: 'Slide 3', fontSize: 100, color: '#ffffff' }
      ]
    }
  ]
}
```

Run:
```bash
docker-compose run editly my-video.json5 --out presentation.mp4
```

## Docker Commands

### Build image (first time only)
```bash
docker-compose build
```

### Run video generation
```bash
docker-compose run editly config.json5 --out output.mp4
```

### Run with asset directory
Assets must be in `./examples/assets/`:
```bash
docker-compose run editly my-config.json5 --out my-video.mp4
```

### View available examples
```bash
ls examples/
```

## Output Location

Generated videos are saved to `./outputs/` which is a Docker volume. They'll appear in:
- `C:\Users\sorin\Desktop\json2video\outputs\` on your Windows system

## Troubleshooting

### "outputs" directory not found
Docker creates it automatically on first run.

### Permission denied
Run with `sudo` (Linux/Mac) or as Administrator (Windows).

### Video generation is slow
This is normal - encoding takes time depending on video length and resolution.

## Tips

- Increase `fontSize` for better visibility at higher resolutions
- Use `duration: 0` on a clip to auto-calculate based on content
- Colors must be hex format: `#RRGGBB`
- Font families: Arial, Helvetica, Georgia, Courier New, etc.
- Transitions can be added between clips for smooth effects

## More Examples

Check the `examples/` directory for:
- `commonFeatures.json5` - Showcase of all features
- `audio1.json5`, `audio2.json5` - Audio mixing
- `gradients.json5` - Gradient examples
- `transitions.json5` - Transition effects
