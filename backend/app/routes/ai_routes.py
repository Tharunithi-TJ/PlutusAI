from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services.ai_service import AIService
from app.models.claims import Claim
from app.models.users import User
from .. import db

ai_bp = Blueprint('ai', __name__)
ai_service = AIService()

@ai_bp.route('/train', methods=['POST'])
@jwt_required()
def train_models():
    """Endpoint to train ML models"""
    current_user = User.query.get(get_jwt_identity())
    if current_user.role != 'admin':
        return jsonify({'message': 'Admin access required'}), 403
    
    try:
        result = ai_service.train_models()
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@ai_bp.route('/claims/<int:claim_id>/analyze', methods=['GET'])
@jwt_required()
def analyze_claim(claim_id):
    """Analyze a specific claim for fraud"""
    claim = Claim.query.get(claim_id)
    if not claim:
        return jsonify({'message': 'Claim not found'}), 404
    
    current_user = User.query.get(get_jwt_identity())
    if current_user.role not in ['admin', 'employee'] and current_user.id != claim.user_id:
        return jsonify({'message': 'Unauthorized access'}), 403
    
    try:
        analysis = ai_service.analyze_claim(claim_id)
        return jsonify(analysis), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@ai_bp.route('/documents/verify', methods=['POST'])
@jwt_required()
def verify_document():
    """Verify uploaded document"""
    if 'file' not in request.files:
        return jsonify({'message': 'No file part'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'message': 'No selected file'}), 400
    
    try:
        # Save temporary file
        import tempfile
        with tempfile.NamedTemporaryFile(delete=False) as tmp:
            file.save(tmp.name)
            verification = ai_service.verify_document(tmp.name)
        
        # Clean up
        import os
        os.unlink(tmp.name)
        
        return jsonify(verification), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500 