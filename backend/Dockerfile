# Dockerfile for Todo App Backend
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Create production environment file
RUN echo "MONGODB_URI=mongodb://localhost:27017/todo-app-paramesh\nPORT=5001\nNODE_ENV=production\nS3_BUCKET_NAME=todo-app-paramesh" > .env

# Expose port
EXPOSE 5001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5001/', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application
CMD ["node", "server.js"]
