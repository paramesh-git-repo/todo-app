# Asset Management App

A full-stack Asset Management application with React frontend, Express backend, MongoDB database, and AWS S3 file storage integration.

## Project Structure

```
asset-management-app/
├── frontend/          # React application
│   ├── src/
│   ├── public/
│   └── package.json
├── backend/           # Express server + WebSocket
│   ├── server.js
│   ├── websocket-server.js
│   ├── testclient.js
│   ├── websocket-test-client.js
│   ├── websocket-test-client-advanced.js
│   ├── .env
│   └── package.json
├── package.json       # Root package.json for managing both
└── README.md
```

## Quick Start

### 1. Install Dependencies
```bash
npm run install-all
```

### 2. Environment Setup
Copy the example environment file and configure your settings:
```bash
cd backend
cp env.example .env
```

Edit `.env` with your configuration:
```
MONGODB_URI=mongodb://localhost:27017/asset-management-app
S3_BUCKET_NAME=your-s3-bucket-name
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=your-region
```

### 3. Start All Services
```bash
npm run dev
```

This will start:
- **Backend**: Express server on port 5001
- **WebSocket**: WebSocket server on port 5002
- **Frontend**: React app on port 3000

## Individual Commands

### Backend
```bash
npm run backend          # Start Express server only
npm run websocket        # Start WebSocket server only
```

### Frontend
```bash
npm run frontend         # Start React app only
```

### Testing
```bash
npm run test-ws          # Run basic WebSocket test
npm run test-ws-advanced # Run advanced WebSocket test
npm run testclient       # Run simple test client
```

## Services

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5001
- **WebSocket**: ws://localhost:5002

## Features

### Core Asset Management
- ✅ Create, read, update, and delete assets
- ✅ Categorize assets with custom categories
- ✅ Tag assets for better organization
- ✅ Add descriptions and metadata to assets
- ✅ Search assets by name, description, or tags
- ✅ Filter assets by category
- ✅ File upload integration with S3
- ✅ Automatic asset creation from file uploads

### File Management
- ✅ Upload files to AWS S3
- ✅ Automatic file metadata extraction
- ✅ File size formatting and display
- ✅ Direct links to uploaded files
- ✅ List all files in S3 bucket

### User Interface
- ✅ Modern, responsive design
- ✅ Grid-based asset display
- ✅ Real-time search and filtering
- ✅ Drag-and-drop file upload interface
- ✅ Category management
- ✅ Tag visualization

### Technical Features
- ✅ MongoDB database integration
- ✅ Express REST API
- ✅ React frontend with hooks
- ✅ AWS S3 integration
- ✅ WebSocket real-time communication
- ✅ Soft delete functionality
- ✅ Responsive design

## API Endpoints

### Assets
- `GET /api/assets` - Get all assets with optional filtering
  - Query parameters: `category`, `tags`, `search`, `status`
- `POST /api/assets` - Create a new asset
- `PUT /api/assets/:id` - Update an asset
- `DELETE /api/assets/:id` - Delete an asset (soft delete)
  - Query parameter: `permanent=true` for permanent deletion
- `GET /api/assets/categories` - Get all unique categories

### File Management
- `POST /api/upload` - Upload file to S3 and optionally create asset
- `GET /api/files` - List all files in S3 bucket

## Asset Data Structure

```javascript
{
  name: String,           // Asset name (required)
  description: String,    // Asset description
  category: String,       // Asset category (required)
  tags: [String],        // Array of tags
  fileInfo: {            // File information (if asset has a file)
    filename: String,
    originalName: String,
    size: Number,
    mimetype: String,
    s3Key: String,
    s3Url: String
  },
  metadata: Map,         // Additional metadata
  status: String,        // 'active', 'archived', or 'deleted'
  createdAt: Date,
  updatedAt: Date
}
```

## WebSocket Actions

The app includes WebSocket functionality for real-time features:

- `{ action: "add", asset: {...} }` - Add asset
- `{ action: "list" }` - Get all assets
- `{ action: "update", id: "id", data: {...} }` - Update asset
- `{ action: "delete", id: "id" }` - Delete asset
- `{ action: "count" }` - Get asset count

## Deployment

The app includes deployment configurations for various platforms:

- **Render**: See `render.yaml` and `RENDER_DEPLOYMENT.md`
- **AWS EC2**: See `AWS_DEPLOYMENT_GUIDE.md` and `ec2-deploy.sh`
- **Docker**: See `Dockerfile` and `docker-compose.yml`

## Development

### Adding New Features

1. **Backend**: Add new routes in `backend/server.js`
2. **Frontend**: Create components in `frontend/src/`
3. **Database**: Modify the Asset schema as needed
4. **Styling**: Update CSS files for new components

### File Upload Configuration

The app uses AWS S3 for file storage. Make sure to:

1. Create an S3 bucket
2. Configure IAM permissions
3. Set environment variables
4. Test upload functionality

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
1. Check the deployment guides in the repository
2. Review the API documentation above
3. Check console logs for error details
4. Ensure all environment variables are set correctly