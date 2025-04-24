import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
import joblib
import os

MODEL_PATH = 'pattern_detection_model.joblib'

class PatternDetector:
    def __init__(self):
        self.model = None
        self.load_model()
    
    def load_model(self):
        """Load pre-trained model or initialize new one"""
        if os.path.exists(MODEL_PATH):
            self.model = joblib.load(MODEL_PATH)
        else:
            self.model = RandomForestClassifier(
                n_estimators=100,
                class_weight='balanced',
                random_state=42
            )
    
    def save_model(self):
        """Save trained model to disk"""
        joblib.dump(self.model, MODEL_PATH)
    
    def train(self, claims_data, labels):
        """
        Train the pattern detection model
        claims_data: List of dictionaries containing claim features
        labels: List of labels (0=legitimate, 1=fraudulent)
        """
        df = pd.DataFrame(claims_data)
        features = self._extract_features(df)
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            features, labels, test_size=0.2, random_state=42
        )
        
        # Train model
        self.model.fit(X_train, y_train)
        
        # Evaluate
        y_pred = self.model.predict(X_test)
        report = classification_report(y_test, y_pred, output_dict=True)
        
        self.save_model()
        return report
    
    def predict(self, claims):
        """
        Predict fraud probability for new claims
        claims: List of dictionaries containing claim features
        Returns: List of probabilities (0-1)
        """
        if not self.model:
            raise ValueError("Model not trained yet")
        
        df = pd.DataFrame(claims)
        features = self._extract_features(df)
        return self.model.predict_proba(features)[:, 1].tolist()
    
    def _extract_features(self, df):
        """Extract relevant features for pattern detection"""
        # Convert dates to numerical features
        df['claim_date'] = pd.to_datetime(df['claim_date'])
        df['days_since_policy_start'] = (df['claim_date'] - pd.to_datetime(df['policy_start_date'])).dt.days
        df['claim_weekday'] = df['claim_date'].dt.weekday
        
        # Create temporal features
        df['time_since_last_claim'] = df.groupby('user_id')['claim_date'].diff().dt.days.fillna(0)
        
        # Select features
        features = df[[
            'amount',
            'days_since_policy_start',
            'claim_weekday',
            'time_since_last_claim',
            'claim_count_past_year',
            'avg_claim_amount'
        ]].fillna(0)
        
        return features 