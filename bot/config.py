"""
Agent Pilot Bot - Centralized Configuration
============================================
All configuration variables and environment loading.
Replace this placeholder with your complete config.py
"""

import os
from typing import Optional
from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # ---- Telegram ----
    telegram_bot_token: str = Field(..., env="TELEGRAM_BOT_TOKEN")
    telethon_api_id: Optional[int] = Field(None, env="TELETHON_API_ID")
    telethon_api_hash: Optional[str] = Field(None, env="TELETHON_API_HASH")

    # ---- Supabase ----
    supabase_url: str = Field(..., env="SUPABASE_URL")
    supabase_key: str = Field(..., env="SUPABASE_KEY")
    supabase_service_key: Optional[str] = Field(None, env="SUPABASE_SERVICE_KEY")

    # ---- AI Providers ----
    deepseek_api_key: Optional[str] = Field(None, env="DEEPSEEK_API_KEY")
    perplexity_api_key: Optional[str] = Field(None, env="PERPLEXITY_API_KEY")
    openai_api_key: Optional[str] = Field(None, env="OPENAI_API_KEY")
    anthropic_api_key: Optional[str] = Field(None, env="ANTHROPIC_API_KEY")

    # ---- Stripe ----
    stripe_secret_key: Optional[str] = Field(None, env="STRIPE_SECRET_KEY")
    stripe_webhook_secret: Optional[str] = Field(None, env="STRIPE_WEBHOOK_SECRET")

    # ---- App Config ----
    log_level: str = Field("INFO", env="LOG_LEVEL")
    environment: str = Field("development", env="ENVIRONMENT")

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


# Global settings instance
settings = Settings()


# Credit costs per operation
CREDIT_COSTS = {
    "fast": 1,           # Single AI, quick response
    "consensus": 5,      # Multiple AIs, consensus
    "deep_analysis": 10, # Full analysis with all providers
    "social_post": 2,    # Generate social media post
    "image_gen": 5,      # Generate image
}

# Plan limits
PLAN_LIMITS = {
    "free": {
        "credits_monthly": 50,
        "consensus_enabled": False,
        "byoa_enabled": False,
    },
    "starter": {
        "credits_monthly": 500,
        "consensus_enabled": True,
        "byoa_enabled": True,
    },
    "pro": {
        "credits_monthly": 2000,
        "consensus_enabled": True,
        "byoa_enabled": True,
    },
    "enterprise": {
        "credits_monthly": 10000,
        "consensus_enabled": True,
        "byoa_enabled": True,
    },
}
