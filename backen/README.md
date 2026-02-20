# MorphDetect Backend Server

Flask-based backend server for the MorphDetect application, integrating with SelfMAD morph detection models.

## 🚀 Features

- **Flask REST API** for image analysis
- **SelfMAD Integration** with multiple model architectures
- **File Upload Support** for image analysis
- **Base64 Image Support** for direct image data
- **CORS Enabled** for frontend integration
- **Model Management** with automatic initialization
- **Error Handling** and comprehensive logging

## 📋 Requirements

- Python 3.8 or higher
- PyTorch 2.0+
- CUDA support (optional, for GPU acceleration)
- 8GB+ RAM recommended
- 2GB+ disk space for model files

## 🛠️ Installation

### 1. Navigate to Backend Directory
```bash
cd backend
```

### 2. Create Virtual Environment (Recommended)
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Verify Model Files
Ensure the following files are present:
- `efficientnet_b7_checkpoint.tar` - Model checkpoint
- `morph_detect_selfmad_official.py` - Detection model code

## 🚀 Running the Server

### Option 1: Using the Startup Script (Recommended)
```bash
python run_server.py
```

### Option 2: Direct Flask Run
```bash
python app.py
```

### Option 3: Using Gunicorn (Production)
```bash
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

## 🌐 API Endpoints

### Health Check
```
GET /api/health
```
Returns server status and model information.

### Image Analysis (File Upload)
```
POST /api/analyze
Content-Type: multipart/form-data
Body: image file
```

### Image Analysis (Base64)
```
POST /api/analyze-base64
Content-Type: application/json
Body: {"image": "base64_encoded_image_data"}
```

### Analysis History
```
GET /api/history
```
Returns analysis history (mock data for now).

### Model Calibration
```
POST /api/calibrate
```
Calibration endpoint (placeholder).

## 📊 API Response Format

### Success Response
```json
{
  "status": "success",
  "analysis_id": "uuid",
  "timestamp": "2024-01-15T10:30:00Z",
  "filename": "image.jpg",
  "result": {
    "raw_logit": 2.5,
    "predicted_class": 1,
    "class_name": "MORPHED",
    "confidence": 2.5,
    "model": "SelfMAD EFFICIENTNET-B7"
  },
  "interpretation": {
    "is_morphed": true,
    "risk_level": "HIGH"
  }
}
```

### Error Response
```json
{
  "error": "Error description",
  "status": "error"
}
```

## 🔧 Configuration

### Environment Variables
- `FLASK_ENV`: Set to `production` for production mode
- `MODEL_PATH`: Path to model checkpoint file
- `MODEL_TYPE`: Model architecture type

### Model Types Supported
- `efficientnet-b4` - EfficientNet-B4 architecture
- `efficientnet-b7` - EfficientNet-B7 architecture (default)
- `swin` - Swin Transformer architecture
- `resnet` - ResNet-152 architecture
- `hrnet_w18` - HRNet-W18 architecture
- `hrnet_w32` - HRNet-W32 architecture
- `hrnet_w44` - HRNet-W44 architecture
- `hrnet_w64` - HRNet-W64 architecture

## 📁 Directory Structure

```
backend/
├── app.py                          # Main Flask application
├── run_server.py                   # Startup script
├── requirements.txt                # Python dependencies
├── README.md                       # This file
├── morph_detect_selfmad_official.py # SelfMAD detection model
├── efficientnet_b7_checkpoint.tar  # Model checkpoint
├── uploads/                        # Uploaded images (auto-created)
├── logs/                          # Log files (auto-created)
└── temp/                          # Temporary files (auto-created)
```

## 🔍 Troubleshooting

### Common Issues

1. **Model Loading Failed**
   - Check if checkpoint file exists
   - Verify file permissions
   - Check PyTorch version compatibility

2. **CUDA Out of Memory**
   - Reduce batch size in model code
   - Use CPU-only mode
   - Close other GPU applications

3. **Import Errors**
   - Verify virtual environment activation
   - Check all dependencies are installed
   - Verify Python version compatibility

### Debug Mode
Enable debug mode by setting:
```python
app.run(debug=True)
```

## 🔒 Security Considerations

- File upload size limit: 16MB
- Allowed file types: PNG, JPG, JPEG, GIF, BMP, TIFF
- CORS enabled for development (restrict in production)
- Input validation and sanitization

## 📈 Performance

- **Model Loading**: ~10-30 seconds (first time)
- **Inference Time**: ~0.5-2 seconds per image
- **Memory Usage**: ~2-4GB RAM
- **GPU Acceleration**: 2-5x faster with CUDA

## 🤝 Integration with Frontend

The backend is designed to work seamlessly with the React frontend:

1. **CORS Configuration**: Pre-configured for localhost development
2. **API Contract**: Matches frontend expectations
3. **Error Handling**: Consistent error response format
4. **File Handling**: Supports both file uploads and base64 data

## 📝 Development

### Adding New Endpoints
1. Add route in `app.py`
2. Update API documentation
3. Test with frontend integration

### Model Modifications
1. Modify `morph_detect_selfmad_official.py`
2. Update model loading logic
3. Test with sample images

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review server logs
3. Verify model file integrity
4. Check Python environment setup

## 🔄 Updates

- **v1.0.0**: Initial Flask server implementation
- **v1.1.0**: Added base64 image support
- **v1.2.0**: Enhanced error handling and logging
