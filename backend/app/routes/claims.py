from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.claims import Claim
from app.models.policies import Policy
from app.models.users import User
from .. import db
from datetime import datetime

claims_bp = Blueprint('claims', __name__)

@claims_bp.route('/', methods=['GET'])
@jwt_required()
def get_claims():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'message': 'User not found'}), 404
    
    claims = Claim.query.filter_by(user_id=user_id).all()
    return jsonify([{
        'id': claim.id,
        'claim_number': claim.claim_number,
        'claim_date': claim.claim_date.isoformat(),
        'amount': claim.amount,
        'description': claim.description,
        'status': claim.status,
        'policy_id': claim.policy_id
    } for claim in claims])

@claims_bp.route('/', methods=['POST'])
@jwt_required()
def create_claim():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    try:
        claim = Claim(
            claim_number=data['claim_number'],
            claim_date=datetime.strptime(data['claim_date'], '%Y-%m-%d').date(),
            amount=data['amount'],
            description=data['description'],
            policy_id=data['policy_id'],
            user_id=user_id
        )
        claim.save()
        
        return jsonify({
            'message': 'Claim submitted successfully',
            'claim': {
                'id': claim.id,
                'claim_number': claim.claim_number,
                'claim_date': claim.claim_date.isoformat(),
                'amount': claim.amount,
                'description': claim.description,
                'status': claim.status,
                'policy_id': claim.policy_id
            }
        }), 201
    except Exception as e:
        return jsonify({'message': str(e)}), 400 