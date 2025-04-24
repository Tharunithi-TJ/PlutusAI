from .db import BaseModel
from .. import db
from werkzeug.security import generate_password_hash, check_password_hash

class User(BaseModel):
    __tablename__ = 'users'
    
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128))
    role = db.Column(db.String(20), nullable=False)  # 'policyholder', 'employee', 'admin'
    is_verified = db.Column(db.Boolean, default=False)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    phone_number = db.Column(db.String(20))
    address = db.Column(db.Text)
    
    # Relationships
    policies = db.relationship('Policy', back_populates='user', cascade='all, delete-orphan')
    submitted_claims = db.relationship('Claim', back_populates='claimant', foreign_keys='Claim.user_id')
    reviewed_claims = db.relationship('Claim', back_populates='reviewer', foreign_keys='Claim.reviewed_by')
    
    @property
    def password(self):
        raise AttributeError('password is not a readable attribute')
    
    @password.setter
    def password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def verify_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'role': self.role,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'phone_number': self.phone_number,
            'address': self.address,
            'is_verified': self.is_verified
        }
    
    def __repr__(self):
        return f'<User {self.username}>' 