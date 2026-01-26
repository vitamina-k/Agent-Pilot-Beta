"""
Agent Pilot Bot - Auth Middleware
=================================
Authentication and authorization middleware.
Replace this placeholder with your complete auth.py
"""

from functools import wraps
from telegram import Update
from telegram.ext import ContextTypes

from database.supabase_client import db


def auth_middleware(func):
    """Decorator to require authenticated user."""
    @wraps(func)
    async def wrapper(update: Update, context: ContextTypes.DEFAULT_TYPE, *args, **kwargs):
        telegram_id = update.effective_user.id
        user = await db.get_user_by_telegram_id(telegram_id)

        if not user:
            await update.message.reply_text(
                "❌ No tienes cuenta. Usa /start para registrarte."
            )
            return

        # Add user to context
        context.user_data["db_user"] = user

        return await func(update, context, *args, **kwargs)

    return wrapper


def require_plan(min_plan: str):
    """Decorator to require minimum plan level."""
    plan_levels = {"free": 0, "starter": 1, "pro": 2, "enterprise": 3}

    def decorator(func):
        @wraps(func)
        async def wrapper(update: Update, context: ContextTypes.DEFAULT_TYPE, *args, **kwargs):
            user = context.user_data.get("db_user")

            if not user:
                await update.message.reply_text(
                    "❌ Error de autenticación."
                )
                return

            user_level = plan_levels.get(user["plan_actual"], 0)
            required_level = plan_levels.get(min_plan, 0)

            if user_level < required_level:
                await update.message.reply_text(
                    f"❌ Esta función requiere el plan {min_plan.title()} o superior.\n\n"
                    f"Mejora tu plan en agentpilot.es/checkout"
                )
                return

            return await func(update, context, *args, **kwargs)

        return wrapper
    return decorator


def require_credits(amount: int):
    """Decorator to require minimum credits."""
    def decorator(func):
        @wraps(func)
        async def wrapper(update: Update, context: ContextTypes.DEFAULT_TYPE, *args, **kwargs):
            user = context.user_data.get("db_user")

            if not user:
                await update.message.reply_text(
                    "❌ Error de autenticación."
                )
                return

            if user["creditos_disponibles"] < amount:
                await update.message.reply_text(
                    f"❌ Créditos insuficientes.\n"
                    f"Necesitas {amount}, tienes {user['creditos_disponibles']}.\n\n"
                    f"Compra más en agentpilot.es/creditos"
                )
                return

            return await func(update, context, *args, **kwargs)

        return wrapper
    return decorator
