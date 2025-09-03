import React, { useState, useEffect } from 'react';
import api from './api.js';
import WebSocketTest from './WebSocketTest.jsx';
import FileUpload from './FileUpload.jsx';
import './App.css';

function App() {
  const [assets, setAssets] = useState([]);
  const [newAsset, setNewAsset] = useState({
    name: '',
    description: '',
    category: '',
    tags: ''
  });
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch assets from API
  const fetchAssets = async () => {
    try {
      setLoading(true);
      let url = '/api/assets';
      const params = new URLSearchParams();
      
      if (selectedCategory) params.append('category', selectedCategory);
      if (searchTerm) params.append('search', searchTerm);
      
      if (params.toString()) {
        url += '?' + params.toString();
      }
      
      const response = await api.get(url);
      setAssets(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load assets. Please try again.');
      console.error('Error fetching assets:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await api.get('/api/assets/categories');
      setCategories(response.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  // Add new asset
  const addAsset = async (e) => {
    e.preventDefault();
    if (!newAsset.name.trim() || !newAsset.category.trim()) return;

    try {
      const assetData = {
        name: newAsset.name.trim(),
        description: newAsset.description.trim(),
        category: newAsset.category.trim(),
        tags: newAsset.tags ? newAsset.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : []
      };
      
      const response = await api.post('/api/assets', assetData);
      setAssets([response.data, ...assets]);
      setNewAsset({ name: '', description: '', category: '', tags: '' });
      setError(null);
      fetchCategories(); // Refresh categories in case a new one was added
    } catch (err) {
      setError('Failed to add asset. Please try again.');
      console.error('Error adding asset:', err);
    }
  };

  // Update asset
  const updateAsset = async (id, updateData) => {
    try {
      const response = await api.put(`/api/assets/${id}`, updateData);
      setAssets(assets.map(asset => 
        asset._id === id ? response.data : asset
      ));
      setError(null);
    } catch (err) {
      setError('Failed to update asset. Please try again.');
      console.error('Error updating asset:', err);
    }
  };

  // Delete asset
  const deleteAsset = async (id) => {
    try {
      await api.delete(`/api/assets/${id}`);
      setAssets(assets.filter(asset => asset._id !== id));
      setError(null);
    } catch (err) {
      setError('Failed to delete asset. Please try again.');
      console.error('Error deleting asset:', err);
    }
  };

  // Load assets and categories on component mount
  useEffect(() => {
    fetchAssets();
    fetchCategories();
  }, []);

  // Refetch assets when filters change
  useEffect(() => {
    fetchAssets();
  }, [selectedCategory, searchTerm]);

  // Utility function to format file sizes
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="container">
      <div className="asset-header">
        <h1>Asset Management System</h1>
        <p>Organize and manage your digital assets</p>
      </div>

      {/* Search and Filter Section */}
      <div className="filters-section">
        <div className="search-box">
          <input
            type="text"
            className="search-input"
            placeholder="Search assets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="category-filter">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="category-select"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Add New Asset Form */}
      <form className="asset-form" onSubmit={addAsset}>
        <div className="form-row">
          <input
            type="text"
            className="asset-input"
            placeholder="Asset name..."
            value={newAsset.name}
            onChange={(e) => setNewAsset({...newAsset, name: e.target.value})}
            disabled={loading}
            required
          />
          <input
            type="text"
            className="asset-input"
            placeholder="Category..."
            value={newAsset.category}
            onChange={(e) => setNewAsset({...newAsset, category: e.target.value})}
            disabled={loading}
            required
          />
        </div>
        <div className="form-row">
          <input
            type="text"
            className="asset-input"
            placeholder="Description..."
            value={newAsset.description}
            onChange={(e) => setNewAsset({...newAsset, description: e.target.value})}
            disabled={loading}
          />
          <input
            type="text"
            className="asset-input"
            placeholder="Tags (comma separated)..."
            value={newAsset.tags}
            onChange={(e) => setNewAsset({...newAsset, tags: e.target.value})}
            disabled={loading}
          />
        </div>
        <button 
          type="submit" 
          className="add-btn"
          disabled={!newAsset.name.trim() || !newAsset.category.trim() || loading}
        >
          Add Asset
        </button>
      </form>

      {error && (
        <div className="error">
          {error}
        </div>
      )}

      {loading ? (
        <div className="loading">
          Loading assets...
        </div>
      ) : assets.length === 0 ? (
        <div className="empty-state">
          <h3>No assets found!</h3>
          <p>Add your first asset above or upload files to get started.</p>
        </div>
      ) : (
        <div className="assets-grid">
          {assets.map((asset) => (
            <div key={asset._id} className="asset-card">
              <div className="asset-header">
                <h3 className="asset-name">{asset.name}</h3>
                <span className="asset-category">{asset.category}</span>
              </div>
              
              {asset.description && (
                <p className="asset-description">{asset.description}</p>
              )}
              
              {asset.tags && asset.tags.length > 0 && (
                <div className="asset-tags">
                  {asset.tags.map((tag, index) => (
                    <span key={index} className="tag">{tag}</span>
                  ))}
                </div>
              )}
              
              {asset.fileInfo && asset.fileInfo.s3Url && (
                <div className="asset-file-info">
                  <p><strong>File:</strong> {asset.fileInfo.originalName}</p>
                  <p><strong>Size:</strong> {formatFileSize(asset.fileInfo.size)}</p>
                  <a 
                    href={asset.fileInfo.s3Url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="file-link"
                  >
                    View File
                  </a>
                </div>
              )}
              
              <div className="asset-meta">
                <small>Created: {new Date(asset.createdAt).toLocaleDateString()}</small>
                {asset.updatedAt !== asset.createdAt && (
                  <small>Updated: {new Date(asset.updatedAt).toLocaleDateString()}</small>
                )}
              </div>
              
              <div className="asset-actions">
                <button
                  className="edit-btn"
                  onClick={() => {/* TODO: Add edit functionality */}}
                >
                  Edit
                </button>
                <button
                  className="delete-btn"
                  onClick={() => deleteAsset(asset._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <FileUpload onAssetCreated={fetchAssets} />
      
      <WebSocketTest />
    </div>
  );
}

export default App;
