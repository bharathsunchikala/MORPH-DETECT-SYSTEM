#!/usr/bin/env python3
"""
morph_detect_selfmad_official.py
Official SelfMAD morph detection using their exact model structure and loading method.
Based on the official SelfMAD GitHub repository: https://github.com/LeonTodorov/SelfMAD
"""

import os
import sys
import torch
import torch.nn as nn
import torch.nn.functional as F
import numpy as np
import cv2
from PIL import Image
import argparse
import pickle
import struct
from efficientnet_pytorch import EfficientNet
from torchvision.models import swin_v2_b, resnet152
from torchvision.models import Swin_V2_B_Weights, ResNet152_Weights
import timm

# Simplified SAM optimizer (since utils.sam might not be available)
class SAM:
    def __init__(self, parameters, optimizer_class, **kwargs):
        self.parameters = parameters
        self.optimizer_class = optimizer_class
        self.kwargs = kwargs
        self.optimizer = None
    
    def zero_grad(self):
        if self.optimizer:
            self.optimizer.zero_grad()
    
    def first_step(self, zero_grad=False):
        if zero_grad:
            self.zero_grad()
        if not self.optimizer:
            self.optimizer = self.optimizer_class(self.parameters, **self.kwargs)
    
    def second_step(self, zero_grad=False):
        if zero_grad:
            self.zero_grad()
        if self.optimizer:
            self.optimizer.step()

# -------- Configuration --------
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
# ------------------------------

# Official SelfMAD model architecture (exact copy from their utils/model.py)
class Detector(nn.Module):
    
    def __init__(self, model="hrnet_w18_multi", lr=5e-4):
        super(Detector, self).__init__()
        if model == "efficientnet-b0":
            self.net=EfficientNet.from_pretrained("efficientnet-b0",advprop=True,num_classes=2)
        elif model == "efficientnet-b4":
            self.net=EfficientNet.from_pretrained("efficientnet-b4",advprop=True,num_classes=2)
        elif model == "swin":
            self.net=swin_v2_b(weights=Swin_V2_B_Weights.IMAGENET1K_V1)
            self.net.head = nn.Linear(in_features=1024, out_features=2, bias=True)
        elif model == "resnet":
            self.net = resnet152(weights=ResNet152_Weights.IMAGENET1K_V2)
            self.net.head = nn.Linear(in_features=1024, out_features=2, bias=True)
        elif model == "hrnet_w18":
            self.net = timm.create_model('hrnet_w18', pretrained=True, num_classes=2)
        elif model == "hrnet_w32":
            self.net = timm.create_model('hrnet_w32', pretrained=True, num_classes=2)
        elif model == "hrnet_w44":
            self.net = timm.create_model('hrnet_w44', pretrained=True, num_classes=2)
        elif model == "hrnet_w64":
            self.net = timm.create_model('hrnet_w64', pretrained=True, num_classes=2)
            
        self.cel=nn.CrossEntropyLoss()
        self.optimizer=SAM(self.parameters(),torch.optim.SGD,lr=lr, momentum=0.9)

    def forward(self,x):
        x=self.net(x)
        return x

class SelfMADOfficialDetector:
    """Official SelfMAD detector with proper checkpoint loading"""
    
    def __init__(self, model_path=None, model_type='efficientnet-b0'):
        self.model_type = model_type
        self.model = Detector(model=model_type)
        
        if model_path and os.path.exists(model_path):
            self.load_model(model_path)
        
        self.model.train(mode=False)
        self.model.to(DEVICE)
        
        # Image size based on model type (from SelfMAD code)
        if "hrnet" in model_type:
            self.image_size = 384
        elif "efficientnet" in model_type:
         if "b0" in model_type:
            self.image_size = 224
         elif "b4" in model_type:
            self.image_size = 380
         else:
            self.image_size = 224
        elif "swin" in model_type:
            self.image_size = 224  # Swin Transformer typically uses 224x224
        elif "resnet" in model_type:
            self.image_size = 224  # ResNet typically uses 224x224
        else:
            self.image_size = 380
        
        print(f"✅ Initialized SelfMAD {model_type.upper()} detector")
    
    def load_model(self, model_path):
        """Load SelfMAD checkpoint using official method"""
        print(f"📥 Loading SelfMAD model from: {model_path}")
        
        # Check if it's a .tar file (official SelfMAD format)
        if model_path.endswith('.tar'):
            return self._load_from_tar_file(model_path)
        
        # Try to load the checkpoint using the official SelfMAD method
        try:
            # Load checkpoint with proper PyTorch settings
            checkpoint = torch.load(model_path, map_location=DEVICE, weights_only=False)
            
            if isinstance(checkpoint, dict):
                if 'model' in checkpoint:
                    self.model.load_state_dict(checkpoint['model'])
                    print("✅ Successfully loaded model state_dict from 'model' key")
                    return
                elif 'state_dict' in checkpoint:
                    self.model.load_state_dict(checkpoint['state_dict'])
                    print("✅ Successfully loaded model state_dict from 'state_dict' key")
                    return
                else:
                    print(f"⚠️  Checkpoint keys: {list(checkpoint.keys())}")
                    raise ValueError("No 'model' or 'state_dict' key found in checkpoint")
            else:
                # Try to load directly as state dict
                self.model.load_state_dict(checkpoint)
                print("✅ Successfully loaded checkpoint directly as state_dict")
                return
                
        except Exception as e:
            print(f"❌ Standard loading failed: {e}")
            print("🔄 Trying alternative loading methods...")
            
            # Try alternative loading methods
            if self._try_alternative_loading(model_path):
                return
            
            raise RuntimeError("❌ Failed to load HRNet model from checkpoint. All loading methods failed.")
    
    def _load_from_tar_file(self, tar_path):
        """Load from .tar file (official SelfMAD format)"""
        try:
            print(f"📦 Loading from .tar file: {tar_path}")
            
            # Load checkpoint from .tar file
            checkpoint = torch.load(tar_path, map_location=DEVICE, weights_only=False)
            
            if isinstance(checkpoint, dict):
                print(f"📋 Checkpoint keys: {list(checkpoint.keys())}")
                
                if 'model' in checkpoint:
                    self.model.load_state_dict(checkpoint['model'])
                    print("✅ Successfully loaded model state_dict from .tar 'model' key")
                    return True
                elif 'state_dict' in checkpoint:
                    self.model.load_state_dict(checkpoint['state_dict'])
                    print("✅ Successfully loaded model state_dict from .tar 'state_dict' key")
                    return True
                else:
                    print("⚠️  No 'model' or 'state_dict' key found in .tar file")
                    return False
            else:
                print(f"⚠️  .tar file contains: {type(checkpoint)}")
                return False
                
        except Exception as e:
            print(f"❌ .tar file loading failed: {e}")
            return False
    
    def _try_alternative_loading(self, model_path):
        """Try alternative loading methods for complex PyTorch checkpoints"""
        try:
            # Method 1: Try loading from the .data directory structure
            if os.path.isdir(model_path):
                return self._load_from_data_directory(model_path)
            
            # Method 2: Try loading the data.pkl file directly
            if model_path.endswith('.pkl'):
                return self._load_from_pickle_file(model_path)
            
            # Method 3: Try loading from parent directory
            parent_dir = os.path.dirname(model_path)
            if os.path.isdir(parent_dir):
                return self._load_from_data_directory(parent_dir)
            
            return False
            
        except Exception as e:
            print(f"⚠️  Alternative loading failed: {e}")
            return False
    
    def _load_from_data_directory(self, directory_path):
        """Load from PyTorch .data directory structure"""
        try:
            print(f"📁 Scanning directory: {directory_path}")
            
            # Look for data.pkl file
            data_pkl_path = os.path.join(directory_path, "data.pkl")
            if os.path.exists(data_pkl_path):
                print(f"📥 Found data.pkl: {data_pkl_path}")
                return self._load_from_pickle_file(data_pkl_path)
            
            # Look for .data subdirectory
            data_dir = os.path.join(directory_path, ".data")
            if os.path.isdir(data_dir):
                print(f"📁 Found .data directory: {data_dir}")
                return self._load_from_data_directory(data_dir)
            
            return False
            
        except Exception as e:
            print(f"❌ Directory loading failed: {e}")
            return False
    
    def _load_from_pickle_file(self, pickle_path):
        """Load from pickle file with custom handling"""
        try:
            print(f"📥 Loading from pickle file: {pickle_path}")
            
            # Try to load with pickle directly
            with open(pickle_path, 'rb') as f:
                data = pickle.load(f)
            
            print(f"📊 Loaded pickle data with type: {type(data)}")
            
            if isinstance(data, dict):
                print(f"📋 Available keys: {list(data.keys())}")
                
                # Try different key combinations
                if 'model' in data:
                    self.model.load_state_dict(data['model'])
                    print("✅ Successfully loaded model state_dict from pickle 'model' key")
                    return True
                elif 'state_dict' in data:
                    self.model.load_state_dict(data['state_dict'])
                    print("✅ Successfully loaded model state_dict from pickle 'state_dict' key")
                    return True
                elif 'weights' in data:
                    self.model.load_state_dict(data['weights'])
                    print("✅ Successfully loaded model state_dict from pickle 'weights' key")
                    return True
                else:
                    print("⚠️  No recognized keys found in pickle data")
                    return False
            else:
                print(f"⚠️  Pickle data is not a dict, it's: {type(data)}")
                return False
                
        except Exception as e:
            print(f"❌ Pickle loading failed: {e}")
            return False
    
    def preprocess_image(self, image_path):
        """Preprocess image using SelfMAD method"""
        try:
            # Load image
            img = np.array(Image.open(image_path))
            
            # Resize to model-specific size
            img = cv2.resize(img, (self.image_size, self.image_size))
            
            # Convert to tensor format
            img = img.transpose((2, 0, 1))  # HWC to CHW
            img = img.astype('float32') / 255.0  # Normalize to [0, 1]
            img = img[np.newaxis, ...]  # Add batch dimension
            
            # Convert to torch tensor
            img_tensor = torch.from_numpy(img).to(DEVICE, non_blocking=True).float()
            
            return img_tensor
            
        except Exception as e:
            raise ValueError(f"Failed to preprocess image: {e}")
    
    def detect_morphing(self, image_path):
        """Detect morphing using SelfMAD model - raw logits only"""
        try:
            # Preprocess image
            img_tensor = self.preprocess_image(image_path)
            
            # Inference - get raw logits without softmax
            with torch.no_grad():
                output = self.model(img_tensor)
                # Convert to CPU tensor and numpy
                logits = output.cpu().data.numpy()[0]
                # Ensure logits is a 1-D array length 2
                if hasattr(logits, '__len__') and len(logits) >= 2:
                    raw_logit = float(logits[1])
                else:
                    # Fallback if shape unexpected
                    raw_logit = float(logits)
                # Get predicted class (0 or 1)
                predicted_class = int(np.argmax(logits))
                # Compute softmax probability for class 1 (morphed)
                try:
                    probs = F.softmax(torch.from_numpy(logits), dim=0).numpy()
                    prob_morphed = float(probs[1]) if len(probs) > 1 else float(probs[0])
                except Exception:
                    # Fallback to sigmoid on raw_logit
                    prob_morphed = float(1.0 / (1.0 + np.exp(-raw_logit)))
            
            # Return raw output without softmax
            return {
                "image": image_path,
                "raw_logit": float(raw_logit),
                "predicted_class": int(predicted_class),
                "prob_morphed": float(prob_morphed),
                "class_name": "MORPHED" if predicted_class == 1 else "GENUINE",
                "model": f"SelfMAD {self.model_type.upper()}"
            }
            
        except Exception as e:
            return {
                "image": image_path,
                "error": str(e),
                "raw_logit": None,
                "predicted_class": None,
                "class_name": None
            }

def main():
    parser = argparse.ArgumentParser(description='Official SelfMAD Morph Detection')
    parser.add_argument('-m', dest='model_type', type=str, default='swin', 
                        help='Type of the model (default: swin)')
    parser.add_argument('-in', dest='input_path', type=str, 
                        help='Path to input image')
    parser.add_argument('-p', dest='model_path', type=str, 
                        help='Path to saved model checkpoint')
    parser.add_argument('--test_all', action='store_true', 
                        help='Test all available images')
    

    args = parser.parse_args()
    
    # Check if we have required arguments
    if not args.model_path and not args.test_all:
        print("🚀 Official SelfMAD Morph Detection Tool")
        print("=" * 60)
        print("Based on: https://github.com/LeonTodorov/SelfMAD")
        print("=" * 60)
        print("Usage:")
        print("  python morph_detect_selfmad_official.py -p checkpoint_path -in image.jpg")
        print("  python morph_detect_selfmad_official.py -p checkpoint_path --test_all")
        print("  python morph_detect_selfmad_official.py -p checkpoint_path -in image.jpg")
        print("\nArguments:")
        print("  -m MODEL_TYPE     Model type (default: swin)")
        print("                    Available: swin, efficientnet-b0, efficientnet-b4, resnet, hrnet_w18, hrnet_w32, hrnet_w44, hrnet_w64")
        print("  -p MODEL_PATH     Path to model checkpoint")
        print("  -in INPUT_PATH    Path to input image")
        print("  --test_all        Test all available images")
        print("\nExamples:")
        print("  python morph_detect_selfmad_official.py -p swin_checkpoint.tar -in siddi1.jpg")
        print("  python morph_detect_selfmad_official.py -p swin_checkpoint.tar --test_all")
        sys.exit(1)
    
    # Initialize detector
    print("🔧 Initializing official SelfMAD detector...")
    detector = SelfMADOfficialDetector(args.model_path, args.model_type)
    
    if args.test_all:
        # Test both images
        images = ["siddi1.jpg", "images.jpeg"]
        print("🧪 Testing all images with official SelfMAD...")
        print("=" * 60)
        
        for img in images:
            if os.path.exists(img):
                print(f"\n🔍 Testing: {img}")
                result = detector.detect_morphing(img)
                
                if "error" not in result:
                    print(f"Raw Logit: {result['raw_logit']:.6f}")
                    print(f"Predicted Class: {result['predicted_class']} ({result['class_name']})")
                    print(f"Model: {result['model']}")
                else:
                    print(f"Error: {result['error']}")
            else:
                print(f"❌ Image not found: {img}")
        
        print("\n" + "=" * 60)
        
    elif args.input_path:
        # Test single image
        if not os.path.exists(args.input_path):
            print(f"❌ Image not found: {args.input_path}")
            sys.exit(1)
        
        print(f"🔍 Testing image: {args.input_path}")
        print("=" * 60)
        
        result = detector.detect_morphing(args.input_path)
        
        if "error" not in result:
            print(f"🔢 Raw Logit: {result['raw_logit']:.6f}")
            print(f"📊 Predicted Class: {result['predicted_class']} ({result['class_name']})")
            print(f"🤖 Model: {result['model']}")
            
            # Direct interpretation from predicted class
            if result['predicted_class'] == 1:
                print(f"⚠️  INTERPRETATION: Model predicts MORPHED image (Class 1)")
            else:
                print(f"✅ INTERPRETATION: Model predicts GENUINE image (Class 0)")
        else:
            print(f"❌ ERROR: {result['error']}")
        
        print("=" * 60)

if __name__ == "__main__":
    main()
