from transformers import pipeline
import pytesseract
from .utils import validate_file_type, extract_image_metadata, calculate_ela
import os
import numpy as np
from PIL import Image

class DocumentVerifier:
    def __init__(self):
        # Initialize models
        self.nlp_model = pipeline(
            "text-classification", 
            model="distilbert-base-uncased-finetuned-sst-2-english"
        )
        self.expected_image_types = ['image/jpeg', 'image/png', 'application/pdf']
    
    def verify_document(self, file_path):
        """Main document verification method"""
        try:
            # Validate file type
            if not validate_file_type(file_path, self.expected_image_types):
                return {'valid': False, 'reason': 'Invalid file type'}
            
            # Extract metadata
            metadata = extract_image_metadata(file_path)
            
            # Calculate ELA for image forensics
            ela_results = calculate_ela(file_path)
            
            # OCR text extraction
            text = self.extract_text(file_path)
            
            # Text analysis
            text_analysis = self.analyze_text(text)
            
            return {
                'valid': True,
                'metadata': metadata,
                'ela_results': ela_results,
                'text_analysis': text_analysis,
                'extracted_text': text[:500] + '...' if text else None
            }
        except Exception as e:
            return {'valid': False, 'reason': str(e)}
    
    def extract_text(self, file_path):
        """Extract text from document using OCR"""
        try:
            return pytesseract.image_to_string(Image.open(file_path))
        except:
            return ""
    
    def analyze_text(self, text):
        """Analyze extracted text for anomalies"""
        if not text:
            return {'sentiment': 'neutral', 'anomaly_score': 0.0}
        
        # Sentiment analysis
        sentiment = self.nlp_model(text[:512])[0]  # Limit to model max length
        
        # Simple anomaly detection (can be enhanced)
        word_count = len(text.split())
        line_count = len(text.split('\n'))
        avg_word_length = sum(len(word) for word in text.split()) / word_count if word_count > 0 else 0
        
        return {
            'sentiment': sentiment['label'],
            'sentiment_score': sentiment['score'],
            'word_count': word_count,
            'line_count': line_count,
            'avg_word_length': avg_word_length
        } 