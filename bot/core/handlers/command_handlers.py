"""
Agent Pilot Bot - Command Handlers
==================================
Handlers for bot commands: /start, /menu, /saldo, /analizar, /perfil
Replace this placeholder with your complete handlers.
"""

from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import ContextTypes

from database.supabase_client import db
from config import settings


async def start_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle /start command - Welcome and registration/linking."""
    telegram_id = update.effective_user.id
    username = update.effective_user.username or "Usuario"

    # Check if user exists
    user = await db.get_user_by_telegram_id(telegram_id)

    if user:
        # Existing user
        credits = user["creditos_disponibles"]
        is_linked = user.get("email") is not None

        welcome_text = (
            f"¡Hola de nuevo, {username}! 👋\n\n"
            f"💰 Créditos: {credits}\n"
            f"📦 Plan: {user['plan_actual'].title()}\n"
        )

        if not is_linked:
            welcome_text += (
                "\n⚠️ Tu cuenta no está vinculada.\n"
                "Vincula en agentpilot.es para desbloquear todas las funciones."
            )
    else:
        # New user - create account
        user = await db.create_user(telegram_id)

        welcome_text = (
            f"¡Bienvenido a Agent Pilot, {username}! 🚀\n\n"
            "Soy tu asistente de IA con múltiples cerebros trabajando en consenso.\n\n"
            "🎁 Te he dado 50 créditos de bienvenida.\n\n"
            "Para desbloquear todas las funciones, configura tu perfil en:\n"
            "👉 agentpilot.es/vincular"
        )

    # Create menu buttons
    keyboard = [
        [
            InlineKeyboardButton("📊 Analizar", callback_data="analizar"),
            InlineKeyboardButton("💰 Saldo", callback_data="saldo"),
        ],
        [
            InlineKeyboardButton("👤 Mi Perfil", callback_data="perfil"),
            InlineKeyboardButton("🔗 Vincular Web", callback_data="vincular"),
        ],
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)

    await update.message.reply_text(welcome_text, reply_markup=reply_markup)


async def menu_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle /menu command - Show main menu."""
    keyboard = [
        [
            InlineKeyboardButton("📊 Analizar", callback_data="analizar"),
            InlineKeyboardButton("✍️ Crear Post", callback_data="crear_post"),
        ],
        [
            InlineKeyboardButton("💰 Mi Saldo", callback_data="saldo"),
            InlineKeyboardButton("📈 Historial", callback_data="historial"),
        ],
        [
            InlineKeyboardButton("👤 Mi Perfil", callback_data="perfil"),
            InlineKeyboardButton("⚙️ Ajustes", callback_data="ajustes"),
        ],
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)

    await update.message.reply_text(
        "📋 *Menú Principal*\n\n¿Qué quieres hacer?",
        reply_markup=reply_markup,
        parse_mode="Markdown"
    )


async def saldo_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle /saldo command - Show credit balance."""
    telegram_id = update.effective_user.id
    user = await db.get_user_by_telegram_id(telegram_id)

    if not user:
        await update.message.reply_text(
            "❌ No tienes cuenta. Usa /start para registrarte."
        )
        return

    credits = user["creditos_disponibles"]
    plan = user["plan_actual"]

    text = (
        f"💰 *Tu Saldo*\n\n"
        f"Créditos disponibles: *{credits}*\n"
        f"Plan actual: *{plan.title()}*\n\n"
        f"📊 Costes por operación:\n"
        f"• Modo FAST: 1 crédito\n"
        f"• Consenso: 5 créditos\n"
        f"• Análisis profundo: 10 créditos\n\n"
        f"¿Necesitas más? 👉 agentpilot.es/creditos"
    )

    await update.message.reply_text(text, parse_mode="Markdown")


async def analizar_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle /analizar command - Start analysis flow."""
    telegram_id = update.effective_user.id
    user = await db.get_user_by_telegram_id(telegram_id)

    if not user:
        await update.message.reply_text(
            "❌ No tienes cuenta. Usa /start para registrarte."
        )
        return

    if user["creditos_disponibles"] < 1:
        await update.message.reply_text(
            "❌ No tienes créditos suficientes.\n"
            "Compra más en agentpilot.es/creditos"
        )
        return

    # Set conversation state
    context.user_data["awaiting_analysis"] = True

    keyboard = [
        [
            InlineKeyboardButton("⚡ FAST (1 cr)", callback_data="modo_fast"),
            InlineKeyboardButton("🧠 Consenso (5 cr)", callback_data="modo_consenso"),
        ],
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)

    await update.message.reply_text(
        "📊 *Análisis con IA*\n\n"
        "Envíame el texto o tema que quieres analizar.\n"
        "Primero, elige el modo:",
        reply_markup=reply_markup,
        parse_mode="Markdown"
    )


async def perfil_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle /perfil command - Show user profile."""
    telegram_id = update.effective_user.id
    user = await db.get_user_by_telegram_id(telegram_id)

    if not user:
        await update.message.reply_text(
            "❌ No tienes cuenta. Usa /start para registrarte."
        )
        return

    bio = user.get("bio_entrenamiento", {})
    is_configured = bool(bio.get("descripcion_personal"))

    if is_configured:
        text = (
            f"👤 *Tu Perfil*\n\n"
            f"📝 Descripción: {bio.get('descripcion_personal', 'No configurado')[:100]}...\n"
            f"🎯 Tono: {bio.get('tono_preferido', 'No configurado')}\n"
            f"📌 Temas: {', '.join(bio.get('temas_principales', []))[:50]}\n\n"
            f"Edita tu perfil completo en:\n"
            f"👉 agentpilot.es/dashboard/perfil"
        )
    else:
        text = (
            "👤 *Tu Perfil*\n\n"
            "⚠️ No has configurado tu perfil de entrenamiento.\n\n"
            "Configúralo para que la IA genere contenido personalizado:\n"
            "👉 agentpilot.es/dashboard/perfil"
        )

    await update.message.reply_text(text, parse_mode="Markdown")
