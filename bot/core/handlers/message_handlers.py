"""
Agent Pilot Bot - Message Handlers
==================================
Handlers for text messages (non-commands).
Replace this placeholder with your complete handlers.
"""

from telegram import Update
from telegram.ext import ContextTypes

from database.supabase_client import db
from ai_swarm.orchestrator import CouncilOfWiseMen
from config import CREDIT_COSTS


async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle incoming text messages."""
    telegram_id = update.effective_user.id
    text = update.message.text

    # Get user
    user = await db.get_user_by_telegram_id(telegram_id)
    if not user:
        await update.message.reply_text(
            "❌ No tienes cuenta. Usa /start para registrarte."
        )
        return

    # Check if awaiting analysis
    if context.user_data.get("awaiting_analysis"):
        await handle_analysis_request(update, context, user, text)
        return

    # Default: treat as quick analysis (FAST mode)
    await handle_quick_analysis(update, context, user, text)


async def handle_analysis_request(
    update: Update,
    context: ContextTypes.DEFAULT_TYPE,
    user: dict,
    text: str
) -> None:
    """Process an analysis request."""
    mode = context.user_data.get("analysis_mode", "fast")
    cost = CREDIT_COSTS["fast"] if mode == "fast" else CREDIT_COSTS["consensus"]

    # Check credits
    if user["creditos_disponibles"] < cost:
        await update.message.reply_text(
            f"❌ Créditos insuficientes.\n"
            f"Necesitas {cost} créditos, tienes {user['creditos_disponibles']}.\n\n"
            f"Compra más en agentpilot.es/creditos"
        )
        return

    # Send "typing" action
    await update.message.chat.send_action("typing")

    # Deduct credits
    await db.deduct_credits(
        user["id"],
        cost,
        f"Análisis {mode}: {text[:50]}..."
    )

    # Process with AI
    try:
        # Initialize Council (placeholder - replace with your orchestrator)
        council = CouncilOfWiseMen(user.get("bio_entrenamiento", {}))

        if mode == "consensus":
            result = await council.analyze_with_consensus(text)
        else:
            result = await council.quick_analyze(text)

        # Format response
        response = f"📊 *Análisis {'(Consenso)' if mode == 'consensus' else '(Fast)'}*\n\n"
        response += result
        response += f"\n\n💰 Créditos restantes: {user['creditos_disponibles'] - cost}"

        await update.message.reply_text(response, parse_mode="Markdown")

    except Exception as e:
        # Refund on error
        await db.add_credits(user["id"], cost, "Reembolso por error")
        await update.message.reply_text(
            f"❌ Error al procesar: {str(e)}\n"
            f"Se han reembolsado tus créditos."
        )

    # Clear state
    context.user_data["awaiting_analysis"] = False
    context.user_data["analysis_mode"] = None


async def handle_quick_analysis(
    update: Update,
    context: ContextTypes.DEFAULT_TYPE,
    user: dict,
    text: str
) -> None:
    """Handle a quick analysis (direct message without mode selection)."""
    # Default to FAST mode for direct messages
    context.user_data["awaiting_analysis"] = True
    context.user_data["analysis_mode"] = "fast"

    await handle_analysis_request(update, context, user, text)
