import React, { useState, useEffect } from 'react';
import api from './api.js';
import WebSocketTest from './WebSocketTest.jsx';
import './App.css';

function App() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch todos from API
  const fetchTodos = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/todos');
      setTodos(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load todos. Please try again.');
      console.error('Error fetching todos:', err);
    } finally {
      setLoading(false);
    }
  };

  // Add new todo
  const addTodo = async (e) => {
    e.preventDefault();
    if (!newTodo.trim()) return;

    try {
      const response = await api.post('/api/todos', { text: newTodo });
      setTodos([response.data, ...todos]);
      setNewTodo('');
      setError(null);
    } catch (err) {
      setError('Failed to add todo. Please try again.');
      console.error('Error adding todo:', err);
    }
  };

  // Toggle todo completion
  const toggleTodo = async (id, completed) => {
    try {
      const response = await api.put(`/api/todos/${id}`, { completed: !completed });
      setTodos(todos.map(todo => 
        todo._id === id ? response.data : todo
      ));
      setError(null);
    } catch (err) {
      setError('Failed to update todo. Please try again.');
      console.error('Error updating todo:', err);
    }
  };

  // Delete todo
  const deleteTodo = async (id) => {
    try {
      await api.delete(`/api/todos/${id}`);
      setTodos(todos.filter(todo => todo._id !== id));
      setError(null);
    } catch (err) {
      setError('Failed to delete todo. Please try again.');
      console.error('Error deleting todo:', err);
    }
  };

  // Load todos on component mount
  useEffect(() => {
    fetchTodos();
  }, []);

  return (
    <div className="container">
      <div className="todo-header">
        <h1>Todo App</h1>
        <p>Organize your tasks with ease</p>
      </div>

      <form className="todo-form" onSubmit={addTodo}>
        <div className="form-group">
          <input
            type="text"
            className="todo-input"
            placeholder="Enter a new task..."
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            disabled={loading}
          />
          <button 
            type="submit" 
            className="add-btn"
            disabled={!newTodo.trim() || loading}
          >
            Add Task
          </button>
        </div>
      </form>

      {error && (
        <div className="error">
          {error}
        </div>
      )}

      {loading ? (
        <div className="loading">
          Loading tasks...
        </div>
      ) : todos.length === 0 ? (
        <div className="empty-state">
          <h3>No tasks yet!</h3>
          <p>Add your first task above to get started.</p>
        </div>
      ) : (
        <ul className="todo-list">
          {todos.map((todo) => (
            <li 
              key={todo._id} 
              className={`todo-item ${todo.completed ? 'completed' : ''}`}
            >
              <span className="todo-text">{todo.text}</span>
              <div className="todo-actions">
                <button
                  className={`complete-btn ${todo.completed ? 'completed' : ''}`}
                  onClick={() => toggleTodo(todo._id, todo.completed)}
                >
                  {todo.completed ? 'Undo' : 'Complete'}
                </button>
                <button
                  className="delete-btn"
                  onClick={() => deleteTodo(todo._id)}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      
      <WebSocketTest />
    </div>
  );
}

export default App;
