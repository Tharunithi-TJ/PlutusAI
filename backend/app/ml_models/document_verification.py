from transformers import pipeline
import pytesseract
from .utils import validate_file_type, extract_image_metadata, calculate_ela
import os
from PIL import Image
import numpy as np

class DocumentVerifier:
    def __init__(self):
        # Initialize models
        try:
            self.nlp_model = pipeline(
                "text-classification", 
                model="distilbert-base-uncased-finetuned-sst-2-english"
            )
        except Exception as e:
            print(f"Warning: NLP model initialization failed: {str(e)}")
            self.nlp_model = None
            
        self.expected_image_types = [
            'image/jpeg', 
            'image/png', 
            'image/jpg', 
            'application/pdf',
            'image/tiff'
        ]
    
    def verify_document(self, file_path):
        """Main document verification method"""
        try:
            # Basic file validation
            if not os.path.exists(file_path):
                return {'valid': False, 'reason': 'File not found'}
                
            # File type validation
            if not validate_file_type(file_path, self.expected_image_types):
                return {'valid': False, 'reason': 'Invalid file type'}
            
            # Extract metadata
            metadata = extract_image_metadata(file_path)
            
            # Extract text
            text = self.extract_text(file_path)
            
            # Analyze text content
            text_analysis = self.analyze_text(text)
            
            # Calculate image forensics if it's an image
            try:
                ela_results = calculate_ela(file_path)
            except Exception:
                ela_results = None

            # Calculate document complexity score
            complexity_score = self.calculate_complexity_score(text, metadata)
            
            return {
                'valid': True,
                'metadata': metadata,
                'ela_results': ela_results,
                'text_analysis': text_analysis,
                'complexity_score': complexity_score,
                'extracted_text': text[:500] + '...' if text else None
            }
        except Exception as e:
            return {'valid': False, 'reason': str(e)}
    
    def extract_text(self, file_path):
        """Extract text from document using OCR"""
        try:
            return pytesseract.image_to_string(Image.open(file_path))
        except Exception as e:
            print(f"OCR Error: {str(e)}")
            return ""
    
    def analyze_text(self, text):
        """Analyze extracted text for anomalies"""
        if not text:
            return {
                'sentiment': 'neutral',
                'sentiment_score': 0.5,
                'word_count': 0,
                'line_count': 0,
                'avg_word_length': 0,
                'unique_words': 0
            }
        
        try:
            # Basic text statistics
            words = text.split()
            lines = text.split('\n')
            word_count = len(words)
            line_count = len(lines)
            avg_word_length = sum(len(word) for word in words) / word_count if word_count > 0 else 0
            unique_words = len(set(words))
            
            # Sentiment analysis if model is available
            if self.nlp_model and text.strip():
                sentiment = self.nlp_model(text[:512])[0]
                sentiment_label = sentiment['label']
                sentiment_score = sentiment['score']
            else:
                sentiment_label = 'neutral'
                sentiment_score = 0.5
            
            return {
                'sentiment': sentiment_label,
                'sentiment_score': sentiment_score,
                'word_count': word_count,
                'line_count': line_count,
                'avg_word_length': avg_word_length,
                'unique_words': unique_words
            }
        except Exception as e:
            print(f"Text Analysis Error: {str(e)}")
            return {
                'sentiment': 'neutral',
                'sentiment_score': 0.5,
                'word_count': 0,
                'line_count': 0,
                'avg_word_length': 0,
                'unique_words': 0
            }

    def calculate_complexity_score(self, text, metadata):
        """Calculate a document complexity score"""
        try:
            # Text-based factors
            words = text.split() if text else []
            unique_words = len(set(words))
            word_count = len(words)
            
            # Calculate text complexity
            text_score = 0
            if word_count > 0:
                avg_word_length = sum(len(word) for word in words) / word_count
                unique_ratio = unique_words / word_count
                text_score = (avg_word_length * 0.3 + unique_ratio * 0.7) * 10
            
            # Image factors
            image_score = 0
            if metadata and 'width' in metadata and 'height' in metadata:
                resolution = metadata['width'] * metadata['height']
                image_score = min(resolution / 1000000, 10)  # Normalize to 0-10
            
            # Combine scores
            final_score = (text_score + image_score) / 2
            return round(final_score, 2)
            
        except Exception as e:
            print(f"Error calculating complexity score: {str(e)}")
            return 0 