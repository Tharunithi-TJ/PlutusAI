import os
import mimetypes
from PIL import Image
import cv2
import numpy as np
from sklearn.preprocessing import StandardScaler

def validate_file_type(file_path, expected_types):
    """Validate file type using multiple methods"""
    try:
        # First try with python-magic-bin
        import magic
        mime = magic.from_file(file_path, mime=True)
    except (ImportError, AttributeError):
        # Fallback to mimetypes if magic fails
        mime, _ = mimetypes.guess_type(file_path)
        if mime is None:
            # If mimetypes can't determine, try to validate using PIL for images
            try:
                with Image.open(file_path) as img:
                    mime = f'image/{img.format.lower()}'
            except Exception:
                return False
    
    print(f"Detected MIME type: {mime}")  # Debug print
    return mime in expected_types

def extract_image_metadata(image_path):
    """Extract basic metadata from images"""
    try:
        with Image.open(image_path) as img:
            return {
                'format': img.format,
                'size': img.size,
                'mode': img.mode,
                'width': img.width,
                'height': img.height
            }
    except Exception as e:
        print(f"Error extracting metadata: {str(e)}")  # Debug print
        return {
            'format': 'unknown',
            'size': [0, 0],
            'mode': 'unknown',
            'width': 0,
            'height': 0
        }

def calculate_ela(image_path, quality=90):
    """Calculate Error Level Analysis for image forensics"""
    try:
        temp_path = 'temp.jpg'
        original = cv2.imread(image_path)
        if original is None:
            return {'ela_mean': 0, 'ela_std': 0}
            
        cv2.imwrite(temp_path, original, [cv2.IMWRITE_JPEG_QUALITY, quality])
        temp_image = cv2.imread(temp_path)
        
        if os.path.exists(temp_path):
            os.remove(temp_path)
        
        if original is None or temp_image is None:
            return {'ela_mean': 0, 'ela_std': 0}
        
        ela = np.abs(original.astype(np.float32) - temp_image.astype(np.float32))
        ela_mean = float(np.mean(ela))
        ela_std = float(np.std(ela))
        
        return {
            'ela_mean': ela_mean,
            'ela_std': ela_std
        }
    except Exception as e:
        print(f"Error calculating ELA: {str(e)}")  # Debug print
        return {'ela_mean': 0, 'ela_std': 0}

def preprocess_text(text):
    """Basic text preprocessing"""
    if text is None:
        return ""
    return text.lower().strip() 