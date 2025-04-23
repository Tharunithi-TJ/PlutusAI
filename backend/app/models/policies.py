from .db import BaseModel
from .. import db

class Policy(BaseModel):
    __tablename__ = 'policies'
    
    policy_number = db.Column(db.String(50), unique=True, nullable=False)
    policy_type = db.Column(db.String(50), nullable=False)  # 'auto', 'health', 'life', etc.
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=False)
    premium_amount = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(20), default='active')  # 'active', 'expired', 'cancelled'
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # Relationships
    claims = db.relationship('Claim', backref='policy', lazy=True)
    
    def __repr__(self):
        return f'<Policy {self.policy_number}>' 