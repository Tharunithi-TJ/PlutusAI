from app.ml_models import DocumentVerifier, AnomalyDetector, PatternDetector
import pandas as pd

class AIService:
    def __init__(self):
        self.document_verifier = DocumentVerifier()
        self.anomaly_detector = AnomalyDetector()
        self.pattern_detector = PatternDetector()
        # Lazy import models
        from app.models.claims import Claim
        from app.models.policies import Policy
        self.Claim = Claim
        self.Policy = Policy
    
    def verify_document(self, file_path):
        """Verify uploaded document for potential fraud"""
        return self.document_verifier.verify_document(file_path)
    
    def analyze_claim(self, claim_id):
        """Analyze a claim for potential fraud"""
        claim = self.Claim.query.get(claim_id)
        if not claim:
            return None
        
        # Get related data
        policy = self.Policy.query.get(claim.policy_id)
        user_claims = self.Claim.query.filter_by(user_id=claim.user_id).all()
        
        # Prepare data for models
        claim_data = self._prepare_claim_data(claim, policy, user_claims)
        
        # Get anomaly score
        anomaly_score = self.anomaly_detector.detect_anomalies([claim_data])[0]
        
        # Get fraud probability
        fraud_probability = self.pattern_detector.predict([claim_data])[0]
        
        return {
            'claim_id': claim.id,
            'anomaly_score': anomaly_score,
            'fraud_probability': fraud_probability,
            'is_high_risk': fraud_probability > 0.7 or anomaly_score < -0.5
        }
    
    def train_models(self):
        """Train ML models using historical data"""
        claims = self.Claim.query.all()
        claim_data = []
        
        for claim in claims:
            policy = self.Policy.query.get(claim.policy_id)
            user_claims = self.Claim.query.filter_by(user_id=claim.user_id).all()
            claim_data.append(self._prepare_claim_data(claim, policy, user_claims))
        
        # Train anomaly detector (unsupervised)
        self.anomaly_detector.train(claim_data)
        
        # For pattern detector, we need labeled data (simulated here)
        # In production, you would use actual historical fraud labels
        labels = self._simulate_labels(claim_data)
        report = self.pattern_detector.train(claim_data, labels)
        
        return {
            'anomaly_detector': 'training_complete',
            'pattern_detector': report
        }
    
    def _prepare_claim_data(self, claim, policy, user_claims):
        """Prepare claim data for ML models"""
        # Calculate user claim statistics
        user_claim_count = len(user_claims)
        avg_claim_amount = sum(c.amount for c in user_claims) / user_claim_count if user_claim_count > 0 else 0
        
        return {
            'claim_id': claim.id,
            'amount': claim.amount,
            'claim_date': claim.claim_date.isoformat(),
            'policy_start_date': policy.start_date.isoformat(),
            'user_id': claim.user_id,
            'claim_count_past_year': user_claim_count,
            'avg_claim_amount': avg_claim_amount
        }
    
    def _simulate_labels(self, claim_data):
        """Simulate fraud labels for training (replace with real data in production)"""
        import random
        return [1 if random.random() < 0.05 else 0 for _ in claim_data] 