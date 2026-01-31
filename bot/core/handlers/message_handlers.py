"""
Agent Pilot Bot - Message Handlers
==================================
Handlers for text messages (non-commands).
"""

from telegram import Update
from telegram.ext import ContextTypes

from database.supabase_client import db
from ai_swarm.orchestrator import CouncilOfWiseMen, SwarmMode, UserContext
from config import settings, CREDIT_COSTS

# Create the Council with system credentials (singleton)
_council = None

def get_council() -> CouncilOfWiseMen:
    """Get or create the Council of Wise Men singleton."""
    global _council
    if _council is None:
        system_credentials = {}
        if settings.deepseek_api_key:
            system_credentials["deepseek"] = settings.deepseek_api_key
        if settings.perplexity_api_key:
            system_credentials["perplexity"] = settings.perplexity_api_key
        if settings.openai_api_key:
            system_credentials["openai"] = settings.openai_api_key
        if settings.anthropic_api_key:
            system_credentials["anthropic"] = settings.anthropic_api_key

        _council = CouncilOfWiseMen(
            system_credentials=system_credentials,
            cost_config=CREDIT_COSTS
        )
    return _council


def build_user_context(user: dict, api_keys: dict = None) -> UserContext:
    """Build UserContext from database user record."""
    return UserContext(
        user_id=user["id"],
        telegram_id=user.get("telegram_user_id"),
        bio_entrenamiento=user.get("bio_entrenamiento") or {},
        memoria=[],  # TODO: Load from memoria_usuario table
        preferencias={},
        plan=user.get("plan_actual", "free"),
        creditos_disponibles=user.get("creditos_disponibles", 0),
        api_keys=api_keys or {}
    )


async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle incoming text messages."""
    telegram_id = update.effective_user.id
    text = update.message.text

    # Get user
    user = await db.get_user_by_telegram_id(telegram_id)
    if not user:
        await update.message.reply_text(
            "No tienes cuenta. Usa /start para registrarte."
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
    mode_str = context.user_data.get("analysis_mode", "fast")
    mode = SwarmMode.CONSENSUS if mode_str == "consensus" else SwarmMode.FAST
    cost = CREDIT_COSTS["consensus"] if mode == SwarmMode.CONSENSUS else CREDIT_COSTS["fast"]

    # Check credits
    if user["creditos_disponibles"] < cost:
        await update.message.reply_text(
            f"Creditos insuficientes.\n"
            f"Necesitas {cost} creditos, tienes {user['creditos_disponibles']}.\n\n"
            f"Compra mas en tu dashboard web."
        )
        return

    # Send "typing" action
    await update.message.chat.send_action("typing")

    # Process with AI
    try:
        council = get_council()
        user_context = build_user_context(user)

        # Call the orchestrator
        result = await council.process(
            prompt=text,
            user_context=user_context,
            mode=mode
        )

        if not result.success:
            raise Exception(result.error or "Error desconocido")

        # Deduct credits after successful processing
        await db.deduct_credits(
            user["id"],
            cost,
            f"Analisis {mode.value}: {text[:50]}..."
        )

        # Format response
        mode_name = "Consenso" if mode == SwarmMode.CONSENSUS else "Fast"
        response = f"*Analisis ({mode_name})*\n\n"
        response += result.final_response
        response += f"\n\n_Creditos restantes: {user['creditos_disponibles'] - cost}_"

        await update.message.reply_text(response, parse_mode="Markdown")

    except Exception as e:
        await update.message.reply_text(
            f"Error al procesar: {str(e)}\n"
            f"No se han descontado creditos."
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
