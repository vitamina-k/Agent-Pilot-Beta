# Agent Pilot

**Tu asistente de IA con múltiples cerebros trabajando en consenso.**

Agent Pilot es una plataforma SaaS que combina un bot de Telegram con un dashboard web, permitiendo a los usuarios generar contenido con IA personalizada según su perfil.

## 🏗️ Arquitectura

Este es un **monorepo** con dos aplicaciones que comparten la misma base de datos Supabase:

```
Agent-Pilot-Beta/
├── bot/          → Python (Telegram Bot + AI Swarm)
├── web/          → Next.js (Landing + Dashboard)
├── supabase/     → Database schema
└── docs/         → Documentation
```

### ¿Por qué monorepo?

- **Bot**: Proceso Python 24/7 (long-running, WebSocket/polling) → Railway/Fly.io
- **Web**: Serverless (request-response) → Vercel
- Mismo esquema SQL sincronizado
- Despliegue independiente

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Python 3.11+
- Supabase account
- Stripe account (for payments)

### 1. Clone & Install

```bash
git clone https://github.com/your-username/Agent-Pilot-Beta.git
cd Agent-Pilot-Beta

# Web
cd web && npm install

# Bot
cd ../bot && pip install -r requirements.txt
```

### 2. Configure Environment

```bash
# Web
cp web/.env.example web/.env.local

# Bot
cp bot/.env.example bot/.env
```

Fill in your API keys in both `.env` files.

### 3. Setup Supabase

1. Create a new Supabase project
2. Go to SQL Editor
3. Run `supabase/schema.sql`

### 4. Run Locally

```bash
# Terminal 1: Web
cd web && npm run dev

# Terminal 2: Bot
cd bot && python main.py
```

## 📦 Project Structure

### Bot (`/bot`)

```
bot/
├── main.py                 # Entry point
├── config.py               # Configuration
├── core/
│   ├── handlers/           # Telegram command handlers
│   └── middleware/         # Auth, rate limiting
├── database/
│   └── supabase_client.py  # Database operations
├── ai_swarm/
│   ├── orchestrator.py     # 🧠 Council of Wise Men
│   └── providers/          # AI provider integrations
├── social/                 # Social media integrations
└── payments/               # Stripe + credit management
```

### Web (`/web`)

```
web/
├── app/
│   ├── page.tsx            # Landing page
│   ├── (auth)/             # Login, register
│   ├── dashboard/          # User dashboard
│   ├── checkout/           # Stripe checkout
│   └── api/                # API routes
├── components/
│   ├── ui/                 # Base components
│   ├── landing/            # Landing page sections
│   └── dashboard/          # Dashboard components
├── lib/
│   ├── supabase/           # Supabase clients
│   └── stripe.ts           # Stripe config
└── types/
    └── database.ts         # TypeScript types
```

## 💳 Plans & Pricing

| Plan | Credits/mo | Price | Features |
|------|------------|-------|----------|
| Free | 50 | €0 | FAST mode only |
| Starter | 500 | €19.90 | Consensus + BYOA |
| Pro | 2000 | €49.90 | + Insights |
| Enterprise | 10000 | €199.90 | + API access |

## 🔗 User Linking

Users can start from either the web or Telegram:

**Web → Telegram:**
1. Register on web
2. Go to bot, use /start
3. Enter linking code

**Telegram → Web:**
1. Use /start in bot
2. Visit web to unlock full features
3. Link accounts

## 🧠 AI Swarm (Council of Wise Men)

The core AI system coordinates multiple providers:

- **DeepSeek**: Fast, cost-effective analysis
- **Perplexity**: Real-time web search
- **OpenAI GPT-4**: Advanced reasoning
- **Anthropic Claude**: Nuanced content

Modes:
- **FAST** (1 credit): Single AI, quick response
- **Consensus** (5 credits): Multiple AIs reach agreement

## 📝 Environment Variables

See `.env.example` files in `/bot` and `/web` for required variables.

## 🚀 Deployment

### Bot (Railway/Fly.io)

```bash
cd bot
# Configure railway.toml or fly.toml
railway up  # or fly deploy
```

### Web (Vercel)

```bash
cd web
vercel
```

## 📄 License

Proprietary - All rights reserved.

## 👤 Author

Kevin - Agent Pilot
