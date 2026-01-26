"""
Agent Pilot Bot - Main Entry Point
===================================
Telegram bot with AI Swarm (Council of Wise Men) and SaaS features.
Replace this placeholder with your complete main.py
"""

import logging
import asyncio
from telegram import Update
from telegram.ext import (
    Application,
    CommandHandler,
    MessageHandler,
    CallbackQueryHandler,
    filters,
)

from config import settings
from core.handlers.command_handlers import (
    start_command,
    menu_command,
    saldo_command,
    analizar_command,
    perfil_command,
)
from core.handlers.callback_handlers import handle_callback
from core.handlers.message_handlers import handle_message
from core.middleware.auth import auth_middleware

# Configure logging
logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    level=getattr(logging, settings.log_level),
)
logger = logging.getLogger(__name__)


async def error_handler(update: Update, context) -> None:
    """Handle errors in the bot."""
    logger.error(f"Exception while handling an update: {context.error}")


def main() -> None:
    """Start the bot."""
    logger.info("Starting Agent Pilot Bot...")

    # Create application
    application = (
        Application.builder()
        .token(settings.telegram_bot_token)
        .build()
    )

    # Add handlers
    application.add_handler(CommandHandler("start", start_command))
    application.add_handler(CommandHandler("menu", menu_command))
    application.add_handler(CommandHandler("saldo", saldo_command))
    application.add_handler(CommandHandler("analizar", analizar_command))
    application.add_handler(CommandHandler("perfil", perfil_command))

    # Callback queries (inline buttons)
    application.add_handler(CallbackQueryHandler(handle_callback))

    # Message handler (non-commands)
    application.add_handler(
        MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message)
    )

    # Error handler
    application.add_error_handler(error_handler)

    # Run the bot
    logger.info("Bot is running. Press Ctrl+C to stop.")
    application.run_polling(allowed_updates=Update.ALL_TYPES)


if __name__ == "__main__":
    main()
