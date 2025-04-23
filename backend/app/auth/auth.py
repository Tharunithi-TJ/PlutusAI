from flask_jwt_extended import create_access_token
from app.models.users import User
from .. import db

def authenticate(username, password):
    # Try to find user by username or email
    user = User.query.filter(
        (User.username == username) | (User.email == username)
    ).first()
    
    if user and user.verify_password(password):
        return user
    return None

def generate_token(user):
    additional_claims = {
        'role': user.role,
        'user_id': user.id,
        'username': user.username
    }
    return create_access_token(identity=user.id, additional_claims=additional_claims)

def register_user(username, email, password, role, first_name, last_name, phone_number=None, address=None):
    if User.query.filter((User.username == username) | (User.email == email)).first():
        return None
    
    new_user = User(
        username=username,
        email=email,
        role=role,
        first_name=first_name,
        last_name=last_name,
        phone_number=phone_number,
        address=address
    )
    new_user.password = password
    new_user.save()
    return new_user 