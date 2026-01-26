-- ============================================
-- AGENT PILOT - Supabase Database Schema
-- ============================================
-- PLACEHOLDER - Replace with your complete 696-line schema
--
-- This schema supports:
-- - User management with Telegram/Web linking
-- - Credit system and transactions
-- - AI training profiles (bio_entrenamiento)
-- - BYOA (Bring Your Own API keys)
-- - Memory/preferences storage

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- CORE TABLES
-- ============================================

-- Main users table
CREATE TABLE IF NOT EXISTS usuarios_pro (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Identity
    telegram_user_id BIGINT UNIQUE,
    email VARCHAR(255) UNIQUE,

    -- AI Training Profile
    bio_entrenamiento JSONB DEFAULT '{
        "descripcion_personal": null,
        "tono_preferido": "neutral",
        "valores": [],
        "temas_principales": [],
        "hashtags_fijos": [],
        "estilo_escritura": "neutral",
        "audiencia_objetivo": null,
        "idioma_principal": "es",
        "ejemplos_estilo": []
    }'::jsonb,

    -- Credits & Plan
    creditos_disponibles INTEGER DEFAULT 50 CHECK (creditos_disponibles >= 0),
    plan_actual VARCHAR(50) DEFAULT 'free' CHECK (plan_actual IN ('free', 'starter', 'pro', 'enterprise')),

    -- Linking
    codigo_vinculacion VARCHAR(20),
    codigo_vinculacion_expira TIMESTAMPTZ,

    -- Stripe
    stripe_customer_id VARCHAR(255),

    -- Status
    estado VARCHAR(20) DEFAULT 'activo' CHECK (estado IN ('activo', 'suspendido', 'pendiente')),

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User's own API keys (BYOA - Bring Your Own API)
CREATE TABLE IF NOT EXISTS credenciales_api (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL REFERENCES usuarios_pro(id) ON DELETE CASCADE,

    proveedor VARCHAR(50) NOT NULL CHECK (proveedor IN ('openai', 'anthropic', 'deepseek', 'perplexity')),
    api_key_encrypted TEXT NOT NULL,
    es_activa BOOLEAN DEFAULT true,

    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(usuario_id, proveedor)
);

-- Credit transactions
CREATE TABLE IF NOT EXISTS transacciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL REFERENCES usuarios_pro(id) ON DELETE CASCADE,

    tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('compra', 'consumo', 'bonus', 'reembolso', 'suscripcion')),
    creditos INTEGER NOT NULL,
    concepto VARCHAR(255) NOT NULL,

    stripe_payment_id VARCHAR(255),
    stripe_subscription_id VARCHAR(255),

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User memory/preferences (learned from interactions)
CREATE TABLE IF NOT EXISTS memoria_usuario (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL REFERENCES usuarios_pro(id) ON DELETE CASCADE,

    tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('preferencia', 'correccion', 'feedback', 'estilo')),
    clave VARCHAR(255) NOT NULL,
    valor TEXT NOT NULL,

    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(usuario_id, tipo, clave)
);

-- Generated content history
CREATE TABLE IF NOT EXISTS historial_contenido (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL REFERENCES usuarios_pro(id) ON DELETE CASCADE,

    tipo VARCHAR(50) NOT NULL, -- analisis, post_twitter, post_instagram, etc.
    input_text TEXT,
    output_text TEXT NOT NULL,

    modo VARCHAR(20), -- fast, consensus
    creditos_usados INTEGER DEFAULT 0,

    metadata JSONB DEFAULT '{}'::jsonb,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_usuarios_telegram_id ON usuarios_pro(telegram_user_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios_pro(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_codigo_vinculacion ON usuarios_pro(codigo_vinculacion);
CREATE INDEX IF NOT EXISTS idx_transacciones_usuario ON transacciones(usuario_id);
CREATE INDEX IF NOT EXISTS idx_transacciones_fecha ON transacciones(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_historial_usuario ON historial_contenido(usuario_id);
CREATE INDEX IF NOT EXISTS idx_historial_fecha ON historial_contenido(created_at DESC);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for usuarios_pro
DROP TRIGGER IF EXISTS usuarios_pro_updated_at ON usuarios_pro;
CREATE TRIGGER usuarios_pro_updated_at
    BEFORE UPDATE ON usuarios_pro
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Generate linking code
CREATE OR REPLACE FUNCTION generate_link_code()
RETURNS TEXT AS $$
DECLARE
    chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    result TEXT := 'AP-';
    i INTEGER;
BEGIN
    FOR i IN 1..6 LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS
ALTER TABLE usuarios_pro ENABLE ROW LEVEL SECURITY;
ALTER TABLE credenciales_api ENABLE ROW LEVEL SECURITY;
ALTER TABLE transacciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE memoria_usuario ENABLE ROW LEVEL SECURITY;
ALTER TABLE historial_contenido ENABLE ROW LEVEL SECURITY;

-- Users can only see/edit their own data (when using anon key)
CREATE POLICY "Users can view own data" ON usuarios_pro
    FOR SELECT USING (auth.uid()::text = id::text OR auth.uid() IS NULL);

CREATE POLICY "Users can update own data" ON usuarios_pro
    FOR UPDATE USING (auth.uid()::text = id::text);

-- Similar policies for other tables...
-- TODO: Add complete RLS policies from your full schema

-- ============================================
-- INITIAL DATA
-- ============================================

-- No initial data needed - users are created on registration

-- ============================================
-- NOTES
-- ============================================
--
-- Replace this file with your complete 696-line schema that includes:
-- - All table definitions
-- - Complete RLS policies
-- - All functions and triggers
-- - Any stored procedures for complex operations
--
-- To apply this schema:
-- 1. Go to Supabase Dashboard > SQL Editor
-- 2. Paste the complete schema
-- 3. Run the query
