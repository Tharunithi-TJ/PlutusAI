from app import create_app, db
from app.models.claims import Claim
from datetime import datetime

def init_db():
    app = create_app()
    
    with app.app_context():
        print("Dropping all tables...")
        db.drop_all()
        
        print("Creating all tables...")
        db.create_all()
        
        # Create a test claim
        test_claim = Claim(
            claim_type="Test Claim",
            description="This is a test claim",
            status="pending",
            submitted_at=datetime.utcnow(),
            files=["test_file.pdf"],
            verification_results=[{
                "filename": "test_file.pdf",
                "verification_result": {
                    "valid": True,
                    "metadata": {
                        "format": "PDF",
                        "size": [612, 792],
                        "mode": "RGB"
                    },
                    "text_analysis": {
                        "sentiment": "neutral",
                        "sentiment_score": 0.75,
                        "word_count": 100,
                        "line_count": 10
                    }
                }
            }],
            review_notes=None,
            reviewed_at=None,
            reviewed_by=None
        )
        
        try:
            db.session.add(test_claim)
            db.session.commit()
            print("Added test claim successfully")
        except Exception as e:
            print(f"Error adding test claim: {e}")
            db.session.rollback()
        
        print("Database initialized successfully!")

if __name__ == "__main__":
    init_db() 