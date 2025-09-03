# 🚀 Quick Start: Deploy Your Server to AWS

## 🎯 **Choose Your Deployment Method**

### **Method 1: EC2 (Easiest - Recommended)**
```bash
# 1. Launch EC2 instance in AWS Console
# 2. Update ec2-deploy.sh with your instance details
# 3. Run: ./ec2-deploy.sh
```

### **Method 2: Docker (Advanced)**
```bash
# 1. Build: docker build -t todo-app-backend .
# 2. Test: docker-compose up
# 3. Deploy to ECS or EC2
```

## 📋 **Step-by-Step EC2 Deployment**

### **Step 1: Create EC2 Instance**
1. Go to AWS Console → EC2 → Launch Instance
2. Choose **Ubuntu 22.04 LTS**
3. Select **t3.micro** (free tier) or **t3.small**
4. Create/select your key pair
5. Configure Security Group:
   - **SSH (22)**: Your IP only
   - **HTTP (80)**: 0.0.0.0/0
   - **Custom TCP (5001)**: 0.0.0.0/0

### **Step 2: Update Deployment Script**
```bash
# Edit ec2-deploy.sh and update:
EC2_INSTANCE_ID="i-1234567890abcdef0"  # Your instance ID
KEY_FILE="your-key-file.pem"           # Your .pem file path
REGION="us-east-1"                     # Your region
```

### **Step 3: Deploy**
```bash
# Make script executable (already done)
chmod +x ec2-deploy.sh

# Run deployment
./ec2-deploy.sh
```

## 🔧 **What Gets Deployed**

✅ **Your Node.js server** with upload API  
✅ **All dependencies** (multer, aws-sdk, etc.)  
✅ **Environment configuration** for production  
✅ **PM2 process manager** for auto-restart  
✅ **MongoDB setup** (local or Atlas)  

## 🌐 **After Deployment**

### **Test Your Server**
```bash
# Check if server is running
ssh -i your-key.pem ec2-user@your-instance-ip 'pm2 status'

# Test the API
curl http://your-instance-ip:5001/
curl http://your-instance-ip:5001/api/todos
```

### **Update Frontend**
```bash
# In your frontend code, change API URL from:
# http://localhost:5001
# To:
# http://your-instance-ip:5001
```

## 🗄️ **Database Options**

### **Option A: MongoDB on EC2 (Included in deployment)**
- MongoDB installed automatically
- Database: `todo-app-paramesh`
- Local storage on EC2

### **Option B: MongoDB Atlas (Recommended for production)**
1. Create free MongoDB Atlas account
2. Get connection string
3. Update `MONGODB_URI` in production .env

## 🔒 **Security Checklist**

- ✅ **Security Groups** configured
- ✅ **Key Pair** secured
- ✅ **IAM Roles** for S3 access
- ✅ **Environment variables** set
- ✅ **PM2** for process management

## 💰 **Cost Estimate**

- **EC2 t3.micro**: ~$8-12/month
- **S3 Storage**: ~$0.023/GB/month
- **Data Transfer**: ~$0.09/GB
- **Total**: ~$10-15/month for small app

## 🚨 **Common Issues & Solutions**

| Issue | Solution |
|-------|----------|
| Can't connect to server | Check security groups |
| S3 upload fails | Verify IAM permissions |
| MongoDB connection error | Check MongoDB service |
| High memory usage | Monitor with CloudWatch |

## 📞 **Need Help?**

1. **Check logs**: `pm2 logs`
2. **Server status**: `pm2 status`
3. **AWS Console**: Monitor EC2 instance
4. **Documentation**: See `AWS_DEPLOYMENT_GUIDE.md`

## 🎉 **You're Ready!**

Your server will be running on AWS with:
- 🌐 **Public IP** accessible from anywhere
- 📁 **S3 integration** for file uploads
- 🗄️ **MongoDB** for todo storage
- 🔄 **Auto-restart** with PM2
- 📊 **Monitoring** capabilities

**Next step**: Update your frontend to point to the new server! 🚀
