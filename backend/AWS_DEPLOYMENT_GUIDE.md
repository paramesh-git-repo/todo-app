# 🚀 AWS Deployment Guide for Todo App Backend

## 📋 **Prerequisites**

1. **AWS Account** with appropriate permissions
2. **AWS CLI** installed and configured
3. **EC2 Key Pair** created
4. **S3 Bucket** already created (`todo-app-paramesh`)

## 🎯 **Deployment Options**

### **Option 1: EC2 Deployment (Recommended for beginners)**

#### **Step 1: Launch EC2 Instance**
```bash
# Launch Ubuntu 22.04 LTS instance
# Instance Type: t3.micro (free tier) or t3.small
# Security Group: Allow ports 22 (SSH), 80 (HTTP), 443 (HTTPS), 5001 (App)
# Key Pair: Use your existing key pair
```

#### **Step 2: Configure Security Groups**
- **SSH (22)**: Your IP only
- **HTTP (80)**: 0.0.0.0/0 (for web access)
- **HTTPS (443)**: 0.0.0.0/0 (for secure web access)
- **Custom TCP (5001)**: 0.0.0.0/0 (for your app)

#### **Step 3: Deploy Using Script**
```bash
# Make script executable
chmod +x ec2-deploy.sh

# Update script with your details
# Edit EC2_INSTANCE_ID, KEY_FILE, REGION

# Run deployment
./ec2-deploy.sh
```

### **Option 2: Docker + ECS Deployment**

#### **Step 1: Build and Push Docker Image**
```bash
# Build image
docker build -t todo-app-backend .

# Tag for ECR
docker tag todo-app-backend:latest your-account.dkr.ecr.region.amazonaws.com/todo-app-backend:latest

# Push to ECR
aws ecr get-login-password --region region | docker login --username AWS --password-stdin your-account.dkr.ecr.region.amazonaws.com
docker push your-account.dkr.ecr.region.amazonaws.com/todo-app-backend:latest
```

#### **Step 2: Deploy to ECS**
```bash
# Create ECS cluster
aws ecs create-cluster --cluster-name todo-app-cluster

# Create task definition
aws ecs register-task-definition --cli-input-json file://task-definition.json

# Create service
aws ecs create-service --cluster todo-app-cluster --service-name todo-app-service --task-definition todo-app-backend:1
```

### **Option 3: Elastic Beanstalk**

#### **Step 1: Install EB CLI**
```bash
pip install awsebcli
```

#### **Step 2: Initialize EB Application**
```bash
eb init todo-app-backend --platform node.js --region us-east-1
eb create todo-app-production
eb deploy
```

## 🔧 **Environment Configuration**

### **Production .env File**
```bash
MONGODB_URI=mongodb://localhost:27017/todo-app-paramesh
PORT=5001
NODE_ENV=production
S3_BUCKET_NAME=todo-app-paramesh
```

### **AWS Credentials Configuration**
```bash
# Configure AWS CLI
aws configure

# Or set environment variables
export AWS_ACCESS_KEY_ID=your-access-key
export AWS_SECRET_ACCESS_KEY=your-secret-key
export AWS_DEFAULT_REGION=us-east-1
```

## 🗄️ **Database Setup**

### **Option A: MongoDB on EC2**
```bash
# Install MongoDB
sudo apt-get update
sudo apt-get install -y mongodb

# Start MongoDB service
sudo systemctl start mongodb
sudo systemctl enable mongodb

# Create database
mongo
use todo-app-paramesh
```

### **Option B: MongoDB Atlas (Recommended)**
1. Create MongoDB Atlas account
2. Create cluster
3. Get connection string
4. Update MONGODB_URI in .env

## 🌐 **Domain and SSL Setup**

### **Route 53 + ACM**
```bash
# Request SSL certificate
aws acm request-certificate --domain-name yourdomain.com --validation-method DNS

# Create Route 53 hosted zone
aws route53 create-hosted-zone --name yourdomain.com --caller-reference $(date +%s)

# Add DNS records
aws route53 change-resource-record-sets --hosted-zone-id Z123456789 --change-batch file://dns-changes.json
```

### **Nginx Configuration (for EC2)**
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name yourdomain.com;
    
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    location / {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 📊 **Monitoring and Logging**

### **CloudWatch Setup**
```bash
# Install CloudWatch agent
sudo yum install -y amazon-cloudwatch-agent

# Configure agent
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-config-wizard
```

### **PM2 Monitoring**
```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start server.js --name "todo-app-backend"

# Monitor
pm2 monit
pm2 logs
```

## 🔒 **Security Best Practices**

1. **IAM Roles**: Use EC2 instance roles instead of access keys
2. **Security Groups**: Restrict access to necessary ports only
3. **VPC**: Use private subnets for database, public for web servers
4. **Encryption**: Enable encryption at rest and in transit
5. **Backups**: Regular database and application backups

## 💰 **Cost Optimization**

1. **Reserved Instances**: For predictable workloads
2. **Spot Instances**: For non-critical workloads
3. **Auto Scaling**: Scale down during low usage
4. **S3 Lifecycle**: Move old files to cheaper storage tiers

## 🚨 **Troubleshooting**

### **Common Issues**
- **Port not accessible**: Check security groups
- **Database connection failed**: Verify MongoDB service and credentials
- **S3 upload failed**: Check IAM permissions
- **High memory usage**: Monitor with CloudWatch

### **Debug Commands**
```bash
# Check server status
pm2 status
pm2 logs

# Check MongoDB
sudo systemctl status mongodb
mongo --eval "db.serverStatus()"

# Check S3 access
aws s3 ls s3://todo-app-paramesh

# Check application logs
tail -f /var/log/nginx/error.log
```

## 📞 **Support Resources**

- **AWS Documentation**: https://docs.aws.amazon.com/
- **MongoDB Atlas**: https://docs.atlas.mongodb.com/
- **PM2 Documentation**: https://pm2.keymetrics.io/docs/
- **Nginx Documentation**: https://nginx.org/en/docs/
