#!/bin/bash

# EC2 Deployment Script for Todo App Backend
# This script helps deploy your Node.js server to AWS EC2

echo "🚀 Starting EC2 deployment for Todo App Backend..."

# Configuration
EC2_INSTANCE_ID="your-ec2-instance-id"
EC2_USER="ec2-user"  # or "ubuntu" depending on your AMI
KEY_FILE="your-key-file.pem"
REGION="us-east-1"  # Change to your preferred region

echo "📋 Configuration:"
echo "   Instance ID: $EC2_INSTANCE_ID"
echo "   User: $EC2_USER"
echo "   Key File: $KEY_FILE"
echo "   Region: $REGION"

# Check if key file exists
if [ ! -f "$KEY_FILE" ]; then
    echo "❌ Error: Key file $KEY_FILE not found!"
    echo "   Please update the KEY_FILE variable in this script"
    exit 1
fi

echo ""
echo "📦 Preparing deployment package..."

# Create deployment directory
mkdir -p deploy
cp -r . deploy/
cd deploy

# Remove unnecessary files
rm -rf node_modules
rm -rf .git
rm -rf .DS_Store

# Create production .env file
cat > .env << EOF
MONGODB_URI=mongodb://localhost:27017/todo-app-paramesh
PORT=5001
NODE_ENV=production
S3_BUCKET_NAME=todo-app-paramesh
EOF

# Create deployment archive
tar -czf ../todo-app-backend.tar.gz .
cd ..

echo "✅ Deployment package created: todo-app-backend.tar.gz"

echo ""
echo "🌐 Deploying to EC2..."

# Copy files to EC2
scp -i "$KEY_FILE" -o StrictHostKeyChecking=no todo-app-backend.tar.gz "$EC2_USER@$EC2_INSTANCE_ID:/home/$EC2_USER/"

# SSH into EC2 and deploy
ssh -i "$KEY_FILE" -o StrictHostKeyChecking=no "$EC2_USER@$EC2_INSTANCE_ID" << 'EOF'
    echo "🔧 Installing dependencies..."
    cd /home/ec2-user
    tar -xzf todo-app-backend.tar.gz
    cd todo-app-backend
    
    # Install Node.js if not present
    if ! command -v node &> /dev/null; then
        echo "📥 Installing Node.js..."
        curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
        sudo apt-get install -y nodejs
    fi
    
    # Install PM2 for process management
    if ! command -v pm2 &> /dev/null; then
        echo "📥 Installing PM2..."
        sudo npm install -g pm2
    fi
    
    echo "📦 Installing dependencies..."
    npm install --production
    
    echo "🚀 Starting server with PM2..."
    pm2 start server.js --name "todo-app-backend"
    pm2 save
    pm2 startup
    
    echo "🧹 Cleaning up..."
    rm -f todo-app-backend.tar.gz
    
    echo "✅ Deployment complete!"
    echo "🌐 Server should be running on port 5001"
    echo "📊 Check status with: pm2 status"
EOF

echo ""
echo "🎉 Deployment completed!"
echo ""
echo "📋 Next steps:"
echo "   1. Configure security groups to allow port 5001"
echo "   2. Set up a domain name (optional)"
echo "   3. Configure MongoDB on EC2 or use MongoDB Atlas"
echo "   4. Update your frontend to point to the EC2 instance"
echo ""
echo "🔍 Check server status:"
echo "   ssh -i $KEY_FILE $EC2_USER@$EC2_INSTANCE_ID 'pm2 status'"
