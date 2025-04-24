import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
import joblib
import os
from datetime import datetime, timedelta

MODEL_PATH = 'anomaly_detection_model.joblib'
SCALER_PATH = 'anomaly_scaler.joblib'

class AnomalyDetector:
    def __init__(self):
        pass

    def analyze_claim(self, claim_data, verification_results):
        """
        Analyze a claim for potential anomalies
        Returns a comprehensive analysis with risk scores and factors
        """
        try:
            # Initialize scores and risk factors
            risk_factors = []
            document_scores = []
            
            # Analyze documents
            doc_analysis = self._analyze_documents(verification_results)
            
            # Calculate document-based risk score
            doc_risk_score = self._calculate_document_risk(doc_analysis)
            
            # Calculate claim-based risk score
            claim_risk_score = self._analyze_claim_patterns(claim_data)
            
            # Combine scores
            total_risk_score = (doc_risk_score + claim_risk_score) / 2
            
            return {
                "risk_score": round(total_risk_score, 2),
                "document_analysis": doc_analysis,
                "risk_level": self._get_risk_level(total_risk_score),
                "risk_factors": risk_factors
            }
        except Exception as e:
            print(f"Error in analyze_claim: {str(e)}")
            return self._get_default_response()

    def _analyze_documents(self, verification_results):
        """Analyze verification results for each document"""
        if not verification_results:
            return []

        document_analysis = []
        for doc in verification_results:
            anomalies = []
            vr = doc.get('verification_result', {})
            
            # Check image analysis results
            if vr.get('ela_results'):
                ela_score = self._analyze_ela_results(vr['ela_results'])
                if ela_score > 0:
                    anomalies.append({
                        'type': 'image_manipulation',
                        'severity': 'high' if ela_score > 75 else 'medium',
                        'details': f'Potential image manipulation detected (Score: {ela_score})'
                    })

            # Check text analysis results
            if vr.get('text_analysis'):
                text_anomalies = self._analyze_text_results(vr['text_analysis'])
                anomalies.extend(text_anomalies)

            document_analysis.append({
                'filename': doc.get('filename', 'Unknown file'),
                'anomalies': anomalies
            })

        return document_analysis

    def _analyze_ela_results(self, ela_results):
        """Analyze Error Level Analysis results"""
        try:
            ela_mean = ela_results.get('ela_mean', 0)
            ela_std = ela_results.get('ela_std', 0)
            
            # Higher scores indicate more manipulation
            score = min(100, (ela_mean * 0.7 + ela_std * 0.3))
            return round(score, 2)
        except:
            return 0

    def _analyze_text_results(self, text_analysis):
        """Analyze text analysis results"""
        anomalies = []
        
        try:
            # Check word count
            word_count = text_analysis.get('word_count', 0)
            if word_count < 10:
                anomalies.append({
                    'type': 'low_content',
                    'severity': 'medium',
                    'details': f'Very low word count ({word_count} words)'
                })

            # Check sentiment
            sentiment = text_analysis.get('sentiment', 'neutral')
            sentiment_score = text_analysis.get('sentiment_score', 0.5)
            if sentiment == 'negative' and sentiment_score > 0.8:
                anomalies.append({
                    'type': 'negative_sentiment',
                    'severity': 'low',
                    'details': 'Strong negative sentiment detected'
                })

        except Exception as e:
            print(f"Error in text analysis: {str(e)}")

        return anomalies

    def _calculate_document_risk(self, doc_analysis):
        """Calculate risk score based on document analysis"""
        total_score = 0
        for doc in doc_analysis:
            for anomaly in doc['anomalies']:
                if anomaly['severity'] == 'high':
                    total_score += 30
                elif anomaly['severity'] == 'medium':
                    total_score += 15
                else:
                    total_score += 5
        
        # Normalize score to 0-100 range
        return min(100, total_score)

    def _analyze_claim_patterns(self, claim_data):
        """Analyze claim patterns for suspicious activity"""
        try:
            # Start with a base score
            risk_score = 50
            
            # Adjust based on available data
            if claim_data.get('amount'):
                if claim_data['amount'] > 5000:
                    risk_score += 20
                elif claim_data['amount'] > 2000:
                    risk_score += 10

            if claim_data.get('document_count', 0) < 2:
                risk_score += 15

            return min(100, max(0, risk_score))
        except:
            return 50

    def _get_risk_level(self, risk_score):
        """Convert risk score to risk level"""
        if risk_score >= 75:
            return {'level': 'High Risk', 'color': '#dc3545'}
        elif risk_score >= 50:
            return {'level': 'Medium Risk', 'color': '#ffc107'}
        else:
            return {'level': 'Low Risk', 'color': '#28a745'}

    def _get_default_response(self):
        """Return a default response in case of errors"""
        return {
            "risk_score": 50,
            "document_analysis": [],
            "risk_level": {'level': 'Medium Risk', 'color': '#ffc107'},
            "risk_factors": []
        }

    def initialize_model(self):
        """Initialize model with some basic training data"""
        # Create synthetic training data
        normal_claims = self._generate_normal_claims(100)
        anomalous_claims = self._generate_anomalous_claims(10)
        training_data = normal_claims + anomalous_claims
        
        # Train the model
        self.train(training_data)
    
    def _generate_normal_claims(self, n_samples):
        """Generate synthetic normal claims for initial training"""
        claims = []
        base_date = datetime.now() - timedelta(days=365)
        
        for _ in range(n_samples):
            claim_date = base_date + timedelta(days=np.random.randint(0, 365))
            policy_start = claim_date - timedelta(days=np.random.randint(30, 730))
            
            claim = {
                'claim_date': claim_date,
                'policy_start_date': policy_start,
                'amount': np.random.normal(1000, 200),  # Normal distribution around 1000
                'claim_count_past_year': np.random.randint(0, 3),
                'avg_claim_amount': np.random.normal(1000, 100),
                'document_count': np.random.randint(1, 5),
                'text_score': np.random.normal(0.7, 0.1),  # Normal text similarity score
                'image_score': np.random.normal(0.8, 0.1)  # Normal image analysis score
            }
            claims.append(claim)
        
        return claims
    
    def _generate_anomalous_claims(self, n_samples):
        """Generate synthetic anomalous claims for initial training"""
        claims = []
        base_date = datetime.now() - timedelta(days=365)
        
        for _ in range(n_samples):
            claim_date = base_date + timedelta(days=np.random.randint(0, 365))
            policy_start = claim_date - timedelta(days=np.random.randint(1, 30))  # Very new policies
            
            claim = {
                'claim_date': claim_date,
                'policy_start_date': policy_start,
                'amount': np.random.normal(5000, 1000),  # Higher amounts
                'claim_count_past_year': np.random.randint(5, 10),  # Many claims
                'avg_claim_amount': np.random.normal(5000, 500),
                'document_count': np.random.randint(0, 2),  # Few documents
                'text_score': np.random.normal(0.3, 0.1),  # Suspicious text score
                'image_score': np.random.normal(0.4, 0.1)  # Suspicious image score
            }
            claims.append(claim)
        
        return claims

    def train(self, claims_data):
        """Train the anomaly detection model"""
        if not claims_data:
            claims_data = self._generate_normal_claims(100)
        
        df = pd.DataFrame(claims_data)
        
        # Feature engineering
        features = self._extract_features(df)
        
        # Initialize and fit scaler
        self.scaler = StandardScaler()
        scaled_features = self.scaler.fit_transform(features)
        
        # Initialize and fit model
        self.model = IsolationForest(contamination=0.1, random_state=42)
        self.model.fit(scaled_features)
    
    def detect_anomalies(self, claim_data):
        """
        Detect anomalies in new claims
        claim_data: List of dictionaries containing claim features
        Returns: Dictionary with anomaly scores and analysis
        """
        try:
            # Ensure model is initialized
            if self.model is None or self.scaler is None:
                self.initialize_model()

            # Convert input data to DataFrame
            df = pd.DataFrame(claim_data)
            
            # Extract and scale features
            features = self._extract_features(df)
            scaled_features = self.scaler.transform(features)
            
            # Get anomaly scores
            anomaly_scores = self.model.decision_function(scaled_features)
            predictions = self.model.predict(scaled_features)
            
            # Normalize scores to 0-1 range
            normalized_scores = (anomaly_scores - anomaly_scores.min()) / (anomaly_scores.max() - anomaly_scores.min())
            
            results = []
            for i, score in enumerate(normalized_scores):
                result = {
                    'anomaly_score': float(score),
                    'is_anomaly': predictions[i] == -1,
                    'risk_factors': self._analyze_risk_factors(claim_data[i], score)
                }
                results.append(result)
            
            return results[0] if len(results) == 1 else results

        except Exception as e:
            print(f"Error in anomaly detection: {str(e)}")
            return {
                'anomaly_score': 0.5,
                'is_anomaly': False,
                'risk_factors': [],
                'error': str(e)
            }
    
    def _extract_features(self, df):
        """Extract relevant features for anomaly detection"""
        features = pd.DataFrame()
        
        # Handle datetime columns
        if 'claim_date' in df.columns and 'policy_start_date' in df.columns:
            df['claim_date'] = pd.to_datetime(df['claim_date'])
            df['policy_start_date'] = pd.to_datetime(df['policy_start_date'])
            features['days_since_policy_start'] = (df['claim_date'] - df['policy_start_date']).dt.days
        
        # Add other numerical features
        numerical_columns = ['amount', 'claim_count_past_year', 'avg_claim_amount', 
                           'document_count', 'text_score', 'image_score']
        
        for col in numerical_columns:
            if col in df.columns:
                features[col] = df[col]
        
        # Fill missing values
        features = features.fillna(0)
        
        return features
    
    def _analyze_risk_factors(self, claim_data, anomaly_score):
        """Analyze specific risk factors contributing to the anomaly score"""
        risk_factors = []
        
        # Check claim amount
        if claim_data.get('amount', 0) > 3000:
            risk_factors.append({
                'factor': 'High Claim Amount',
                'severity': 'high',
                'details': f"Claim amount (${claim_data['amount']}) is significantly above average"
            })
        
        # Check claim frequency
        if claim_data.get('claim_count_past_year', 0) > 3:
            risk_factors.append({
                'factor': 'High Claim Frequency',
                'severity': 'medium',
                'details': f"Multiple claims ({claim_data['claim_count_past_year']}) in the past year"
            })
        
        # Check policy age
        days_since_policy = (claim_data.get('claim_date') - claim_data.get('policy_start_date')).days
        if days_since_policy < 30:
            risk_factors.append({
                'factor': 'New Policy',
                'severity': 'high',
                'details': f"Claim filed only {days_since_policy} days after policy start"
            })
        
        return risk_factors 