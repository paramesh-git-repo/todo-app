# Vercel Deployment Guide

## Backend API Structure

Your Express.js backend has been converted to Vercel serverless functions in the `api/` directory:

### API Endpoints

1. **`/api/hello`** - Test endpoint
   - GET: Returns a hello message

2. **`/api/todos`** - Todo CRUD operations
   - GET: Fetch all todos
   - POST: Create a new todo

3. **`/api/todos/[id]`** - Individual todo operations
   - GET: Fetch a specific todo
   - PUT: Update a todo
   - DELETE: Delete a todo

### Files Created

- `api/hello.js` - Test endpoint
- `api/todos.js` - Main todos endpoint
- `api/todos/[id].js` - Individual todo operations
- `vercel.json` - Vercel configuration
- Updated `package.json` with necessary dependencies

## Deployment Steps

### 1. Install Vercel CLI
```bash
npm i -g vercel
```

### 2. Login to Vercel
```bash
vercel login
```

### 3. Set Environment Variables
Set your MongoDB connection string in Vercel:
```bash
vercel env add MONGODB_URI
```

### 4. Deploy
```bash
vercel --prod
```

## Environment Variables

- `MONGODB_URI`: Your MongoDB connection string (local or Atlas)

## API Usage

After deployment, your API will be available at:
- `https://your-project.vercel.app/api/hello`
- `https://your-project.vercel.app/api/todos`

## Frontend Configuration

Update your frontend to use the Vercel API URL instead of localhost.

## Testing

Test the hello endpoint:
```bash
curl https://your-project.vercel.app/api/hello
```
