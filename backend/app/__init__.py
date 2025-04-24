from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import os

# Initialize SQLAlchemy
db = SQLAlchemy()

def create_app():
    app = Flask(__name__)
    CORS(app)
    
    # Ensure the instance folder exists
    os.makedirs(os.path.join(app.root_path, 'instance'), exist_ok=True)
    
    # Database configuration
    db_path = os.path.join(app.root_path, 'instance', 'app.db')
    app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_path}'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Initialize extensions
    db.init_app(app)
    
    with app.app_context():
        # Import models
        from app.models.claims import Claim
        
        # Create all tables
        db.create_all()
        
        # Import and register blueprints
        from app.routes import main_bp
        app.register_blueprint(main_bp)
    
    return app 