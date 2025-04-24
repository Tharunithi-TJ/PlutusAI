from flask import Blueprint, request, jsonify
from app.models.claims import Claim
from app.ml_models.document_verification import DocumentVerifier
from app.ml_models.anomaly_detection import AnomalyDetector
from app import db
import os
from datetime import datetime, timedelta
import traceback
import numpy as np

main_bp = Blueprint('main', __name__)

UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Initialize the document verifier
document_verifier = DocumentVerifier()

# Initialize the anomaly detector
anomaly_detector = AnomalyDetector()

@main_bp.route("/ping")
def ping():
    return jsonify({
        "Response": "Pong!"
    })

@main_bp.route('/submit-claim', methods=['POST'])
def submit_claim():
    try:
        claim_type = request.form.get('claimType')
        description = request.form.get('description')
        files = request.files.getlist('files')

        if not files:
            return jsonify({
                "status": "error",
                "message": "No files uploaded"
            }), 400

        verification_results = []
        saved_files = []

        for file in files:
            if file:
                filename = file.filename
                filepath = os.path.join(UPLOAD_FOLDER, filename)
                file.save(filepath)
                saved_files.append(filepath)

                try:
                    result = document_verifier.verify_document(filepath)
                    verification_results.append({
                        'filename': filename,
                        'verification_result': result
                    })
                except Exception as e:
                    verification_results.append({
                        'filename': filename,
                        'verification_result': {
                            'valid': False,
                            'reason': str(e)
                        }
                    })

        # Create new claim record
        new_claim = Claim(
            claim_type=claim_type,
            description=description,
            files=saved_files,
            verification_results=verification_results,
            status='pending'
        )

        # Save to database
        db.session.add(new_claim)
        db.session.commit()

        return jsonify({
            "status": "success",
            "message": "Claim submitted successfully",
            "data": new_claim.to_dict()
        })

    except Exception as e:
        print("Error in submit_claim:")
        print(traceback.format_exc())
        return jsonify({
            "status": "error",
            "message": f"Server error: {str(e)}",
            "traceback": traceback.format_exc()
        }), 500

@main_bp.route('/claims', methods=['GET'])
def get_claims():
    try:
        # Get optional filter parameters
        status = request.args.get('status')
        claim_type = request.args.get('claim_type')

        print(f"Fetching claims with filters - status: {status}, claim_type: {claim_type}")  # Debug print

        # Start with base query
        query = Claim.query

        # Apply filters if provided
        if status:
            query = query.filter_by(status=status)
        if claim_type:
            query = query.filter_by(claim_type=claim_type)

        # Execute query and get all claims
        claims = query.order_by(Claim.submitted_at.desc()).all()
        print(f"Found {len(claims)} claims")  # Debug print

        # Convert claims to dict
        claims_data = [claim.to_dict() for claim in claims]
        print("Successfully converted claims to dict")  # Debug print

        return jsonify({
            "status": "success",
            "data": {
                "claims": claims_data
            }
        })

    except Exception as e:
        print("Error in get_claims:")
        print(traceback.format_exc())  # Print full traceback
        return jsonify({
            "status": "error",
            "message": f"Server error: {str(e)}",
            "traceback": traceback.format_exc()
        }), 500

@main_bp.route('/update-claim-status', methods=['POST'])
def update_claim_status():
    try:
        data = request.json
        claim_id = data.get('claimId')
        new_status = data.get('status')
        review_notes = data.get('notes', '')

        if not claim_id or not new_status:
            return jsonify({
                "status": "error",
                "message": "Claim ID and status are required"
            }), 400

        claim = Claim.query.get(claim_id)
        if not claim:
            return jsonify({
                "status": "error",
                "message": "Claim not found"
            }), 404

        claim.status = new_status
        claim.review_notes = review_notes
        claim.reviewed_at = datetime.utcnow()
        # You can add employee_id here when you have authentication
        # claim.reviewed_by = current_user.id

        db.session.commit()

        return jsonify({
            "status": "success",
            "message": f"Claim status updated to {new_status}",
            "data": claim.to_dict()
        })

    except Exception as e:
        print(f"Error updating claim status: {str(e)}")
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

@main_bp.route('/check-claim-anomalies', methods=['POST'])
def check_claim_anomalies():
    try:
        data = request.json
        claim_id = data.get('claimId')

        if not claim_id:
            return jsonify({
                "status": "error",
                "message": "Claim ID is required"
            }), 400

        claim = Claim.query.get(claim_id)
        if not claim:
            return jsonify({
                "status": "error",
                "message": "Claim not found"
            }), 404

        # Prepare claim data
        claim_data = {
            'submitted_at': claim.submitted_at,
            'amount': 1000,  # You should replace with actual claim amount
            'document_count': len(claim.verification_results) if claim.verification_results else 0
        }

        # Analyze claim
        analysis_results = anomaly_detector.analyze_claim(
            claim_data,
            claim.verification_results or []
        )

        return jsonify({
            "status": "success",
            "data": {
                "risk_score": analysis_results["risk_score"],
                "anomaly_details": {
                    "risk_level": analysis_results["risk_level"],
                    "document_anomalies": analysis_results["document_analysis"],
                    "risk_factors": analysis_results.get("risk_factors", [])
                }
            }
        })

    except Exception as e:
        print(f"Error in check_claim_anomalies: {str(e)}")
        return jsonify({
            "status": "error",
            "message": f"Error analyzing claim: {str(e)}"
        }), 500

def calculate_text_score(verification_results):
    """Calculate a normalized score for text analysis"""
    if not verification_results:
        return 0.5
    
    scores = []
    for doc in verification_results:
        if 'verification_result' in doc and 'text_analysis' in doc['verification_result']:
            ta = doc['verification_result']['text_analysis']
            if 'sentiment_score' in ta:
                scores.append(ta['sentiment_score'])
    
    return np.mean(scores) if scores else 0.5

def calculate_image_score(verification_results):
    """Calculate a normalized score for image analysis"""
    if not verification_results:
        return 0.5
    
    scores = []
    for doc in verification_results:
        if 'verification_result' in doc and 'ela_results' in doc['verification_result']:
            ela = doc['verification_result']['ela_results']
            if 'ela_mean' in ela:
                # Normalize ELA score (0-100 range) to 0-1
                scores.append(1 - (min(ela['ela_mean'], 100) / 100))
    
    return np.mean(scores) if scores else 0.5

def calculate_risk_score(anomaly_results, doc_analysis):
    """Calculate overall risk score"""
    # Base score from anomaly detection (0-100)
    base_score = anomaly_results['anomaly_score'] * 100
    
    # Add points for risk factors
    risk_factor_score = len(anomaly_results['risk_factors']) * 10
    
    # Add points for document anomalies
    doc_score = sum(
        10 if anomaly['severity'] == 'high' else 5 if anomaly['severity'] == 'medium' else 2
        for doc in doc_analysis
        for anomaly in doc['anomalies']
    )
    
    # Combine scores (weighted average)
    final_score = (0.5 * base_score + 0.3 * risk_factor_score + 0.2 * doc_score)
    
    # Ensure score is between 0 and 100
    return min(100, max(0, final_score))

def analyze_documents(verification_results):
    if not verification_results:
        return []

    document_anomalies = []
    for doc in verification_results:
        anomalies = []
        vr = doc.get('verification_result', {})
        
        # Check image manipulation
        if vr.get('ela_results'):
            ela_mean = vr['ela_results'].get('ela_mean', 0)
            if ela_mean > 50:  # Threshold for suspicious manipulation
                anomalies.append({
                    'type': 'image_manipulation',
                    'severity': 'high',
                    'details': f'Suspicious image manipulation detected (ELA score: {ela_mean})'
                })

        # Check text analysis
        if vr.get('text_analysis'):
            ta = vr['text_analysis']
            
            # Check for unusually low word count
            if ta.get('word_count', 0) < 10:
                anomalies.append({
                    'type': 'low_content',
                    'severity': 'medium',
                    'details': 'Document contains very little text'
                })

            # Check sentiment
            if ta.get('sentiment') == 'negative' and ta.get('sentiment_score', 0) > 0.8:
                anomalies.append({
                    'type': 'negative_sentiment',
                    'severity': 'low',
                    'details': 'Strong negative sentiment detected in document'
                })

        document_anomalies.append({
            'filename': doc['filename'],
            'anomalies': anomalies
        })

    return document_anomalies 