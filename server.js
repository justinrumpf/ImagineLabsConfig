const express = require('express');
const multer = require('multer');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs').promises;
const simpleGit = require('simple-git');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = 'uploads';
    try {
      await fs.mkdir(uploadDir, { recursive: true });
    } catch (error) {
      console.error('Error creating upload directory:', error);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Initialize git
const git = simpleGit();

// Load initial config
let storyConfig = null;

async function loadConfig() {
  try {
    // First try to load local copy
    const localPath = path.join(__dirname, 'story_remote.json');
    try {
      const data = await fs.readFile(localPath, 'utf8');
      storyConfig = JSON.parse(data);
      console.log('Loaded local story_remote.json');
      return;
    } catch (error) {
      console.log('No local copy found, loading from parent directory');
    }

    // If no local copy, load from parent directory
    const parentPath = path.join(__dirname, '..', 'story_remote.json');
    const data = await fs.readFile(parentPath, 'utf8');
    storyConfig = JSON.parse(data);
    
    // Save a local copy
    await fs.writeFile(localPath, JSON.stringify(storyConfig, null, 2));
    console.log('Loaded story_remote.json from parent directory and created local copy');
  } catch (error) {
    console.error('Error loading config:', error);
    throw error;
  }
}

// Routes
app.get('/api/config', (req, res) => {
  if (!storyConfig) {
    return res.status(500).json({ error: 'Configuration not loaded' });
  }
  res.json(storyConfig);
});

app.post('/api/config', async (req, res) => {
  try {
    storyConfig = req.body;
    const localPath = path.join(__dirname, 'story_remote.json');
    await fs.writeFile(localPath, JSON.stringify(storyConfig, null, 2));
    res.json({ success: true, message: 'Configuration saved locally' });
  } catch (error) {
    console.error('Error saving config:', error);
    res.status(500).json({ error: 'Failed to save configuration' });
  }
});

app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({ 
    success: true, 
    url: fileUrl,
    filename: req.file.filename,
    originalName: req.file.originalname
  });
});

app.post('/api/commit', async (req, res) => {
  try {
    const { message = 'Update story configuration' } = req.body;
    
    if (!process.env.GITHUB_TOKEN) {
      return res.status(400).json({ error: 'GitHub token not configured' });
    }

    // Create a temporary directory for the git operation
    const tempDir = path.join(__dirname, 'temp');
    await fs.mkdir(tempDir, { recursive: true });
    
    // Clone the repository
    const repoUrl = `https://${process.env.GITHUB_TOKEN}@github.com/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}.git`;
    const git = simpleGit(tempDir);
    
    console.log('Cloning repository...');
    await git.clone(repoUrl, '.');
    
    // Copy the updated config
    const configSource = path.join(__dirname, 'story_remote.json');
    const configDest = path.join(tempDir, 'story.json');
    await fs.copyFile(configSource, configDest);
    
    // Copy uploaded images if any
    const uploadsDir = path.join(__dirname, 'uploads');
    try {
      const files = await fs.readdir(uploadsDir);
      for (const file of files) {
        // Determine the appropriate subdirectory based on file type
        let destSubDir = '';
        if (file.includes('avatar')) destSubDir = 'avatars';
        else if (file.includes('place')) destSubDir = 'places';
        else if (file.includes('type')) destSubDir = 'types';
        else destSubDir = 'img';
        
        const destDir = path.join(tempDir, destSubDir);
        await fs.mkdir(destDir, { recursive: true });
        
        const source = path.join(uploadsDir, file);
        const dest = path.join(destDir, file);
        await fs.copyFile(source, dest);
      }
    } catch (error) {
      console.log('No uploads to copy or error:', error);
    }
    
    // Configure git
    await git.addConfig('user.name', 'Config Service');
    await git.addConfig('user.email', 'config@imaginelabs.com');
    
    // Add and commit changes
    await git.add('.');
    await git.commit(message);
    
    // Push to GitHub
    console.log('Pushing to GitHub...');
    await git.push('origin', process.env.GITHUB_BRANCH || 'main');
    
    // Clean up temp directory
    await fs.rm(tempDir, { recursive: true, force: true });
    
    res.json({ success: true, message: 'Changes committed to GitHub successfully' });
  } catch (error) {
    console.error('Error committing to GitHub:', error);
    res.status(500).json({ error: 'Failed to commit changes: ' + error.message });
  }
});

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, async () => {
  try {
    await loadConfig();
    console.log(`Config service running on http://localhost:${PORT}`);
    console.log('Make sure to create a .env file with your GitHub credentials');
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
});