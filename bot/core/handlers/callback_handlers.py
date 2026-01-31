"""
Agent Pilot Bot - Callback Query Handlers
=========================================
Handlers for inline button callbacks.
Replace this placeholder with your complete handlers.
"""

from telegram import Update
from telegram.ext import ContextTypes

from database.supabase_client import db


async def handle_callback(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Route callback queries to appropriate handlers."""
    query = update.callback_query
    await query.answer()

    data = query.data

    handlers = {
        "analizar": handle_analizar,
        "saldo": handle_saldo,
        "perfil": handle_perfil,
        "vincular": handle_vincular,
        "modo_fast": handle_modo_fast,
        "modo_consenso": handle_modo_consenso,
        "crear_post": handle_crear_post,
        "historial": handle_historial,
        "ajustes": handle_ajustes,
    }

    handler = handlers.get(data)
    if handler:
        await handler(update, context)
    else:
        await query.edit_message_text("⚠️ Opción no reconocida.")


async def handle_analizar(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle 'Analizar' button press."""
    from .command_handlers import analizar_command
    # Simulate command call
    update.message = update.callback_query.message
    await analizar_command(update, context)


async def handle_saldo(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle 'Saldo' button press."""
    query = update.callback_query
    telegram_id = update.effective_user.id

    user = await db.get_user_by_telegram_id(telegram_id)
    if not user:
        await query.edit_message_text("❌ Error al obtener tu saldo.")
        return

    credits = user["creditos_disponibles"]
    plan = user["plan_actual"]

    text = (
        f"💰 *Tu Saldo*\n\n"
        f"Créditos: *{credits}*\n"
        f"Plan: *{plan.title()}*"
    )
    await query.edit_message_text(text, parse_mode="Markdown")


async def handle_perfil(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle 'Perfil' button press."""
    query = update.callback_query
    await query.edit_message_text(
        "👤 *Tu Perfil*\n\n"
        "Configura tu perfil de entrenamiento en:\n"
        "👉 agentpilot.es/dashboard/perfil",
        parse_mode="Markdown"
    )


async def handle_vincular(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle 'Vincular' button press."""
    query = update.callback_query
    telegram_id = update.effective_user.id

    user = await db.get_user_by_telegram_id(telegram_id)

    if user and user.get("email"):
        await query.edit_message_text(
            f"✅ Tu cuenta ya está vinculada a: {user['email']}"
        )
        return

    # Generate linking code
    # TODO: Generate and store linking code
    code = "AP-XXXXXX"  # Placeholder

    await query.edit_message_text(
        f"🔗 *Vincular con Web*\n\n"
        f"Tu código de vinculación:\n"
        f"`{code}`\n\n"
        f"Ve a agentpilot.es/vincular e ingresa este código.\n"
        f"⏱️ Expira en 10 minutos.",
        parse_mode="Markdown"
    )


async def handle_modo_fast(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle FAST mode selection."""
    context.user_data["analysis_mode"] = "fast"
    context.user_data["awaiting_analysis"] = True
    query = update.callback_query
    await query.edit_message_text(
        "*Modo FAST seleccionado*\n\n"
        "Ahora envíame el texto o tema a analizar.\n"
        "Coste: 1 credito",
        parse_mode="Markdown"
    )


async def handle_modo_consenso(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle Consenso mode selection."""
    telegram_id = update.effective_user.id
    user = await db.get_user_by_telegram_id(telegram_id)

    if user and user["plan_actual"] == "free":
        query = update.callback_query
        await query.edit_message_text(
            "❌ El modo Consenso no está disponible en el plan Free.\n\n"
            "Mejora tu plan en agentpilot.es/checkout"
        )
        return

    context.user_data["analysis_mode"] = "consensus"
    context.user_data["awaiting_analysis"] = True
    query = update.callback_query
    await query.edit_message_text(
        "*Modo Consenso seleccionado*\n\n"
        "Multiples IAs analizaran tu consulta.\n"
        "Ahora enviame el texto o tema.\n"
        "Coste: 5 creditos",
        parse_mode="Markdown"
    )


async def handle_crear_post(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle 'Crear Post' button press."""
    query = update.callback_query
    await query.edit_message_text(
        "✍️ *Crear Post*\n\n"
        "Esta función estará disponible próximamente.",
        parse_mode="Markdown"
    )


async def handle_historial(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle 'Historial' button press."""
    query = update.callback_query
    await query.edit_message_text(
        "📈 *Historial*\n\n"
        "Consulta tu historial completo en:\n"
        "👉 agentpilot.es/dashboard/historial",
        parse_mode="Markdown"
    )


async def handle_ajustes(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle 'Ajustes' button press."""
    query = update.callback_query
    await query.edit_message_text(
        "⚙️ *Ajustes*\n\n"
        "Gestiona tus ajustes en:\n"
        "👉 agentpilot.es/dashboard",
        parse_mode="Markdown"
    )
