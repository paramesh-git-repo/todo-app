const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const AWS = require('aws-sdk');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Multer configuration for file uploads
const upload = multer(); // memory storage

// S3 instance (IAM Role handles auth automatically on EC2)
const s3 = new AWS.S3();
const BUCKET_NAME = process.env.S3_BUCKET_NAME || "todo-app-paramesh"; // your S3 bucket

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/asset-management-app', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Asset Schema
const assetSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  fileInfo: {
    filename: String,
    originalName: String,
    size: Number,
    mimetype: String,
    s3Key: String,
    s3Url: String
  },
  metadata: {
    type: Map,
    of: String,
    default: new Map()
  },
  status: {
    type: String,
    enum: ['active', 'archived', 'deleted'],
    default: 'active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
assetSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Asset = mongoose.model('Asset', assetSchema);

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'Asset Management App Backend API is running!',
    endpoints: {
      'GET /api/assets': 'Get all assets with optional filtering',
      'POST /api/assets': 'Create a new asset',
      'PUT /api/assets/:id': 'Update an asset',
      'DELETE /api/assets/:id': 'Delete an asset',
      'GET /api/assets/categories': 'Get all unique categories',
      'POST /api/upload': 'Upload a file to S3',
      'GET /api/files': 'List all files in S3 bucket'
    },
    status: 'active'
  });
});

// Get all assets with optional filtering
app.get('/api/assets', async (req, res) => {
  try {
    const { category, tags, search, status = 'active' } = req.query;
    let query = { status };

    if (category) {
      query.category = new RegExp(category, 'i');
    }

    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      query.tags = { $in: tagArray };
    }

    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { tags: new RegExp(search, 'i') }
      ];
    }

    const assets = await Asset.find(query).sort({ createdAt: -1 });
    res.json(assets);
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
    
    const asset = new Asset({
      name: name.trim(),
      description: description ? description.trim() : '',
      category: category.trim(),
      tags: tags || [],
      fileInfo: fileInfo || {},
      metadata: metadata || new Map()
    });
    
    const savedAsset = await asset.save();
    res.status(201).json(savedAsset);
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
    
    const asset = await Asset.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true }
    );
    
    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }
    
    res.json(asset);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete asset (soft delete by changing status)
app.delete('/api/assets/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { permanent } = req.query;
    
    if (permanent === 'true') {
      // Permanent delete
      const asset = await Asset.findByIdAndDelete(id);
      if (!asset) {
        return res.status(404).json({ message: 'Asset not found' });
      }
      res.json({ message: 'Asset permanently deleted' });
    } else {
      // Soft delete
      const asset = await Asset.findByIdAndUpdate(
        id,
        { status: 'deleted', updatedAt: new Date() },
        { new: true }
      );
      
      if (!asset) {
        return res.status(404).json({ message: 'Asset not found' });
      }
      
      res.json({ message: 'Asset moved to trash', asset });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all unique categories
app.get('/api/assets/categories', async (req, res) => {
  try {
    const categories = await Asset.distinct('category', { status: 'active' });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// File Upload Routes
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Generate unique filename to avoid conflicts
    const timestamp = Date.now();
    const uniqueFilename = `${timestamp}-${file.originalname}`;

    const params = {
      Bucket: BUCKET_NAME,
      Key: uniqueFilename,
      Body: file.buffer,
      ContentType: file.mimetype
    };

    const result = await s3.upload(params).promise();
    
    // Get additional form data for asset creation
    const { name, description, category, tags } = req.body;
    
    // Create asset record if name and category are provided
    let asset = null;
    if (name && category) {
      const assetData = {
        name: name.trim(),
        description: description ? description.trim() : '',
        category: category.trim(),
        tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
        fileInfo: {
          filename: uniqueFilename,
          originalName: file.originalname,
          size: file.size,
          mimetype: file.mimetype,
          s3Key: result.Key,
          s3Url: result.Location
        }
      };
      
      asset = new Asset(assetData);
      await asset.save();
    }
    
    res.json({ 
      message: "File uploaded successfully", 
      url: result.Location,
      key: result.Key,
      size: file.size,
      asset: asset
    });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "Upload failed", details: err.message });
  }
});

// List files API
app.get('/api/files', async (req, res) => {
  try {
    const params = { Bucket: BUCKET_NAME };
    const result = await s3.listObjectsV2(params).promise();
    const files = result.Contents.map(obj => ({
      key: obj.Key,
      lastModified: obj.LastModified,
      size: obj.Size
    }));
    res.json(files);
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
  console.log(`Server running on port ${PORT}`);
});
