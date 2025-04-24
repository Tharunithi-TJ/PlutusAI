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
    user = db.relationship('User', back_populates='policies')
    claims = db.relationship('Claim', back_populates='policy', cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'policy_number': self.policy_number,
            'policy_type': self.policy_type,
            'start_date': self.start_date.isoformat(),
            'end_date': self.end_date.isoformat(),
            'premium_amount': self.premium_amount,
            'status': self.status,
            'user_id': self.user_id
        }
    
    def __repr__(self):
        return f'<Policy {self.policy_number}>' 