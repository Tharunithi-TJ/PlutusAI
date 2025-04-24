import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
import joblib
import os

MODEL_PATH = 'anomaly_detection_model.joblib'
SCALER_PATH = 'anomaly_scaler.joblib'

class AnomalyDetector:
    def __init__(self):
        self.model = None
        self.scaler = None
        self.load_models()
        
    def load_models(self):
        """Load pre-trained models or initialize new ones"""
        if os.path.exists(MODEL_PATH) and os.path.exists(SCALER_PATH):
            self.model = joblib.load(MODEL_PATH)
            self.scaler = joblib.load(SCALER_PATH)
        else:
            self.model = IsolationForest(contamination=0.05, random_state=42)
            self.scaler = StandardScaler()
    
    def save_models(self):
        """Save trained models to disk"""
        joblib.dump(self.model, MODEL_PATH)
        joblib.dump(self.scaler, SCALER_PATH)
    
    def train(self, claims_data):
        """
        Train the anomaly detection model
        claims_data: List of dictionaries containing claim features
        """
        df = pd.DataFrame(claims_data)
        
        # Feature engineering
        features = self._extract_features(df)
        
        # Scale features
        scaled_features = self.scaler.fit_transform(features)
        
        # Train model
        self.model.fit(scaled_features)
        self.save_models()
    
    def detect_anomalies(self, claims):
        """
        Detect anomalies in new claims
        claims: List of dictionaries containing claim features
        Returns: List of anomaly scores (the lower, the more anomalous)
        """
        if not self.model or not self.scaler:
            raise ValueError("Model not trained yet")
        
        df = pd.DataFrame(claims)
        features = self._extract_features(df)
        scaled_features = self.scaler.transform(features)
        return self.model.decision_function(scaled_features).tolist()
    
    def _extract_features(self, df):
        """Extract relevant features for anomaly detection"""
        # Convert dates to numerical features
        df['claim_date'] = pd.to_datetime(df['claim_date'])
        df['days_since_policy_start'] = (df['claim_date'] - pd.to_datetime(df['policy_start_date'])).dt.days
        
        # Select features
        features = df[[
            'amount',
            'days_since_policy_start',
            'claim_count_past_year',
            'avg_claim_amount'
        ]].fillna(0)
        
        return features 