from app import create_app, db
from app.models.users import User

app = create_app()

with app.app_context():
    # Drop all tables
    db.drop_all()
    
    # Create all tables with new schema
    db.create_all()
    
    print("Database created successfully!") 