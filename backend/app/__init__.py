from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
import os
from datetime import timedelta

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
    
    # JWT configuration
    app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'your-secret-key')  # Change this in production
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)
    app.config['JWT_TOKEN_LOCATION'] = ['headers']
    app.config['JWT_HEADER_NAME'] = 'Authorization'
    app.config['JWT_HEADER_TYPE'] = 'Bearer'
    
    # Initialize extensions
    db.init_app(app)
    jwt = JWTManager(app)
    
    with app.app_context():
        # Import all models
        from app.models.claims import Claim
        from app.models.policies import Policy
        from app.models.users import User
        
        # Create all tables
        db.create_all()
        
        # Import and register blueprints
        from app.routes import main_bp
        app.register_blueprint(main_bp)
        
        # Initialize RL training scheduler
        from app.tasks.rl_training import init_scheduler
        init_scheduler()
    
    return app 