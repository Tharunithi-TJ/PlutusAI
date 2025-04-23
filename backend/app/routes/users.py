from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.users import User
from app.auth.auth import authenticate, generate_token, register_user
from .. import db

users_bp = Blueprint('users', __name__)

@users_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    user = authenticate(username, password)
    if not user:
        return jsonify({'message': 'Invalid credentials'}), 401
    
    token = generate_token(user)
    return jsonify({
        'access_token': token,
        'user': user.to_dict()
    })

@users_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    role = data.get('role', 'policyholder')
    first_name = data.get('first_name')
    last_name = data.get('last_name')
    phone_number = data.get('phone_number')
    address = data.get('address')
    
    if not all([username, email, password, first_name, last_name]):
        return jsonify({'message': 'Missing required fields'}), 400
    
    user = register_user(
        username=username,
        email=email,
        password=password,
        role=role,
        first_name=first_name,
        last_name=last_name,
        phone_number=phone_number,
        address=address
    )
    
    if not user:
        return jsonify({'message': 'Username or email already exists'}), 400
    
    return jsonify({
        'message': 'User registered successfully',
        'user': user.to_dict()
    }), 201

@users_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'message': 'User not found'}), 404
    
    return jsonify({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'role': user.role
    }) 