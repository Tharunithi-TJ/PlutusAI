# PlutusAI/backend/seed_sample_data.py
import random
from datetime import datetime, timedelta
from faker import Faker
from sqlalchemy import inspect, text
from app import create_app, db
from app.models.users import User
from app.models.policies import Policy
from app.models.claims import Claim

# Initialize Faker with Indian locale
fake = Faker('en_IN')

# Configuration
BATCH_SIZE = 20  # Number of records to commit at once
TOTAL_USERS = 50  # 10 employees + 40 policyholders
TOTAL_POLICIES = 30
TOTAL_CLAIMS = 100
SUSPICIOUS_CLAIM_RATIO = 0.2  # 20% suspicious claims

# Indian name lists
FIRST_NAMES = [
    "Aarav", "Vihaan", "Vivaan", "Ananya", "Diya", "Advait", "Kabir", "Pari", 
    "Anaya", "Aaradhya", "Reyansh", "Sai", "Arjun", "Ishaan", "Ayaan", "Krishna",
    "Myra", "Kiara", "Aadhya", "Ira", "Shivansh", "Atharv", "Yuvaan", "Prisha",
    "Avni", "Aanya", "Rudra", "Aarush", "Ishita", "Riya", "Aryan", "Mohammed",
    "Aditya", "Sai", "Arnav", "Shanaya", "Anika", "Aarohi", "Ishani", "Saanvi",
    "Kavya", "Anvi", "Dhruv", "Shaurya", "Vedant", "Yash", "Rohan", "Aadi", "Parth", "Ansh"
]

LAST_NAMES = [
    "Patel", "Sharma", "Singh", "Kumar", "Gupta", "Verma", "Malhotra", "Reddy",
    "Joshi", "Iyer", "Choudhary", "Mehta", "Desai", "Nair", "Menon", "Pillai",
    "Bose", "Banerjee", "Mukherjee", "Chatterjee", "Rao", "Naidu", "Acharya",
    "Bhatt", "Trivedi", "Shah", "Kapoor", "Khanna", "Ahuja", "Chauhan", "Saxena",
    "Tiwari", "Mishra", "Dubey", "Pandey", "Yadav", "Jha", "Sinha", "Agrawal",
    "Goswami", "Bajpai", "Dwivedi", "Chakraborty", "Ganguly", "Ghosh", "Sengupta",
    "Dasgupta", "Dutta", "Basu", "Roy"
]

def verify_database():
    """Verify database connection and required tables exist"""
    print("\n🔍 Running pre-seed checks...")
    try:
        # Test database connection
        with db.engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        print("✅ Database connection successful")

        # Check required tables exist
        inspector = inspect(db.engine)
        required_tables = {'users', 'policies', 'claims'}
        existing_tables = set(inspector.get_table_names())
        
        missing_tables = required_tables - existing_tables
        if missing_tables:
            print(f"❌ Missing tables: {missing_tables}")
            return False
        
        print("✅ All required tables exist")
        return True

    except Exception as e:
        print(f"❌ Database verification failed: {str(e)}")
        return False

def seed_users():
    """Seed users table with Indian names"""
    print("\n👥 Seeding users...")
    users = []
    existing_usernames = set(u[0] for u in User.query.with_entities(User.username).all())
    existing_emails = set(u[0] for u in User.query.with_entities(User.email).all())
    
    for i in range(1, TOTAL_USERS + 1):
        try:
            # Keep generating until we get a unique username/email
            while True:
                first_name = random.choice(FIRST_NAMES)
                last_name = random.choice(LAST_NAMES)
                username = f"{first_name.lower()}{i}"
                email = f"{first_name.lower()}.{last_name.lower()}{i}@example.com"
                
                if username not in existing_usernames and email not in existing_emails:
                    break
            
            user = User(
                username=username,
                email=email,
                password="Test@123",  # Note: In production, use proper hashing
                role='employee' if i <= 10 else 'policyholder',
                first_name=first_name,
                last_name=last_name,
                phone_number=fake.phone_number(),
                address=fake.address(),
                is_verified=True
            )
            users.append(user)
            existing_usernames.add(username)
            existing_emails.add(email)
            
            # Commit in batches
            if i % BATCH_SIZE == 0:
                try:
                    db.session.add_all(users)
                    db.session.commit()
                    users = []
                    print(f"  - Committed batch up to user {i}")
                except Exception as e:
                    db.session.rollback()
                    print(f"  ⚠️ Batch commit failed, trying one by one")
                    # Try one by one
                    for u in users:
                        try:
                            db.session.add(u)
                            db.session.commit()
                        except Exception:
                            db.session.rollback()
                    users = []
                
        except Exception as e:
            print(f"❌ Error creating user {i}: {str(e)}")
            continue
    
    # Commit any remaining users
    if users:
        db.session.add_all(users)
        try:
            db.session.commit()
        except Exception:
            db.session.rollback()
            # Try one by one
            for u in users:
                try:
                    db.session.add(u)
                    db.session.commit()
                except Exception:
                    db.session.rollback()

def seed_policies():
    """Seed policies table"""
    print("\n📄 Seeding policies...")
    policies = []
    policyholders = User.query.filter_by(role='policyholder').all()
    existing_policy_numbers = set(p[0] for p in Policy.query.with_entities(Policy.policy_number).all())
    last_policy_num = max([int(p.replace('POL', '')) for p in existing_policy_numbers] or [1000])
    
    for i in range(1, TOTAL_POLICIES + 1):
        try:
            policy_number = f"POL{last_policy_num + i}"
            start_date = fake.date_between(start_date='-3y', end_date='-1y')
            
            policy = Policy(
                policy_number=policy_number,
                policy_type=random.choice(['auto', 'health', 'life', 'property']),
                start_date=start_date,
                end_date=start_date + timedelta(days=365*2),  # 2 year term
                premium_amount=round(random.uniform(5000, 30000), 2),
                status=random.choices(
                    ['active', 'expired', 'cancelled'],
                    weights=[0.8, 0.15, 0.05]
                )[0],
                user_id=random.choice(policyholders).id
            )
            policies.append(policy)
            
            if i % BATCH_SIZE == 0:
                try:
                    db.session.add_all(policies)
                    db.session.commit()
                    policies = []
                    print(f"  - Committed batch up to policy {i}")
                except Exception as e:
                    db.session.rollback()
                    print(f"  ⚠️ Batch commit failed, trying one by one")
                    for p in policies:
                        try:
                            db.session.add(p)
                            db.session.commit()
                        except Exception:
                            db.session.rollback()
                    policies = []
                
        except Exception as e:
            print(f"❌ Error creating policy {i}: {str(e)}")
            continue
    
    if policies:
        try:
            db.session.add_all(policies)
            db.session.commit()
        except Exception:
            db.session.rollback()
            for p in policies:
                try:
                    db.session.add(p)
                    db.session.commit()
                except Exception:
                    db.session.rollback()

def seed_claims():
    """Seed claims table with some suspicious claims"""
    print("\n💰 Seeding claims...")
    claims = []
    policies = Policy.query.all()
    employees = User.query.filter_by(role='employee').all()
    
    for i in range(1, TOTAL_CLAIMS + 1):
        try:
            policy = random.choice(policies)
            claim_date = fake.date_between(start_date=policy.start_date, end_date=min(policy.end_date, datetime.now().date()))
            is_suspicious = random.random() < SUSPICIOUS_CLAIM_RATIO
            
            claim = Claim(
                claim_type=random.choice(['accident', 'medical', 'theft', 'natural_disaster', 'fire']),
                description=fake.sentence(),
                submitted_at=datetime.combine(claim_date, datetime.min.time()),
                status=random.choices(
                    ['approved', 'pending', 'rejected'],
                    weights=[0.6, 0.2, 0.2]
                )[0],
                verification_results={"verified": not is_suspicious, "risk_score": random.uniform(0, 1)},
                files=[f"documents/claim_{i}.pdf"],
                user_id=policy.user_id,
                policy_id=policy.id,
                reviewed_by=random.choice(employees).id,
                review_notes="Looks legitimate" if not is_suspicious else "Needs investigation",
                reviewed_at=datetime.combine(claim_date, datetime.min.time()) + timedelta(days=random.randint(1, 30))
            )
            claims.append(claim)
            
            # Visual indicator for suspicious claims
            status_icon = "🔴" if is_suspicious else "🟢"
            print(f"  {status_icon} Claim #{i}: {claim.claim_type}")
            
            if i % BATCH_SIZE == 0:
                try:
                    db.session.add_all(claims)
                    db.session.commit()
                    claims = []
                except Exception as e:
                    db.session.rollback()
                    print(f"  ⚠️ Batch commit failed, trying one by one")
                    for c in claims:
                        try:
                            db.session.add(c)
                            db.session.commit()
                        except Exception:
                            db.session.rollback()
                    claims = []
                
        except Exception as e:
            print(f"❌ Error creating claim {i}: {str(e)}")
            continue
    
    if claims:
        try:
            db.session.add_all(claims)
            db.session.commit()
        except Exception:
            db.session.rollback()
            for c in claims:
                try:
                    db.session.add(c)
                    db.session.commit()
                except Exception:
                    db.session.rollback()

def seed_sample_data():
    """Main function to seed all data"""
    app = create_app()
    
    with app.app_context():
        # Verify database before seeding
        if not verify_database():
            print("❌ Seeding aborted due to database issues")
            return
        
        try:
            print("\n🌱 Starting to seed additional data...")
            
            # Get current counts
            initial_users = User.query.count()
            initial_policies = Policy.query.count()
            initial_claims = Claim.query.count()
            
            # Execute seeding in order
            seed_users()
            seed_policies()
            seed_claims()
            
            # Final verification
            print("\n🔍 Verifying seeded data...")
            final_users = User.query.count()
            final_policies = Policy.query.count()
            final_claims = Claim.query.count()
            
            print(f"New users created: {final_users - initial_users}")
            print(f"New policies created: {final_policies - initial_policies}")
            print(f"New claims created: {final_claims - initial_claims}")
            
            suspicious_count = Claim.query.filter(
                Claim.review_notes.contains("investigation"),
                Claim.submitted_at >= datetime.now() - timedelta(minutes=5)
            ).count()
            print(f"New suspicious claims: {suspicious_count}")
            
            print("\n🎉 Additional data seeding completed successfully!")
            
        except Exception as e:
            db.session.rollback()
            print(f"❌ Seeding failed: {str(e)}")
            raise

if __name__ == '__main__':
    seed_sample_data()