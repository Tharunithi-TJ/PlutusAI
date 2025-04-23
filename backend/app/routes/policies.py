from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.policies import Policy
from app.models.users import User
from .. import db
from datetime import datetime

policies_bp = Blueprint('policies', __name__)

@policies_bp.route('/', methods=['GET'])
@jwt_required()
def get_policies():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'message': 'User not found'}), 404
    
    policies = Policy.query.filter_by(user_id=user_id).all()
    return jsonify([{
        'id': policy.id,
        'policy_number': policy.policy_number,
        'policy_type': policy.policy_type,
        'start_date': policy.start_date.isoformat(),
        'end_date': policy.end_date.isoformat(),
        'premium_amount': policy.premium_amount,
        'status': policy.status
    } for policy in policies])

@policies_bp.route('/', methods=['POST'])
@jwt_required()
def create_policy():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    try:
        policy = Policy(
            policy_number=data['policy_number'],
            policy_type=data['policy_type'],
            start_date=datetime.strptime(data['start_date'], '%Y-%m-%d').date(),
            end_date=datetime.strptime(data['end_date'], '%Y-%m-%d').date(),
            premium_amount=data['premium_amount'],
            user_id=user_id
        )
        policy.save()
        
        return jsonify({
            'message': 'Policy created successfully',
            'policy': {
                'id': policy.id,
                'policy_number': policy.policy_number,
                'policy_type': policy.policy_type,
                'start_date': policy.start_date.isoformat(),
                'end_date': policy.end_date.isoformat(),
                'premium_amount': policy.premium_amount,
                'status': policy.status
            }
        }), 201
    except Exception as e:
        return jsonify({'message': str(e)}), 400 