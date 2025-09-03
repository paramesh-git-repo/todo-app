import React, { useState, useEffect } from 'react';
import './FileUpload.css';

const FileUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState(null);
  const [assets, setAssets] = useState([]);
  const [loadingAssets, setLoadingAssets] = useState(false);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(20);

  const handleFileSelect = (event) => {
    setSelectedFile(event.target.files[0]);
    setError(null);
    setUploadResult(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }

    setUploading(true);
    setError(null);
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

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
      // Refresh file list
      fetchAssets();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const fetchAssets = async () => {
    setLoadingAssets(true);
    try {
      const params = new URLSearchParams();
      if (query) params.append('q', query);
      params.append('page', String(page));
      params.append('limit', String(limit));
      const response = await fetch(`/api/assets?${params.toString()}`);
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch assets');
      }
      
      setAssets(result.items || []);
      setTotal(result.total || 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingAssets(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, [page, limit]);

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
      <h2>Asset Management</h2>
      
      <div className="upload-section">
        <div className="file-input-wrapper">
          <input
            type="file"
            onChange={handleFileSelect}
            disabled={uploading}
            className="file-input"
          />
          <button
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            className="upload-button"
          >
            {uploading ? 'Uploading...' : 'Upload File'}
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}
        
        {uploadResult && uploadResult.asset && (
          <div className="success-message">
            <h3>Upload Successful!</h3>
            <p><strong>Name:</strong> {uploadResult.asset.name}</p>
            <p><strong>Size:</strong> {formatFileSize(uploadResult.asset.size)}</p>
            <p><strong>URL:</strong> <a href={uploadResult.asset.url} target="_blank" rel="noopener noreferrer">{uploadResult.asset.url}</a></p>
          </div>
        )}
      </div>

      <div className="files-section">
        <div className="files-header">
          <h3>Assets</h3>
          <div className="search-controls">
            <input
              type="text"
              placeholder="Search by name, key, or tag"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button
              onClick={() => { setPage(1); fetchAssets(); }}
              disabled={loadingAssets}
              className="refresh-button"
            >
              {loadingAssets ? 'Loading...' : 'Search'}
            </button>
          </div>
          <button onClick={fetchAssets} disabled={loadingAssets} className="refresh-button">
            {loadingAssets ? 'Loading...' : 'Refresh'}
          </button>
        </div>

        {loadingAssets ? (
          <div className="loading">Loading files...</div>
        ) : (
          <div className="files-list">
            {assets.length === 0 ? (
              <p className="no-files">No files found</p>
            ) : (
              assets.map((asset, index) => (
                <div key={asset._id || index} className="file-item">
                  <div className="file-info">
                    <span className="file-name">{asset.name}</span>
                    <span className="file-size">{formatFileSize(asset.size)}</span>
                  </div>
                  <span className="file-date">{formatDate(asset.uploadedAt)}</span>
                  <div className="file-actions">
                    <button
                      className="download-button"
                      onClick={async () => {
                        try {
                          const resp = await fetch(`/api/assets/${asset._id}/download`);
                          const data = await resp.json();
                          if (!resp.ok) throw new Error(data.error || 'Failed to get download URL');
                          window.open(data.url, '_blank');
                        } catch (e) {
                          setError(e.message);
                        }
                      }}
                    >
                      Download
                    </button>
                    <button
                      className="delete-button"
                      onClick={async () => {
                        try {
                          const resp = await fetch(`/api/assets/${asset._id}`, { method: 'DELETE' });
                          const data = await resp.json();
                          if (!resp.ok) throw new Error(data.error || 'Failed to delete asset');
                          fetchAssets();
                        } catch (e) {
                          setError(e.message);
                        }
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <div className="pagination">
        <button
          disabled={page <= 1 || loadingAssets}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
        >
          Prev
        </button>
        <span>
          Page {page} of {Math.max(1, Math.ceil(total / limit))}
        </span>
        <button
          disabled={page >= Math.ceil(total / limit) || loadingAssets}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default FileUpload;
