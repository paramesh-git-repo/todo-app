# Render Deployment Guide

## Overview
This guide will help you deploy your Todo app to Render with separate services for frontend and backend.

## Prerequisites
- MongoDB Atlas account (for database)
- Render account
- GitHub repository with your code

## Step 1: Set up MongoDB Atlas

1. **Create MongoDB Atlas Cluster:**
   - Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Create a free cluster
   - Get your connection string

2. **Connection String Format:**
   ```
   mongodb+srv://username:password@cluster.mongodb.net/todo-app
   ```

## Step 2: Deploy Backend to Render

1. **Go to Render Dashboard:**
   - Visit [render.com](https://render.com)
   - Sign in to your account

2. **Create New Web Service:**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

3. **Configure Backend Service:**
   - **Name:** `todo-app-backend`
   - **Environment:** `Node`
   - **Build Command:** `cd backend && npm install`
   - **Start Command:** `cd backend && npm start`
   - **Plan:** Free

4. **Environment Variables:**
   - `NODE_ENV` = `production`
   - `MONGODB_URI` = `your-mongodb-atlas-connection-string`
   - `PORT` = `10000`

5. **Deploy:**
   - Click "Create Web Service"
   - Wait for deployment to complete
   - Note the URL: `https://todo-app-backend.onrender.com`

## Step 3: Deploy Frontend to Render

1. **Create New Static Site:**
   - Click "New +" → "Static Site"
   - Connect your GitHub repository

2. **Configure Frontend Service:**
   - **Name:** `todo-app-frontend`
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`
   - **Plan:** Free

3. **Environment Variables:**
   - `REACT_APP_API_URL` = `https://todo-app-backend.onrender.com`

4. **Deploy:**
   - Click "Create Static Site"
   - Wait for deployment to complete
   - Note the URL: `https://todo-app-frontend.onrender.com`

## Step 4: Update Configuration Files

### Update render.yaml (if using Blueprint)
The `render.yaml` file is already configured for both services.

### Manual Configuration
If not using Blueprint, follow the manual steps above.

## Step 5: Test Your Deployment

1. **Test Backend API:**
   ```bash
   curl https://todo-app-backend.onrender.com/api/todos
   ```

2. **Test Frontend:**
   - Visit your frontend URL
   - Try adding, updating, and deleting todos

## Environment Variables Reference

### Backend Environment Variables:
- `NODE_ENV`: Set to `production`
- `MONGODB_URI`: Your MongoDB Atlas connection string
- `PORT`: Port number (Render will override this)

### Frontend Environment Variables:
- `REACT_APP_API_URL`: Your backend service URL

## Troubleshooting

### Common Issues:

1. **Build Failures:**
   - Check build logs in Render dashboard
   - Ensure all dependencies are in package.json

2. **Database Connection Issues:**
   - Verify MongoDB Atlas connection string
   - Check network access settings in Atlas

3. **CORS Issues:**
   - Backend is configured with CORS enabled
   - Frontend uses environment variable for API URL

4. **Environment Variables:**
   - Ensure all variables are set correctly
   - Check for typos in variable names

## File Structure for Render

```
todo-app/
├── backend/
│   ├── server.js          # Main backend server
│   ├── package.json       # Backend dependencies
│   └── ...
├── frontend/
│   ├── src/
│   │   ├── App.jsx        # Main React component
│   │   ├── api.js         # API configuration
│   │   └── ...
│   ├── package.json       # Frontend dependencies
│   └── ...
├── package.json           # Root package.json
├── render.yaml            # Render configuration
└── README.md
```

## Monitoring and Logs

- **Backend Logs:** Available in Render dashboard under your backend service
- **Frontend Logs:** Available in Render dashboard under your frontend service
- **Database:** Monitor in MongoDB Atlas dashboard

## Cost Optimization

- Both services use Render's free tier
- MongoDB Atlas has a free tier with 512MB storage
- Monitor usage to avoid exceeding free limits

## Security Considerations

- Use environment variables for sensitive data
- MongoDB Atlas provides built-in security
- Render handles SSL certificates automatically
- CORS is configured for production use
