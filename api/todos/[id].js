import mongoose from 'mongoose';

// MongoDB Connection
const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return;
  }
  
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/todo-app', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
};

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

const Todo = mongoose.models.Todo || mongoose.model('Todo', todoSchema);

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export default async function handler(req, res) {
  // Set CORS headers
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  // Handle OPTIONS request for CORS
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Connect to MongoDB
  await connectDB();

  const { id } = req.query;

  try {
    if (req.method === 'GET') {
      // Get single todo
      const todo = await Todo.findById(id);
      if (!todo) {
        return res.status(404).json({ message: 'Todo not found' });
      }
      res.status(200).json(todo);
    }
    else if (req.method === 'PUT') {
      // Update todo
      const { completed, text } = req.body;
      const updateData = {};
      
      if (completed !== undefined) updateData.completed = completed;
      if (text !== undefined) updateData.text = text.trim();
      
      const todo = await Todo.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
      );
      
      if (!todo) {
        return res.status(404).json({ message: 'Todo not found' });
      }
      
      res.json(todo);
    }
    else if (req.method === 'DELETE') {
      // Delete todo
      const todo = await Todo.findByIdAndDelete(id);
      
      if (!todo) {
        return res.status(404).json({ message: 'Todo not found' });
      }
      
      res.json({ message: 'Todo deleted successfully' });
    }
    else {
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE', 'OPTIONS']);
      res.status(405).json({ message: `Method ${req.method} not allowed` });
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ message: error.message });
  }
}
