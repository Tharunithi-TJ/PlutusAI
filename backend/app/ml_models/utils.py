import os
import magic
from PIL import Image
import cv2
import numpy as np
from sklearn.preprocessing import StandardScaler

def validate_file_type(file_path, expected_types):
    """Validate file type using magic numbers"""
    mime = magic.Magic(mime=True)
    file_type = mime.from_file(file_path)
    return file_type in expected_types

def extract_image_metadata(image_path):
    """Extract basic metadata from images"""
    with Image.open(image_path) as img:
        return {
            'format': img.format,
            'size': img.size,
            'mode': img.mode,
            'width': img.width,
            'height': img.height
        }

def calculate_ela(image_path, quality=90):
    """Calculate Error Level Analysis for image forensics"""
    temp_path = 'temp.jpg'
    original = cv2.imread(image_path)
    cv2.imwrite(temp_path, original, [cv2.IMWRITE_JPEG_QUALITY, quality])
    temp_image = cv2.imread(temp_path)
    os.remove(temp_path)
    
    if original is None or temp_image is None:
        return None
    
    ela = np.abs(original.astype(np.float32) - temp_image.astype(np.float32))
    ela_mean = np.mean(ela)
    ela_std = np.std(ela)
    
    return {
        'ela_mean': float(ela_mean),
        'ela_std': float(ela_std)
    }

def preprocess_text(text):
    """Basic text preprocessing"""
    # Implement your text cleaning pipeline
    return text.lower().strip() 