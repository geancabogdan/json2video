import editly from './dist/index.js';

// Simple test configuration
const config = {
  outPath: './test-output.mp4',
  width: 1280,
  height: 720,
  fps: 30,
  duration: 3,
  clips: [
    {
      duration: 1.5,
      layers: [
        {
          type: 'fill-color',
          color: '#FF6B6B',
        },
        {
          type: 'title',
          text: 'Editly Test',
          fontSize: 100,
          color: '#ffffff',
        }
      ]
    },
    {
      duration: 1.5,
      layers: [
        {
          type: 'fill-color',
          color: '#4ECDC4',
        },
        {
          type: 'subtitle',
          text: 'Video Generation Success!',
          fontSize: 60,
          color: '#ffffff',
        }
      ]
    }
  ]
};

console.log('Starting video generation...');
console.log('Config:', JSON.stringify(config, null, 2));

editly(config)
  .then(() => {
    console.log('✓ Video generated successfully!');
    console.log('Output file: test-output.mp4');
  })
  .catch(err => {
    console.error('✗ Error generating video:');
    console.error(err.message);
    process.exit(1);
  });
