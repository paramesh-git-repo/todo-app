# File Upload API Documentation

This backend now includes a file upload API that allows you to upload files to AWS S3 and list existing files.

## Setup

1. **Environment Variables**: Make sure you have the following in your `.env` file:
   ```
   S3_BUCKET_NAME=your-actual-bucket-name
   ```

2. **AWS Configuration**: The API uses AWS SDK v2 and expects:
   - IAM Role with S3 permissions (if running on EC2)
   - Or AWS credentials configured via environment variables/credentials file

## API Endpoints

### 1. Upload File
- **POST** `/api/upload`
- **Content-Type**: `multipart/form-data`
- **Body**: Form data with a `file` field
- **Response**: 
  ```json
  {
    "message": "File uploaded successfully",
    "url": "https://your-bucket.s3.amazonaws.com/filename.ext",
    "key": "filename.ext",
    "size": 1234
  }
  ```

### 2. List Files
- **GET** `/api/files`
- **Response**: Array of file objects
  ```json
  [
    {
      "key": "filename.ext",
      "lastModified": "2024-01-01T00:00:00.000Z",
      "size": 1234
    }
  ]
  ```

## Usage Examples

### Frontend Upload (JavaScript)
```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);

const response = await fetch('/api/upload', {
  method: 'POST',
  body: formData
});

const result = await response.json();
console.log('Uploaded file URL:', result.url);
```

### cURL Upload
```bash
curl -X POST http://localhost:5001/api/upload \
  -F "file=@/path/to/your/file.txt"
```

### List Files
```bash
curl http://localhost:5001/api/files
```

## Testing

Run the test script to verify the API:
```bash
node test-upload.js
```

## Error Handling

The API includes comprehensive error handling:
- File validation (checks if file exists)
- S3 upload error handling
- Proper HTTP status codes
- Detailed error messages

## Security Notes

- Files are stored in memory temporarily during upload
- No file size limits are currently set (consider adding them for production)
- File types are preserved from the original upload
- Consider implementing file type validation for production use
