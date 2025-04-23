from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.utils.helpers import allowed_file, save_uploaded_file
from app.models.users import User
from ..utils.config import Config
import os

documents_bp = Blueprint('documents', __name__)

@documents_bp.route('/upload', methods=['POST'])
@jwt_required()
def upload_document():
    user_id = get_jwt_identity()
    
    if 'file' not in request.files:
        return jsonify({'message': 'No file part'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'message': 'No selected file'}), 400
    
    if file and allowed_file(file.filename, Config.ALLOWED_EXTENSIONS):
        try:
            file_path = save_uploaded_file(file, Config.UPLOAD_FOLDER)
            return jsonify({
                'message': 'File uploaded successfully',
                'file_path': file_path
            }), 201
        except Exception as e:
            return jsonify({'message': str(e)}), 500
    
    return jsonify({'message': 'File type not allowed'}), 400 