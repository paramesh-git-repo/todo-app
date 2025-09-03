import React, { useState } from 'react';
import './FileUpload.css';

const FileUpload = ({ onAssetCreated }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState(null);
  const [files, setFiles] = useState([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [assetInfo, setAssetInfo] = useState({
    name: '',
    description: '',
    category: '',
    tags: ''
  });

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
    setError(null);
    setUploadResult(null);
    
    // Auto-fill asset name from filename if not already set
    if (file && !assetInfo.name) {
      const nameWithoutExtension = file.name.replace(/\.[^/.]+$/, "");
      setAssetInfo(prev => ({ ...prev, name: nameWithoutExtension }));
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }

    if (!assetInfo.name.trim() || !assetInfo.category.trim()) {
      setError('Please provide asset name and category');
      return;
    }

    setUploading(true);
    setError(null);
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('name', assetInfo.name.trim());
      formData.append('description', assetInfo.description.trim());
      formData.append('category', assetInfo.category.trim());
      formData.append('tags', assetInfo.tags);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed');
      }

      setUploadResult(result);
      setSelectedFile(null);
      setAssetInfo({ name: '', description: '', category: '', tags: '' });
      
      // Refresh file list and notify parent component
      fetchFiles();
      if (onAssetCreated) {
        onAssetCreated();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const fetchFiles = async () => {
    setLoadingFiles(true);
    try {
      const response = await fetch('/api/files');
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch files');
      }
      
      setFiles(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingFiles(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="file-upload-container">
      <h2>Upload Asset with File</h2>
      
      <div className="upload-section">
        <div className="file-input-wrapper">
          <input
            type="file"
            onChange={handleFileSelect}
            disabled={uploading}
            className="file-input"
          />
        </div>

        {selectedFile && (
          <div className="asset-info-form">
            <h3>Asset Information</h3>
            <div className="form-row">
              <input
                type="text"
                placeholder="Asset name"
                value={assetInfo.name}
                onChange={(e) => setAssetInfo(prev => ({ ...prev, name: e.target.value }))}
                className="asset-input"
                required
              />
              <input
                type="text"
                placeholder="Category"
                value={assetInfo.category}
                onChange={(e) => setAssetInfo(prev => ({ ...prev, category: e.target.value }))}
                className="asset-input"
                required
              />
            </div>
            <div className="form-row">
              <input
                type="text"
                placeholder="Description"
                value={assetInfo.description}
                onChange={(e) => setAssetInfo(prev => ({ ...prev, description: e.target.value }))}
                className="asset-input"
              />
              <input
                type="text"
                placeholder="Tags (comma separated)"
                value={assetInfo.tags}
                onChange={(e) => setAssetInfo(prev => ({ ...prev, tags: e.target.value }))}
                className="asset-input"
              />
            </div>
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={!selectedFile || !assetInfo.name.trim() || !assetInfo.category.trim() || uploading}
          className="upload-button"
        >
          {uploading ? 'Uploading...' : 'Upload Asset'}
        </button>

        {error && <div className="error-message">{error}</div>}
        
        {uploadResult && (
          <div className="success-message">
            <h3>Asset Upload Successful!</h3>
            {uploadResult.asset && (
              <div>
                <p><strong>Asset:</strong> {uploadResult.asset.name}</p>
                <p><strong>Category:</strong> {uploadResult.asset.category}</p>
              </div>
            )}
            <p><strong>File:</strong> {uploadResult.key}</p>
            <p><strong>Size:</strong> {formatFileSize(uploadResult.size)}</p>
            <p><strong>URL:</strong> <a href={uploadResult.url} target="_blank" rel="noopener noreferrer">{uploadResult.url}</a></p>
          </div>
        )}
      </div>

      <div className="files-section">
        <div className="files-header">
          <h3>Files in Bucket</h3>
          <button onClick={fetchFiles} disabled={loadingFiles} className="refresh-button">
            {loadingFiles ? 'Loading...' : 'Refresh'}
          </button>
        </div>

        {loadingFiles ? (
          <div className="loading">Loading files...</div>
        ) : (
          <div className="files-list">
            {files.length === 0 ? (
              <p className="no-files">No files found</p>
            ) : (
              files.map((file, index) => (
                <div key={index} className="file-item">
                  <div className="file-info">
                    <span className="file-name">{file.key}</span>
                    <span className="file-size">{formatFileSize(file.size)}</span>
                  </div>
                  <span className="file-date">{formatDate(file.lastModified)}</span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
