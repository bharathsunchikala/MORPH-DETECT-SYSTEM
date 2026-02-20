#!/usr/bin/env python3
"""
Flask Server for MorphDetect Backend
Integrates with SelfMAD morph detection model
"""

import os
import json
import base64
from datetime import datetime
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename
import uuid
import logging
from pathlib import Path

# Import configuration
from config import get_config

# Import your morph detection model
try:
    from morph_detect_selfmad_official import SelfMADOfficialDetector
    MODEL_AVAILABLE = True
except ImportError as e:
    print(f"⚠️  Warning: Morph detection model not available: {e}")
    MODEL_AVAILABLE = False

# Module-level detector instance referenced by route handlers and startup initializer
detector = None

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def create_app(config_name=None):
    """Application factory pattern"""
    app = Flask(__name__)
    
    # Load configuration
    config = get_config()
    app.config.from_object(config)
    
    # Enable CORS
    CORS(app, origins=config.CORS_ORIGINS)
    
    # Create necessary directories
    os.makedirs(config.UPLOAD_FOLDER, exist_ok=True)
    os.makedirs('logs', exist_ok=True)
    os.makedirs('temp', exist_ok=True)
    
    # Note: detector is a module-level variable (see above). We do not
    # create a separate local detector here so that routes reference the
    # same instance that may be initialized at module startup.
    
    def allowed_file(filename):
        """Check if file extension is allowed"""
        return '.' in filename and \
               filename.rsplit('.', 1)[1].lower() in config.ALLOWED_EXTENSIONS

    def initialize_model():
        """Initialize the morph detection model"""
        # Use the module-level detector so initialization is visible to
        # route handlers and to the __main__ startup initializer.
        global detector
        if not MODEL_AVAILABLE:
            logger.warning("⚠️  Model not available - running in demo mode")
            return False

        try:
            logger.info("🔧 Initializing SelfMAD morph detection model...")
            detector = SelfMADOfficialDetector(config.MODEL_PATH, config.MODEL_TYPE)
            logger.info("✅ Model initialized successfully!")
            return True
        except Exception as e:
            logger.error(f"❌ Failed to initialize model: {e}")
            return False

    # Expose the initializer via app.config to avoid assigning new attributes
    # directly on the Flask object (Pylance will warn about that).
    app.config['INITIALIZE_MODEL_FUNC'] = initialize_model

    def save_uploaded_file(file):
        """Save uploaded file and return file path"""
        try:
            # Generate unique filename
            filename = secure_filename(file.filename)
            file_extension = filename.rsplit('.', 1)[1].lower()
            unique_filename = f"{uuid.uuid4().hex}.{file_extension}"
            file_path = config.UPLOAD_FOLDER / unique_filename
            
            # Save file
            file.save(file_path)
            logger.info(f"📁 File saved: {file_path}")
            return file_path, unique_filename
        except Exception as e:
            logger.error(f"❌ Failed to save file: {e}")
            raise

    @app.route('/api/health', methods=['GET'])
    def health_check():
        """Health check endpoint"""
        return jsonify({
            'status': 'healthy',
            'timestamp': datetime.now().isoformat(),
            'model_loaded': detector is not None,
            'model_type': config.MODEL_TYPE,
            'model_available': MODEL_AVAILABLE,
            'server_version': '1.0.0'
        })

    @app.route('/api/analyze', methods=['POST'])
    def analyze_image():
        """Analyze uploaded image for morphing detection"""
        try:
            # Check if file is present in request
            if 'image' not in request.files:
                return jsonify({
                    'error': 'No image file provided',
                    'status': 'error'
                }), 400

            file = request.files['image']
            
            # Check if file is selected
            if file.filename == '':
                return jsonify({
                    'error': 'No file selected',
                    'status': 'error'
                }), 400

            # Check file extension
            if not allowed_file(file.filename):
                return jsonify({
                    'error': f'File type not allowed. Allowed types: {", ".join(config.ALLOWED_EXTENSIONS)}',
                    'status': 'error'
                }), 400

            # Save uploaded file
            file_path, unique_filename = save_uploaded_file(file)
            
            # Check if model is loaded
            if detector is None:
                return jsonify({
                    'error': 'Model not initialized',
                    'status': 'error'
                }), 500

            # Analyze image
            logger.info(f"🔍 Analyzing image: {unique_filename}")
            result = detector.detect_morphing(str(file_path))
            
            # Check for errors in detection
            if 'error' in result:
                return jsonify({
                    'error': f'Detection failed: {result["error"]}',
                    'status': 'error'
                }), 500

            # Compute confidence from prob_morphed (probability of MORPHED)
            prob = float(result.get('prob_morphed', 0.0))
            # For display, convert to a percentage and scale sensibly
            confidence_pct = round(prob * 100.0, 1)

            # Interpretation: if predicted_class == 1, model sees MORPHED
            is_morphed = result.get('predicted_class') == 1

            # Risk assessment based on probability distance from 0.5 and class
            # Higher probability for MORPHED -> higher risk. For GENUINE, low prob -> low risk.
            if prob >= 0.9:
                risk_level = 'CRITICAL'
            elif prob >= 0.75:
                risk_level = 'HIGH'
            elif prob >= 0.5:
                risk_level = 'MEDIUM'
            else:
                risk_level = 'LOW'

            # Prepare response
            analysis_result = {
                'status': 'success',
                'analysis_id': str(uuid.uuid4()),
                'timestamp': datetime.now().isoformat(),
                'filename': unique_filename,
                'result': {
                    'raw_logit': result.get('raw_logit'),
                    'predicted_class': result.get('predicted_class'),
                    'class_name': result.get('class_name'),
                    'confidence': confidence_pct,
                    'model': result.get('model')
                },
                'interpretation': {
                    'is_morphed': is_morphed,
                    'risk_level': risk_level
                }
            }

            # Persist summary to history.json next to uploads
            try:
                history_file = Path(config.UPLOAD_FOLDER).parent / 'history.json'
                # Ensure parent exists
                history_file.parent.mkdir(parents=True, exist_ok=True)
                history = []
                if history_file.exists():
                    with open(history_file, 'r', encoding='utf-8') as hf:
                        try:
                            history = json.load(hf)
                        except Exception:
                            history = []

                # Append compact summary
                summary = {
                    'analysis_id': analysis_result['analysis_id'],
                    'timestamp': analysis_result['timestamp'],
                    'filename': unique_filename,
                    'class_name': analysis_result['result']['class_name'],
                    'confidence': analysis_result['result']['confidence'],
                    'risk_level': analysis_result['interpretation']['risk_level'],
                    'regions': result.get('regions', []),
                    'processing_time_ms': result.get('processing_time_ms', 0),
                    'thumbnail_url': f"/uploads/{unique_filename}"
                }
                history.insert(0, summary)
                # Keep recent 100 entries
                history = history[:100]
                with open(history_file, 'w', encoding='utf-8') as hf:
                    json.dump(history, hf, indent=2)
            except Exception as e:
                logger.warning(f"⚠️  Failed to persist history: {e}")

            logger.info(f"✅ Analysis completed: {result['class_name']} (logit: {result['raw_logit']:.4f})")
            
            return jsonify(analysis_result)

        except Exception as e:
            logger.error(f"❌ Analysis failed: {e}")
            return jsonify({
                'error': f'Analysis failed: {str(e)}',
                'status': 'error'
            }), 500

    @app.route('/api/analyze-base64', methods=['POST'])
    def analyze_image_base64():
        """Analyze image from base64 encoded data"""
        try:
            # Get JSON data
            data = request.get_json()
            if not data or 'image' not in data:
                return jsonify({
                    'error': 'No image data provided',
                    'status': 'error'
                }), 400

            # Decode base64 image
            try:
                image_data = base64.b64decode(data['image'].split(',')[1] if ',' in data['image'] else data['image'])
            except Exception as e:
                return jsonify({
                    'error': f'Invalid base64 image data: {str(e)}',
                    'status': 'error'
                }), 400

            # Save temporary file
            temp_filename = f"temp_{uuid.uuid4().hex}.jpg"
            temp_path = config.UPLOAD_FOLDER / temp_filename
            
            with open(temp_path, 'wb') as f:
                f.write(image_data)

            # Check if model is loaded
            if detector is None:
                return jsonify({
                    'error': 'Model not initialized',
                    'status': 'error'
                }), 500

            # Analyze image
            logger.info(f"🔍 Analyzing base64 image: {temp_filename}")
            result = detector.detect_morphing(str(temp_path))
            
            # Clean up temporary file
            try:
                os.remove(temp_path)
            except:
                pass

            # Check for errors in detection
            if 'error' in result:
                return jsonify({
                    'error': f'Detection failed: {result["error"]}',
                    'status': 'error'
                }), 500

            # Compute confidence from prob_morphed
            prob = float(result.get('prob_morphed', 0.0))
            confidence_pct = round(prob * 100.0, 1)
            is_morphed = result.get('predicted_class') == 1
            if prob >= 0.9:
                risk_level = 'CRITICAL'
            elif prob >= 0.75:
                risk_level = 'HIGH'
            elif prob >= 0.5:
                risk_level = 'MEDIUM'
            else:
                risk_level = 'LOW'

            analysis_result = {
                'status': 'success',
                'analysis_id': str(uuid.uuid4()),
                'timestamp': datetime.now().isoformat(),
                'result': {
                    'raw_logit': result.get('raw_logit'),
                    'predicted_class': result.get('predicted_class'),
                    'class_name': result.get('class_name'),
                    'confidence': confidence_pct,
                    'model': result.get('model')
                },
                'interpretation': {
                    'is_morphed': is_morphed,
                    'risk_level': risk_level
                }
            }

            # Persist to history
            try:
                history_file = Path(config.UPLOAD_FOLDER).parent / 'history.json'
                history_file.parent.mkdir(parents=True, exist_ok=True)
                history = []
                if history_file.exists():
                    with open(history_file, 'r', encoding='utf-8') as hf:
                        try:
                            history = json.load(hf)
                        except Exception:
                            history = []

                summary = {
                    'analysis_id': analysis_result['analysis_id'],
                    'timestamp': analysis_result['timestamp'],
                    'filename': temp_filename,
                    'class_name': analysis_result['result']['class_name'],
                    'confidence': analysis_result['result']['confidence'],
                    'risk_level': analysis_result['interpretation']['risk_level'],
                    'regions': result.get('regions', []),
                    'processing_time_ms': result.get('processing_time_ms', 0),
                    'thumbnail_url': f"/uploads/{temp_filename}"
                }
                history.insert(0, summary)
                history = history[:100]
                with open(history_file, 'w', encoding='utf-8') as hf:
                    json.dump(history, hf, indent=2)
            except Exception as e:
                logger.warning(f"⚠️  Failed to persist history: {e}")

            logger.info(f"✅ Base64 analysis completed: {result['class_name']} (logit: {result['raw_logit']:.4f})")
            
            return jsonify(analysis_result)

        except Exception as e:
            logger.error(f"❌ Base64 analysis failed: {e}")
            return jsonify({
                'error': f'Analysis failed: {str(e)}',
                'status': 'error'
            }), 500

    @app.route('/api/history', methods=['GET'])
    def get_history():
        """Get analysis history (mock data for now)"""
        # Return persisted history if available
        try:
            history_file = Path(config.UPLOAD_FOLDER).parent / 'history.json'
            if history_file.exists():
                with open(history_file, 'r', encoding='utf-8') as hf:
                    history = json.load(hf)
            else:
                history = []
            return jsonify({
                'status': 'success',
                'history': history
            })
        except Exception as e:
            logger.error(f"❌ Failed to read history: {e}")
            return jsonify({
                'status': 'error',
                'message': 'Failed to read history'
            }), 500

    @app.route('/api/calibrate', methods=['POST'])
    def calibrate_model():
        """Calibrate model with new data (placeholder)"""
        return jsonify({
            'status': 'success',
            'message': 'Calibration endpoint - implementation pending',
            'timestamp': datetime.now().isoformat()
        })

    @app.route('/uploads/<filename>')
    def uploaded_file(filename):
        """Serve uploaded files"""
        return send_from_directory(str(config.UPLOAD_FOLDER), filename)

    @app.errorhandler(413)
    def too_large(e):
        """Handle file too large error"""
        return jsonify({
            'error': f'File too large. Maximum size is {config.MAX_CONTENT_LENGTH // (1024*1024)}MB.',
            'status': 'error'
        }), 413

    @app.errorhandler(500)
    def internal_error(e):
        """Handle internal server error"""
        return jsonify({
            'error': 'Internal server error',
            'status': 'error'
        }), 500

    @app.route('/')
    def index():
        """Root endpoint"""
        return jsonify({
            'message': 'MorphDetect Backend API',
            'version': '1.0.0',
            'endpoints': [
                '/api/health',
                '/api/analyze',
                '/api/analyze-base64',
                '/api/history',
                '/api/calibrate'
            ]
        })

    return app

# Create app instance
app = create_app()

if __name__ == '__main__':
    # Initialize model before starting server
    if MODEL_AVAILABLE:
        try:
            # Call the app-local initialize_model if present via app.config.
            init_func = app.config.get('INITIALIZE_MODEL_FUNC')
            if callable(init_func):
                init_func()
            else:
                # Fallback: try to import and initialize directly
                from morph_detect_selfmad_official import SelfMADOfficialDetector
                detector = SelfMADOfficialDetector(
                    app.config['MODEL_PATH'],
                    app.config['MODEL_TYPE']
                )
                logger.info("✅ Model initialized successfully!")
        except Exception as e:
            logger.error(f"❌ Failed to initialize model: {e}")
            logger.info("⚠️  Server will start in demo mode")
    
    logger.info("🚀 Starting Flask server...")
    app.run(
        host=app.config['HOST'],
        port=app.config['PORT'],
        debug=app.config['DEBUG'],
        threaded=app.config['THREADED']
    )
