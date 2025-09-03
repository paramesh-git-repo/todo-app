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
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/todo-app-paramesh', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Todo Schema
const todoSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    trim: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Todo = mongoose.model('Todo', todoSchema);

// Asset Schema
const assetSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  key: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  url: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    default: 0
  },
  contentType: {
    type: String,
    default: ''
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  tags: {
    type: [String],
    default: []
  }
});

const Asset = mongoose.model('Asset', assetSchema);

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'Todo App Backend API is running!',
    endpoints: {
      'GET /api/todos': 'Get all todos',
      'POST /api/todos': 'Create a new todo',
      'PUT /api/todos/:id': 'Update a todo',
      'DELETE /api/todos/:id': 'Delete a todo',
      'POST /api/upload': 'Upload a file to S3 (also creates Asset)',
      'GET /api/files': 'List all files in S3 bucket',
      'GET /api/assets': 'List assets from DB',
      'GET /api/assets/:id': 'Get a specific asset',
      'DELETE /api/assets/:id': 'Delete an asset (and S3 object)'
    },
    status: 'active'
  });
});

app.get('/api/todos', async (req, res) => {
  try {
    const todos = await Todo.find().sort({ createdAt: -1 });
    res.json(todos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/todos', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || text.trim() === '') {
      return res.status(400).json({ message: 'Task text is required' });
    }
    
    const todo = new Todo({ text: text.trim() });
    const savedTodo = await todo.save();
    res.status(201).json(savedTodo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/todos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { completed } = req.body;
    
    const todo = await Todo.findByIdAndUpdate(
      id,
      { completed },
      { new: true }
    );
    
    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }
    
    res.json(todo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete('/api/todos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const todo = await Todo.findByIdAndDelete(id);
    
    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }
    
    res.json({ message: 'Todo deleted successfully' });
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

    const params = {
      Bucket: BUCKET_NAME,
      Key: file.originalname,
      Body: file.buffer,
      ContentType: file.mimetype
    };

    const result = await s3.upload(params).promise();

    // Create or upsert Asset record
    const assetPayload = {
      name: file.originalname,
      key: result.Key,
      url: result.Location,
      size: file.size,
      contentType: file.mimetype,
      uploadedAt: new Date()
    };

    const savedAsset = await Asset.findOneAndUpdate(
      { key: result.Key },
      assetPayload,
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.json({ 
      message: "File uploaded successfully",
      asset: savedAsset
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

// Assets APIs
app.get('/api/assets', async (req, res) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;
    const query = {};
    if (q && String(q).trim() !== '') {
      const like = new RegExp(String(q).trim(), 'i');
      query.$or = [
        { name: like },
        { key: like },
        { tags: like }
      ];
    }

    const numericLimit = Math.max(1, Math.min(100, parseInt(limit)));
    const numericPage = Math.max(1, parseInt(page));
    const skip = (numericPage - 1) * numericLimit;

    const [items, total] = await Promise.all([
      Asset.find(query).sort({ uploadedAt: -1 }).skip(skip).limit(numericLimit),
      Asset.countDocuments(query)
    ]);

    res.json({ items, total, page: numericPage, limit: numericLimit });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch assets', details: error.message });
  }
});

app.get('/api/assets/:id', async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id);
    if (!asset) return res.status(404).json({ error: 'Asset not found' });
    res.json(asset);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch asset', details: error.message });
  }
});

app.delete('/api/assets/:id', async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id);
    if (!asset) return res.status(404).json({ error: 'Asset not found' });

    // Attempt to delete from S3 first
    try {
      await s3.deleteObject({ Bucket: BUCKET_NAME, Key: asset.key }).promise();
    } catch (s3err) {
      // If S3 delete fails, still allow DB delete if requested explicitly
      console.error('S3 delete failed:', s3err.message);
    }

    await Asset.deleteOne({ _id: asset._id });
    res.json({ message: 'Asset deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete asset', details: error.message });
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

// Generate presigned URL for download
app.get('/api/assets/:id/download', async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id);
    if (!asset) return res.status(404).json({ error: 'Asset not found' });

    const params = {
      Bucket: BUCKET_NAME,
      Key: asset.key,
      Expires: 60 // seconds
    };

    const url = s3.getSignedUrl('getObject', params);
    res.json({ url });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create download link', details: error.message });
  }
});
