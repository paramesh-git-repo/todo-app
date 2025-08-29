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
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
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

  const { method, path } = req;

  try {
    // Route handling
    if (method === 'GET' && path === '/api/todos') {
      const todos = await Todo.find().sort({ createdAt: -1 });
      res.status(200).json(todos);
    }
    else if (method === 'POST' && path === '/api/todos') {
      const { text } = req.body;
      if (!text || text.trim() === '') {
        return res.status(400).json({ message: 'Task text is required' });
      }
      
      const todo = new Todo({ text: text.trim() });
      const savedTodo = await todo.save();
      res.status(201).json(savedTodo);
    }
    else if (method === 'PUT' && path.startsWith('/api/todos/')) {
      const id = path.split('/')[3];
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
    }
    else if (method === 'DELETE' && path.startsWith('/api/todos/')) {
      const id = path.split('/')[3];
      const todo = await Todo.findByIdAndDelete(id);
      
      if (!todo) {
        return res.status(404).json({ message: 'Todo not found' });
      }
      
      res.json({ message: 'Todo deleted successfully' });
    }
    else {
      res.status(404).json({ message: 'Route not found' });
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ message: error.message });
  }
}
