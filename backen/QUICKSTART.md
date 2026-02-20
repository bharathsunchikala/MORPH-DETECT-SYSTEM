# 🚀 Quick Start Guide - MorphDetect Backend

Get your Flask backend running in 5 minutes!

## ⚡ Quick Setup

### 1. Navigate to Backend Directory
```bash
cd backend
```

### 2. Create Virtual Environment
```bash
python -m venv venv
```

### 3. Activate Virtual Environment
**Windows:**
```bash
venv\Scripts\activate
```

**macOS/Linux:**
```bash
source venv/bin/activate
```

### 4. Install Dependencies
```bash
pip install -r requirements.txt
```

### 5. Start the Server
```bash
python app.py
```

🎉 **Server will be running at: http://localhost:5000**

## 🔧 Alternative Startup Methods

### Option 1: Using Startup Script
```bash
python run_server.py
```

### Option 2: Using Windows Batch File
```bash
start_server.bat
```

### Option 3: Using Gunicorn (Production)
```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

## 🧪 Test the Server

### 1. Health Check
```bash
curl http://localhost:5000/api/health
```

### 2. Run Test Script
```bash
python test_server.py
```

### 3. Test in Browser
Open: http://localhost:5000/api/health

## 📱 Frontend Integration

Your React frontend is already configured to work with the Flask backend!

- **API Base URL**: http://localhost:5000
- **CORS**: Enabled for localhost development
- **Endpoints**: All API endpoints are ready

## 🚨 Troubleshooting

### Common Issues:

1. **Port 5000 already in use**
   ```bash
   # Kill process using port 5000
   netstat -ano | findstr :5000
   taskkill /PID <PID> /F
   ```

2. **Model loading failed**
   - Check if `efficientnet_b7_checkpoint.tar` exists
   - Verify file permissions
   - Check PyTorch installation

3. **Import errors**
   - Ensure virtual environment is activated
   - Verify all dependencies are installed
   - Check Python version (3.8+)

### Get Help:
- Check server logs for detailed error messages
- Run `python test_server.py` to diagnose issues
- Verify all files are in the correct locations

## 🔄 Next Steps

1. **Test with real images** - Upload images through your frontend
2. **Monitor performance** - Check server logs and response times
3. **Customize configuration** - Modify `config.py` for your needs
4. **Scale up** - Use Gunicorn for production deployment

## 📊 Expected Performance

- **Model Loading**: 10-30 seconds (first time)
- **Inference**: 0.5-2 seconds per image
- **Memory Usage**: 2-4GB RAM
- **GPU Acceleration**: 2-5x faster with CUDA

---

**Need help?** Check the main README.md for detailed documentation!
