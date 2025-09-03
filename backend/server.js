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
  description: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    default: ''
  },
  location: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'maintenance', 'retired'],
    default: 'active'
  },
  purchaseDate: {
    type: Date
  },
  cost: {
    type: Number
  },
  tags: {
    type: [String],
    default: []
  },
  fileUrl: {
    type: String,
    default: ''
  },
  fileKey: {
    type: String,
    default: ''
  }
}, { timestamps: true });

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
      'GET /api/assets': 'Get all assets',
      'GET /api/assets/:id': 'Get a single asset',
      'POST /api/assets': 'Create a new asset',
      'PUT /api/assets/:id': 'Update an asset',
      'DELETE /api/assets/:id': 'Delete an asset',
      'POST /api/upload': 'Upload a file to S3',
      'GET /api/files': 'List all files in S3 bucket'
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

// Asset CRUD Routes
app.get('/api/assets', async (req, res) => {
  try {
    const assets = await Asset.find().sort({ createdAt: -1 });
    res.json(assets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/assets/:id', async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id);
    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }
    res.json(asset);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/assets', async (req, res) => {
  try {
    const { name, description, category, location, status, purchaseDate, cost, tags } = req.body;
    if (!name || name.trim() === '') {
      return res.status(400).json({ message: 'Asset name is required' });
    }

    const asset = new Asset({
      name: name.trim(),
      description: description || '',
      category: category || '',
      location: location || '',
      status: status || 'active',
      purchaseDate: purchaseDate ? new Date(purchaseDate) : undefined,
      cost,
      tags: Array.isArray(tags) ? tags : []
    });

    const saved = await asset.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/assets/:id', async (req, res) => {
  try {
    const allowedFields = ['name', 'description', 'category', 'location', 'status', 'purchaseDate', 'cost', 'tags', 'fileUrl', 'fileKey'];
    const updates = {};
    for (const key of allowedFields) {
      if (req.body[key] !== undefined) {
        updates[key] = key === 'name' && typeof req.body[key] === 'string' ? req.body[key].trim() : req.body[key];
      }
    }

    if (updates.purchaseDate) {
      updates.purchaseDate = new Date(updates.purchaseDate);
    }

    const updated = await Asset.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Asset not found' });
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete('/api/assets/:id', async (req, res) => {
  try {
    const removed = await Asset.findByIdAndDelete(req.params.id);
    if (!removed) {
      return res.status(404).json({ message: 'Asset not found' });
    }
    res.json({ message: 'Asset deleted successfully' });
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
    res.json({ 
      message: "File uploaded successfully", 
      url: result.Location,
      key: result.Key,
      size: file.size
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
