import gymnasium as gym
from gymnasium import spaces
import numpy as np
from stable_baselines3 import PPO
from stable_baselines3.common.vec_env import DummyVecEnv
from stable_baselines3.common.buffers import ReplayBuffer

class FraudEnv(gym.Env):
    def __init__(self):
        super(FraudEnv, self).__init__()
        
        # Define action space (0: approve, 1: investigate, 2: reject)
        self.action_space = spaces.Discrete(3)
        
        # Define observation space (10 normalized features)
        self.observation_space = spaces.Box(
            low=0, high=1, shape=(10,), dtype=np.float32
        )
        
        self.current_claim = None
        
    def reset(self, seed=None):
        super().reset(seed=seed)
        # Initialize with default values
        self.current_claim = np.zeros(10, dtype=np.float32)
        return self.current_claim, {}
        
    def step(self, action):
        # In a real environment, this would interact with the actual system
        # For now, we'll use a simple reward function
        reward = 0.0
        done = True
        info = {}
        
        return self.current_claim, reward, done, False, info

class FraudRLAgent:
    def __init__(self):
        self.env = DummyVecEnv([lambda: FraudEnv()])
        self.model = PPO(
            "MlpPolicy",
            self.env,
            verbose=1,
            learning_rate=0.0003,
            n_steps=2048,
            batch_size=64,
            n_epochs=10,
            gamma=0.99,
            gae_lambda=0.95,
            clip_range=0.2,
            ent_coef=0.01
        )
        
        # Initialize replay buffer
        self.model.replay_buffer = ReplayBuffer(
            buffer_size=10000,
            observation_space=self.env.observation_space,
            action_space=self.env.action_space,
            device='auto'
        )
        
    def train(self, total_timesteps=20000):
        self.model.learn(total_timesteps=total_timesteps)
        
    def predict(self, observation):
        # Ensure observation is numpy array with correct dtype
        if not isinstance(observation, np.ndarray):
            observation = np.array(observation, dtype=np.float32)
        return self.model.predict(observation)