from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_cors import CORS
import os

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()
cors = CORS()

def create_app():
    app = Flask(__name__)
    
    # Load configuration
    app.config.from_object('app.utils.config.Config')
    
    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    cors.init_app(app)
    
    # Register blueprints
    from app.routes.users import users_bp
    from app.routes.policies import policies_bp
    from app.routes.claims import claims_bp
    from app.routes.documents import documents_bp
    
    app.register_blueprint(users_bp, url_prefix='/api/users')
    app.register_blueprint(policies_bp, url_prefix='/api/policies')
    app.register_blueprint(claims_bp, url_prefix='/api/claims')
    app.register_blueprint(documents_bp, url_prefix='/api/documents')
    
    # Create tables
    with app.app_context():
        db.create_all()
    
    return app 