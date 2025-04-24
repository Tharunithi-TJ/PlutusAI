import numpy as np
from app.ml_models.rl_fraud import FraudRLAgent
from app.models.claims import Claim
from app import db

class RLFraudService:
    def __init__(self):
        self.agent = FraudRLAgent()
        self._load_or_train()

    def _load_or_train(self):
        try:
            self.agent.model.load("rl_fraud_model")
            print("Loaded pre-trained RL fraud model")
        except:
            print("Training new RL fraud model...")
            self.agent.train(total_timesteps=20000)
            self.agent.model.save("rl_fraud_model")

    def analyze_claim(self, claim_data):
        # Convert claim data to observation
        observation = self._claim_to_observation(claim_data)
        
        # Ensure observation is a numpy array before prediction
        if not isinstance(observation, np.ndarray):
            observation = np.array(observation, dtype=np.float32)
        
        # Get prediction - extract the first element if it's an array
        action, _states = self.agent.predict(observation)
        if isinstance(action, np.ndarray):
            action = action.item()  # Convert single-element array to scalar
        
        # Convert action to decision
        decision = self._action_to_decision(int(action))  # Ensure action is int
        
        # Calculate confidence
        confidence = self._calculate_confidence(int(action))
        
        # Get description
        description = self._get_action_description(int(action))
        
        # Return serializable results
        return {
            'decision': str(decision),
            'confidence': float(confidence),
            'description': str(description),
            'features': {
                k: float(v) for k, v in claim_data.items() 
                if isinstance(v, (int, float, np.integer, np.floating))
            }
        }

    def _process_observation(self, claim_data):
        """Alias for _claim_to_observation for backward compatibility"""
        return self._claim_to_observation(claim_data)

    def _claim_to_observation(self, claim: dict) -> np.ndarray:
        """Convert claim data to RL observation vector"""
        return np.array([
            claim.get('amount_normalized', 0.5),
            claim.get('policy_age_normalized', 0.5),
            claim.get('claim_frequency_normalized', 0.5),
            claim.get('time_since_last_normalized', 0.5),
            claim.get('location_risk_score', 0.5),
            claim.get('third_party_risk_score', 0.5),
            claim.get('document_anomaly_score', 0.5),
            claim.get('beneficiary_match_score', 0.5),
            claim.get('premium_ratio_normalized', 0.5),
            claim.get('agent_risk_score', 0.5)
        ], dtype=np.float32)

    def _calculate_confidence(self, action: int) -> float:
        """Calculate confidence score based on action"""
        action = int(action)  # Ensure action is integer
        return {
            0: 0.9,  # High confidence for approve
            1: 0.6,  # Medium confidence for investigate
            2: 0.8   # High confidence for reject
        }.get(action, 0.5)

    def _action_to_decision(self, action: int) -> str:
        """Convert action index to decision string"""
        action = int(action)  # Ensure action is integer
        return {
            0: 'approve', 
            1: 'investigate', 
            2: 'reject'
        }.get(action, 'investigate')

    def _get_action_description(self, action: int) -> str:
        """Get human-readable description for action"""
        action = int(action)  # Ensure action is integer
        descriptions = {
            0: "Low risk - Recommend approval",
            1: "Moderate risk - Requires investigation",
            2: "High risk - Recommend rejection"
        }
        return descriptions.get(action, "Needs manual review")

    def log_feedback(self, claim_id: int, was_correct: bool):
        """Update model based on human feedback"""
        claim = Claim.query.get(claim_id)
        if claim:
            observation = self._claim_to_observation(claim.to_dict())
            reward = 1.0 if was_correct else -1.0
            
            # Get the original action that was taken
            action, _ = self.agent.predict(observation)
            
            # Add to replay buffer if available
            if hasattr(self.agent.model, 'replay_buffer'):
                self.agent.model.replay_buffer.add(
                    obs=observation,
                    next_obs=observation,
                    action=action,
                    reward=reward,
                    done=False,
                    infos={}
                )
            
            # Periodically update model
            if len(self.agent.model.replay_buffer) % 100 == 0:
                self.agent.model.train(gradient_steps=10)