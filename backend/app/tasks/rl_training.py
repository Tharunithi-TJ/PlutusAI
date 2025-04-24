from apscheduler.schedulers.background import BackgroundScheduler
from app.services.rl_fraud_service import RLFraudService

def train_rl_model():
    try:
        rl_service = RLFraudService()
        rl_service.agent.train(total_timesteps=5000)
        rl_service.agent.model.save("rl_fraud_model")
        print("RL model training completed successfully")
    except Exception as e:
        print(f"Error in RL model training: {str(e)}")

def init_scheduler():
    scheduler = BackgroundScheduler()
    scheduler.add_job(train_rl_model, 'interval', weeks=1)
    scheduler.start()
    print("RL training scheduler started") 