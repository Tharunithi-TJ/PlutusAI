from .db import BaseModel
from .. import db

class Claim(BaseModel):
    __tablename__ = 'claims'
    
    claim_number = db.Column(db.String(50), unique=True, nullable=False)
    claim_date = db.Column(db.Date, nullable=False)
    amount = db.Column(db.Float, nullable=False)
    description = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(20), default='pending')  # 'pending', 'approved', 'rejected', 'investigating'
    policy_id = db.Column(db.Integer, db.ForeignKey('policies.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    def __repr__(self):
        return f'<Claim {self.claim_number}>' 