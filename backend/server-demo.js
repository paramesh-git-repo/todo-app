const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Multer configuration for file uploads
const upload = multer(); // memory storage

// In-memory storage for demo (replace with MongoDB in production)
let assets = [
  {
    _id: '1',
    name: 'Sample Document',
    description: 'A sample document for demonstration',
    category: 'Documents',
    tags: ['sample', 'demo', 'document'],
    fileInfo: {},
    metadata: new Map(),
    status: 'active',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    _id: '2',
    name: 'Project Logo',
    description: 'Company logo for the project',
    category: 'Images',
    tags: ['logo', 'branding', 'design'],
    fileInfo: {},
    metadata: new Map(),
    status: 'active',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10')
  },
  {
    _id: '3',
    name: 'User Manual',
    description: 'Complete user manual for the application',
    category: 'Documentation',
    tags: ['manual', 'guide', 'help'],
    fileInfo: {},
    metadata: new Map(),
    status: 'active',
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-05')
  }
];

let nextId = 4;

// Utility function to generate unique IDs
function generateId() {
  return (nextId++).toString();
}

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'Asset Management App Backend API is running! (Demo Mode)',
    endpoints: {
      'GET /api/assets': 'Get all assets with optional filtering',
      'POST /api/assets': 'Create a new asset',
      'PUT /api/assets/:id': 'Update an asset',
      'DELETE /api/assets/:id': 'Delete an asset',
      'GET /api/assets/categories': 'Get all unique categories',
      'POST /api/upload': 'Upload a file (demo mode - no S3)',
      'GET /api/files': 'List all files (demo mode - empty)'
    },
    status: 'active',
    mode: 'demo'
  });
});

// Get all assets with optional filtering
app.get('/api/assets', async (req, res) => {
  try {
    const { category, tags, search, status = 'active' } = req.query;
    let filteredAssets = assets.filter(asset => asset.status === status);

    if (category) {
      const categoryRegex = new RegExp(category, 'i');
      filteredAssets = filteredAssets.filter(asset => 
        categoryRegex.test(asset.category)
      );
    }

    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      filteredAssets = filteredAssets.filter(asset =>
        tagArray.some(tag => 
          asset.tags.some(assetTag => 
            new RegExp(tag, 'i').test(assetTag)
          )
        )
      );
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      filteredAssets = filteredAssets.filter(asset =>
        searchRegex.test(asset.name) ||
        searchRegex.test(asset.description) ||
        asset.tags.some(tag => searchRegex.test(tag))
      );
    }

    // Sort by creation date (newest first)
    filteredAssets.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json(filteredAssets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new asset
app.post('/api/assets', async (req, res) => {
  try {
    const { name, description, category, tags, fileInfo, metadata } = req.body;
    
    if (!name || name.trim() === '') {
      return res.status(400).json({ message: 'Asset name is required' });
    }
    
    if (!category || category.trim() === '') {
      return res.status(400).json({ message: 'Category is required' });
    }
    
    const asset = {
      _id: generateId(),
      name: name.trim(),
      description: description ? description.trim() : '',
      category: category.trim(),
      tags: tags || [],
      fileInfo: fileInfo || {},
      metadata: metadata || new Map(),
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    assets.push(asset);
    res.status(201).json(asset);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update asset
app.put('/api/assets/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Remove fields that shouldn't be updated directly
    delete updateData._id;
    delete updateData.createdAt;
    
    const assetIndex = assets.findIndex(asset => asset._id === id);
    
    if (assetIndex === -1) {
      return res.status(404).json({ message: 'Asset not found' });
    }
    
    // Update the asset
    assets[assetIndex] = {
      ...assets[assetIndex],
      ...updateData,
      updatedAt: new Date()
    };
    
    res.json(assets[assetIndex]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete asset (soft delete by changing status)
app.delete('/api/assets/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { permanent } = req.query;
    
    const assetIndex = assets.findIndex(asset => asset._id === id);
    
    if (assetIndex === -1) {
      return res.status(404).json({ message: 'Asset not found' });
    }
    
    if (permanent === 'true') {
      // Permanent delete
      const deletedAsset = assets.splice(assetIndex, 1)[0];
      res.json({ message: 'Asset permanently deleted', asset: deletedAsset });
    } else {
      // Soft delete
      assets[assetIndex].status = 'deleted';
      assets[assetIndex].updatedAt = new Date();
      res.json({ message: 'Asset moved to trash', asset: assets[assetIndex] });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all unique categories
app.get('/api/assets/categories', async (req, res) => {
  try {
    const categories = [...new Set(
      assets
        .filter(asset => asset.status === 'active')
        .map(asset => asset.category)
    )];
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// File Upload Routes (Demo mode - no actual S3 upload)
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Get additional form data for asset creation
    const { name, description, category, tags } = req.body;
    
    // Create mock file info
    const mockFileInfo = {
      filename: `demo-${Date.now()}-${file.originalname}`,
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      s3Key: `demo/${file.originalname}`,
      s3Url: `https://demo-bucket.s3.amazonaws.com/demo/${file.originalname}`
    };
    
    // Create asset record if name and category are provided
    let asset = null;
    if (name && category) {
      const assetData = {
        _id: generateId(),
        name: name.trim(),
        description: description ? description.trim() : '',
        category: category.trim(),
        tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
        fileInfo: mockFileInfo,
        metadata: new Map(),
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      assets.push(assetData);
      asset = assetData;
    }
    
    res.json({ 
      message: "File uploaded successfully (demo mode)", 
      url: mockFileInfo.s3Url,
      key: mockFileInfo.s3Key,
      size: file.size,
      asset: asset
    });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "Upload failed", details: err.message });
  }
});

// List files API (Demo mode - return mock data)
app.get('/api/files', async (req, res) => {
  try {
    const mockFiles = [
      {
        key: 'demo/sample-document.pdf',
        lastModified: new Date('2024-01-15'),
        size: 1024000
      },
      {
        key: 'demo/project-logo.png',
        lastModified: new Date('2024-01-10'),
        size: 256000
      },
      {
        key: 'demo/user-manual.docx',
        lastModified: new Date('2024-01-05'),
        size: 512000
      }
    ];
    res.json(mockFiles);
  } catch (err) {
    console.error("List error:", err);
    res.status(500).json({ error: "Cannot list files", details: err.message });
  }
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('../dist'));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../dist', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Asset Management Server running on port ${PORT} (Demo Mode)`);
  console.log('Demo mode: Using in-memory storage instead of MongoDB');
  console.log('File uploads: Mock S3 integration (no actual file storage)');
});