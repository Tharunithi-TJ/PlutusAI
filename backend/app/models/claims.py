from datetime import datetime
from app import db

class Claim(db.Model):
    __tablename__ = 'claims'

    id = db.Column(db.Integer, primary_key=True)
    claim_type = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    submitted_at = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(50), default='pending')
    
    # Store the verification results and files as JSON
    verification_results = db.Column(db.JSON, nullable=True)
    files = db.Column(db.JSON, nullable=True)  # Will store array of file paths
    
    # Foreign keys
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    policy_id = db.Column(db.Integer, db.ForeignKey('policies.id'), nullable=True)
    reviewed_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    
    # New fields for review
    review_notes = db.Column(db.Text, nullable=True)
    reviewed_at = db.Column(db.DateTime, nullable=True)
    reviewed_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)  # Employee ID who reviewed

    # Relationships
    claimant = db.relationship('User', foreign_keys=[user_id], back_populates='submitted_claims')
    reviewer = db.relationship('User', foreign_keys=[reviewed_by], back_populates='reviewed_claims')
    policy = db.relationship('Policy', back_populates='claims')

    def to_dict(self):
        return {
            'id': self.id,
            'claim_type': self.claim_type,
            'description': self.description,
            'submitted_at': self.submitted_at.isoformat() if self.submitted_at else None,
            'status': self.status,
            'verification_results': self.verification_results or [],
            'files': self.files or [],
            'review_notes': self.review_notes,
            'reviewed_at': self.reviewed_at.isoformat() if self.reviewed_at else None,
            'reviewed_by': self.reviewed_by,
            'user_id': self.user_id,
            'policy_id': self.policy_id
        } 