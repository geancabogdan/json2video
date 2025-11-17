import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs-extra';
import { v4 as uuidv4 } from 'uuid';

let Editly;
try {
  Editly = (await import('./dist/index.js')).default;
} catch (err) {
  console.error('⚠️  Warning: Could not load Editly. Canvas module may not be compiled.');
  console.error('Please run: npm install -g windows-build-tools && npm rebuild canvas');
  Editly = null;
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 5000;

// Create uploads and output directories
const uploadsDir = path.join(__dirname, 'uploads');
const outputDir = path.join(__dirname, 'outputs');
const templatesDir = path.join(__dirname, 'templates');
await fs.ensureDir(uploadsDir);
await fs.ensureDir(outputDir);
await fs.ensureDir(templatesDir);

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// File upload setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// Store render jobs status
const jobs = new Map();

/**
 * POST /api/upload
 * Upload video/image files
 */
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  res.json({
    filename: req.file.filename,
    originalName: req.file.originalname,
    path: `/uploads/${req.file.filename}`,
    size: req.file.size,
  });
});

/**
 * POST /api/render
 * Submit a rendering job with Editly configuration
 */
app.post('/api/render', async (req, res) => {
  try {
    if (!Editly) {
      return res.status(503).json({
        error: 'Editly engine not loaded. Canvas module needs compilation.',
        solution: 'Run: npm install -g windows-build-tools && npm rebuild canvas'
      });
    }

    const spec = req.body;

    // Validate spec
    if (!spec.clips || !Array.isArray(spec.clips)) {
      return res.status(400).json({ error: 'Invalid spec: missing clips array' });
    }

    // Convert relative paths to absolute
    spec.clips = spec.clips.map((clip) => ({
      ...clip,
      layers: clip.layers.map((layer) => {
        if (layer.path && !layer.path.startsWith('/uploads')) {
          return layer;
        }
        if (layer.path && layer.path.startsWith('/uploads')) {
          return { ...layer, path: path.join(__dirname, layer.path) };
        }
        return layer;
      }),
    }));

    const jobId = uuidv4();
    const outputFilename = `${jobId}.mp4`;
    const outputPath = path.join(outputDir, outputFilename);

    spec.outPath = outputPath;

    // Store job info
    jobs.set(jobId, {
      id: jobId,
      status: 'processing',
      spec,
      outputPath,
      outputFilename,
      createdAt: new Date(),
      progress: 0,
      error: null,
    });

    // Render asynchronously
    (async () => {
      try {
        console.log(`[${jobId}] Starting render...`);
        await Editly(spec);
        console.log(`[${jobId}] Render completed`);

        jobs.set(jobId, {
          ...jobs.get(jobId),
          status: 'completed',
          progress: 100,
          completedAt: new Date(),
        });
      } catch (error) {
        console.error(`[${jobId}] Render error:`, error);
        jobs.set(jobId, {
          ...jobs.get(jobId),
          status: 'error',
          error: error.message,
        });
      }
    })();

    res.json({
      jobId,
      status: 'submitted',
      message: 'Render job submitted. Polling status endpoint for updates.',
    });
  } catch (error) {
    console.error('Render error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/render-template
 * Submit a template-based rendering job with variable substitution
 *
 * Request body:
 * {
 *   "templateName": "promotional-video",
 *   "variables": {
 *     "BACKGROUND_COLOR": "#FF0000",
 *     "HEADLINE": "My Product",
 *     "BACKGROUND_IMAGE": "/uploads/image.jpg",
 *     "PRODUCT_VIDEO": "/uploads/video.mp4",
 *     "MUSIC_PATH": "/uploads/music.mp3"
 *   }
 * }
 */
app.post('/api/render-template', async (req, res) => {
  try {
    if (!Editly) {
      return res.status(503).json({
        error: 'Editly engine not loaded. Canvas module needs compilation.',
        solution: 'Run: npm install -g windows-build-tools && npm rebuild canvas'
      });
    }

    const { templateName, variables } = req.body;

    // Validate input
    if (!templateName || typeof templateName !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid templateName' });
    }

    if (!variables || typeof variables !== 'object') {
      return res.status(400).json({ error: 'Missing or invalid variables object' });
    }

    // Load template
    const templatePath = path.join(templatesDir, `${templateName}.json`);

    if (!fs.existsSync(templatePath)) {
      return res.status(404).json({
        error: `Template not found: ${templateName}`,
        availableTemplates: fs.readdirSync(templatesDir).filter(f => f.endsWith('.json'))
      });
    }

    let templateContent = fs.readFileSync(templatePath, 'utf-8');

    // Perform variable substitution
    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      // Use global replace for all occurrences
      templateContent = templateContent.split(placeholder).join(value);
    });

    // Parse the substituted template
    let spec;
    try {
      spec = JSON.parse(templateContent);
    } catch (parseError) {
      return res.status(400).json({
        error: 'Failed to parse template after variable substitution',
        details: parseError.message
      });
    }

    // Validate spec has required fields
    if (!spec.clips || !Array.isArray(spec.clips)) {
      return res.status(400).json({ error: 'Template missing required clips array' });
    }

    // Convert relative paths to absolute
    spec.clips = spec.clips.map((clip) => ({
      ...clip,
      layers: clip.layers.map((layer) => {
        if (layer.path) {
          // If path doesn't start with /, prepend it
          if (!layer.path.startsWith('/')) {
            layer.path = '/' + layer.path;
          }
          // If path starts with /uploads, convert to absolute
          if (layer.path.startsWith('/uploads')) {
            return { ...layer, path: path.join(__dirname, layer.path) };
          }
        }
        return layer;
      }),
    }));

    // Handle audioFilePath
    if (spec.audioFilePath) {
      if (!spec.audioFilePath.startsWith('/')) {
        spec.audioFilePath = '/' + spec.audioFilePath;
      }
      if (spec.audioFilePath.startsWith('/uploads')) {
        spec.audioFilePath = path.join(__dirname, spec.audioFilePath);
      }
    }

    const jobId = uuidv4();
    const outputFilename = `${jobId}.mp4`;
    const outputPath = path.join(outputDir, outputFilename);

    spec.outPath = outputPath;

    // Store job info
    jobs.set(jobId, {
      id: jobId,
      status: 'processing',
      spec,
      outputPath,
      outputFilename,
      templateName,
      variables,
      createdAt: new Date(),
      progress: 0,
      error: null,
    });

    // Render asynchronously
    (async () => {
      try {
        console.log(`[${jobId}] Starting template render (${templateName})...`);
        await Editly(spec);
        console.log(`[${jobId}] Template render completed`);

        jobs.set(jobId, {
          ...jobs.get(jobId),
          status: 'completed',
          progress: 100,
          completedAt: new Date(),
        });
      } catch (error) {
        console.error(`[${jobId}] Template render error:`, error);
        jobs.set(jobId, {
          ...jobs.get(jobId),
          status: 'error',
          error: error.message,
        });
      }
    })();

    res.json({
      jobId,
      status: 'submitted',
      templateName,
      message: 'Template render job submitted. Polling status endpoint for updates.',
      statusUrl: `/api/render/${jobId}/status`,
      downloadUrl: `/api/render/${jobId}/download`
    });
  } catch (error) {
    console.error('Template render error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/templates
 * List all available templates
 */
app.get('/api/templates', (req, res) => {
  try {
    const templates = fs.readdirSync(templatesDir)
      .filter(f => f.endsWith('.json'))
      .map(f => ({
        name: f.replace('.json', ''),
        path: f
      }));

    res.json({
      count: templates.length,
      templates
    });
  } catch (error) {
    console.error('Error listing templates:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/render/:jobId/status
 * Get status of a rendering job
 */
app.get('/api/render/:jobId/status', (req, res) => {
  const job = jobs.get(req.params.jobId);

  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }

  res.json(job);
});

/**
 * GET /api/render/:jobId/download
 * Download completed video
 */
app.get('/api/render/:jobId/download', (req, res) => {
  const job = jobs.get(req.params.jobId);

  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }

  if (job.status !== 'completed') {
    return res.status(400).json({ error: 'Job not completed yet' });
  }

  res.download(job.outputPath, `editly-${Date.now()}.mp4`);
});

/**
 * GET /api/render/:jobId/preview
 * Get preview of the rendered video (first frame)
 */
app.get('/api/render/:jobId/preview', async (req, res) => {
  const job = jobs.get(req.params.jobId);

  if (!job || !fs.existsSync(job.outputPath)) {
    return res.status(404).json({ error: 'Video not found' });
  }

  // For now, just return a placeholder
  res.json({
    jobId: req.params.jobId,
    videoPath: `/downloads/${job.outputFilename}`,
  });
});

/**
 * GET /api/jobs
 * Get all jobs
 */
app.get('/api/jobs', (req, res) => {
  const allJobs = Array.from(jobs.values());
  res.json(allJobs);
});

/**
 * Serve uploaded files
 */
app.use('/uploads', express.static(uploadsDir));

/**
 * Serve output files for download
 */
app.use('/downloads', express.static(outputDir));

/**
 * Serve frontend
 */
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`✨ Editly Web Server running at http://localhost:${PORT}`);
  console.log(`📂 Uploads: ${uploadsDir}`);
  console.log(`📤 Outputs: ${outputDir}`);
  console.log(`📋 Templates: ${templatesDir}`);
  console.log(`
🎬 API Endpoints:
  POST   /api/render              - Direct render with spec
  POST   /api/render-template     - Template-based render with variables
  GET    /api/templates           - List available templates
  GET    /api/render/:jobId/status - Poll job status
  GET    /api/render/:jobId/download - Download completed video
  POST   /api/upload              - Upload files
`)
});
