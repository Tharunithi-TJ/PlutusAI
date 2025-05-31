from flask import Blueprint, request, jsonify
from app.models.claims import Claim
from app.ml_models.document_verification import DocumentVerifier
from app.ml_models.anomaly_detection import AnomalyDetector
from app import db
import os
from datetime import datetime, timedelta
import traceback
import numpy as np
from .services.graph_analysis import InsuranceFraudGraph
from app.services.rl_fraud_service import RLFraudService
from flask_jwt_extended import jwt_required

main_bp = Blueprint('main', __name__)

UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Initialize the document verifier
document_verifier = DocumentVerifier()

# Initialize the anomaly detector
anomaly_detector = AnomalyDetector()

# Initialize RL service
rl_service = RLFraudService()

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
        username = request.form.get('username', 'demouser123')

        if not files:
            return jsonify({
                "status": "error",
                "message": "No files uploaded"
            }), 400

        verification_results = []
        saved_files = []

        for file in files:
            if file:
                # Create a unique filename with username and timestamp
                timestamp = datetime.utcnow().strftime('%Y%m%d_%H%M%S')
                original_filename = file.filename
                file_extension = os.path.splitext(original_filename)[1]
                unique_filename = f"{username}_{timestamp}_{original_filename}"
                
                # Ensure upload folder exists
                if not os.path.exists(UPLOAD_FOLDER):
                    os.makedirs(UPLOAD_FOLDER)
                
                filepath = os.path.join(UPLOAD_FOLDER, unique_filename)
                file.save(filepath)
                saved_files.append({
                    'original_name': original_filename,
                    'saved_path': filepath,
                    'username': username,
                    'uploaded_at': timestamp
                })

                try:
                    result = document_verifier.verify_document(filepath)
                    verification_results.append({
                        'filename': original_filename,
                        'saved_filename': unique_filename,
                        'username': username,
                        'uploaded_at': timestamp,
                        'verification_result': result
                    })
                except Exception as e:
                    verification_results.append({
                        'filename': original_filename,
                        'saved_filename': unique_filename,
                        'username': username,
                        'uploaded_at': timestamp,
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

@main_bp.route('/graph-analysis', methods=['GET'])
def get_graph_analysis():
    try:
        fraud_graph = InsuranceFraudGraph()
        fraud_graph.build_graph_from_db()
        
        # Get both graph data and suspicious patterns
        graph_data = fraud_graph.get_graph_data()
        suspicious_patterns = fraud_graph.detect_suspicious_patterns()
        
        return jsonify({
            'success': True,
            'graph_data': graph_data,
            'suspicious_patterns': suspicious_patterns
        })
    except Exception as e:
        print(f"Error in graph analysis: {str(e)}")
        print(traceback.format_exc())
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@main_bp.route('/claims/<int:claim_id>/analyze', methods=['GET'])
@jwt_required()
def analyze_claim(claim_id):
    try:
        claim = Claim.query.get_or_404(claim_id)
        
        # Prepare claim data with normalized features
        claim_data = {
            **claim.to_dict(),
            'amount_normalized': min(claim.amount / 10000, 1.0) if hasattr(claim, 'amount') else 0.5,
            'policy_age_normalized': 0.5,  # Calculate based on policy start date
            'claim_frequency_normalized': 0.5,  # Calculate based on user's claim history
            'time_since_last_normalized': 0.5,  # Calculate based on last claim date
            'location_risk_score': 0.5,  # Calculate based on location data
            'third_party_risk_score': 0.5,  # Calculate based on third party history
            'document_anomaly_score': 0.5,  # Calculate based on document verification
            'beneficiary_match_score': 0.5,  # Calculate based on beneficiary data
            'premium_ratio_normalized': 0.5,  # Calculate based on premium/claim ratio
            'agent_risk_score': 0.5  # Calculate based on agent history
        }
        
        # Get both traditional and RL analysis
        traditional_analysis = anomaly_detector.analyze_claim(
            claim_data,
            claim.verification_results or []
        )
        rl_analysis = rl_service.analyze_claim(claim_data)
        
        return jsonify({
            'success': True,
            'data': {
                'traditional_analysis': traditional_analysis,
                'rl_analysis': rl_analysis,
                'combined_decision': (
                    rl_analysis['decision'] 
                    if rl_analysis['confidence'] > 0.7 
                    else traditional_analysis['verdict']
                )
            }
        })
    except Exception as e:
        print(f"Error in analyze_claim: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@main_bp.route('/claims/<int:claim_id>/feedback', methods=['POST'])
@jwt_required()
def submit_feedback(claim_id):
    try:
        data = request.get_json()
        was_correct = data.get('was_correct', False)
        
        rl_service.log_feedback(claim_id, was_correct)
        
        return jsonify({
            'success': True,
            'message': 'Feedback recorded successfully'
        })
    except Exception as e:
        print(f"Error in submit_feedback: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@main_bp.route('/api/rl-metrics', methods=['GET'])
def get_rl_metrics():
    try:
        # Get buffer size if available (different implementations may store it differently)
        buffer_size = 0
        if hasattr(rl_service.agent, 'replay_buffer'):
            buffer_size = len(rl_service.agent.replay_buffer)
        elif hasattr(rl_service.agent, 'rollout_buffer'):
            buffer_size = len(rl_service.agent.rollout_buffer)
        
        # Get training loss safely
        training_loss = 0.0
        if hasattr(rl_service.agent, 'logger'):
            training_loss = rl_service.agent.logger.name_to_value.get('train/loss', 0.0)
        
        return jsonify({
            'success': True,
            'replay_buffer_size': buffer_size,
            'last_training_loss': float(training_loss),  # Ensure it's serializable
            'adaptation_score': float(calculate_adaptation_score())
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@main_bp.route('/api/rl-train', methods=['POST'])
def train_rl_model():
    try:
        rl_service.agent.train(total_timesteps=5000)
        rl_service.agent.model.save("rl_fraud_model")
        return jsonify({
            'success': True,
            'message': 'Model training completed successfully'
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@main_bp.route('/api/rl-simulate', methods=['POST'])
def simulate_rl_model():
    try:
        # Get some recent claims for simulation
        claims = Claim.query.order_by(Claim.submitted_at.desc()).limit(10).all()
        
        results = []
        for claim in claims:
            claim_data = {
                **claim.to_dict(),
                'amount_normalized': min(claim.amount / 10000, 1.0) if hasattr(claim, 'amount') else 0.5,
                'policy_age_normalized': 0.5,
                'claim_frequency_normalized': 0.5,
                'time_since_last_normalized': 0.5,
                'location_risk_score': 0.5,
                'third_party_risk_score': 0.5,
                'document_anomaly_score': 0.5,
                'beneficiary_match_score': 0.5,
                'premium_ratio_normalized': 0.5,
                'agent_risk_score': 0.5
            }
            
            # Get both traditional and RL analysis
            traditional_analysis = anomaly_detector.analyze_claim(
                claim_data,
                claim.verification_results or []
            )
            rl_analysis = rl_service.analyze_claim(claim_data)
            
            results.append({
                'claim_id': claim.id,
                'traditional_decision': traditional_analysis.get('verdict', 'unknown'),
                'rl_decision': rl_analysis['decision'],
                'confidence': rl_analysis['confidence'],
                'final_decision': (
                    rl_analysis['decision'] 
                    if rl_analysis['confidence'] > 0.7 
                    else traditional_analysis.get('verdict', 'unknown')
                )
            })
        
        return jsonify({
            'success': True,
            'results': results
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

def calculate_adaptation_score():
    """Calculate how well the model is adapting to new patterns"""
    try:
        # This is a simplified version - you might want to implement a more sophisticated scoring system
        buffer_size = len(rl_service.agent.model.replay_buffer)
        loss = rl_service.agent.model.logger.name_to_value.get('train/loss', 0.0)
        
        # Higher buffer size and lower loss indicate better adaptation
        adaptation_score = (buffer_size / 1000) * (1 - min(loss, 1.0))
        return min(max(adaptation_score, 0.0), 1.0)
    except:
        return 0.0

@main_bp.route('/api/rl-simulation', methods=['GET'])
def get_rl_simulation():
    try:
        # Get some recent claims for simulation
        claims = Claim.query.order_by(Claim.submitted_at.desc()).limit(10).all()
        
        results = []
        for claim in claims:
            # Convert claim to dictionary and ensure all values are JSON-serializable
            claim_dict = claim.to_dict()
            
            # Prepare normalized features with proper type conversion
            claim_data = {
                'amount_normalized': float(min(claim.amount / 10000, 1.0)) if hasattr(claim, 'amount') else 0.5,
                'policy_age_normalized': 0.5,
                'claim_frequency_normalized': 0.5,
                'time_since_last_normalized': 0.5,
                'location_risk_score': 0.5,
                'third_party_risk_score': 0.5,
                'document_anomaly_score': 0.5,
                'beneficiary_match_score': 0.5,
                'premium_ratio_normalized': 0.5,
                'agent_risk_score': 0.5
            }
            
            # Get both traditional and RL analysis
            traditional_analysis = anomaly_detector.analyze_claim(
                claim_data,
                claim.verification_results or []
            )
            
            # Convert any numpy arrays in the observation to lists
            observation = rl_service._claim_to_observation(claim_data)
            if isinstance(observation, np.ndarray):
                observation = observation.tolist()
                
            rl_analysis = rl_service.analyze_claim(claim_data)
            
            # Ensure all values are JSON-serializable
            results.append({
                'claim_id': int(claim.id),
                'traditional_decision': str(traditional_analysis.get('verdict', 'unknown')),
                'rl_decision': str(rl_analysis['decision']),
                'confidence': float(rl_analysis['confidence']),
                'final_decision': str(
                    rl_analysis['decision'] 
                    if rl_analysis['confidence'] > 0.7 
                    else traditional_analysis.get('verdict', 'unknown')
                ),
                'description': str(rl_analysis.get('description', ''))
            })
        
        return jsonify({
            'success': True,
            'results': results
        })
    except Exception as e:
        print(f"Error in RL simulation: {str(e)}")
        print(traceback.format_exc())
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500