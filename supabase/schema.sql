-- ============================================================================
-- AGENT PILOT - ESQUEMA DE BASE DE DATOS SUPABASE
-- Plataforma SaaS de Análisis y Publicación en Redes Sociales
-- Versión: 1.0
-- ============================================================================

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- TABLA: usuarios_pro
-- Tabla principal de usuarios de la plataforma
-- ============================================================================
CREATE TABLE IF NOT EXISTS usuarios_pro (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Identificadores externos
    telegram_user_id BIGINT UNIQUE,           -- ID de Telegram (vinculación con bot)
    email VARCHAR(255) UNIQUE,                 -- Email (registro web)
    username VARCHAR(100),                     -- Username opcional

    -- Datos personales
    nombre VARCHAR(255),
    apellidos VARCHAR(255),
    avatar_url TEXT,
    idioma VARCHAR(10) DEFAULT 'es',
    timezone VARCHAR(50) DEFAULT 'Europe/Madrid',

    -- Perfil de entrenamiento IA (JSONB para flexibilidad)
    bio_entrenamiento JSONB DEFAULT '{}'::jsonb,
    /*
    Estructura esperada:
    {
        "descripcion_personal": "...",
        "tono_preferido": "directo, crítico",
        "valores": ["Transparencia", "Anti-corrupción"],
        "temas_principales": ["Política", "Economía"],
        "hashtags_fijos": ["#MiMarca"],
        "estilo_escritura": "casual|formal|agresivo",
        "audiencia_objetivo": "...",
        "ejemplos_estilo": ["texto ejemplo 1", "texto ejemplo 2"]
    }
    */

    -- Sistema de créditos
    creditos_disponibles INTEGER DEFAULT 100,
    creditos_totales_comprados INTEGER DEFAULT 0,
    plan_actual VARCHAR(50) DEFAULT 'free',   -- free, starter, pro, enterprise
    fecha_renovacion_plan TIMESTAMPTZ,

    -- Estado de cuenta
    estado VARCHAR(20) DEFAULT 'activo',      -- activo, suspendido, pendiente
    motivo_suspension TEXT,
    fecha_suspension TIMESTAMPTZ,

    -- Métricas de uso
    total_requests INTEGER DEFAULT 0,
    total_publicaciones INTEGER DEFAULT 0,
    total_tokens_consumidos INTEGER DEFAULT 0,
    ultima_actividad TIMESTAMPTZ,

    -- Seguridad
    errores_consecutivos INTEGER DEFAULT 0,
    intentos_inyeccion INTEGER DEFAULT 0,
    ip_registro INET,
    user_agent_registro TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para búsquedas frecuentes
CREATE INDEX idx_usuarios_telegram_id ON usuarios_pro(telegram_user_id);
CREATE INDEX idx_usuarios_email ON usuarios_pro(email);
CREATE INDEX idx_usuarios_plan ON usuarios_pro(plan_actual);
CREATE INDEX idx_usuarios_estado ON usuarios_pro(estado);

-- ============================================================================
-- TABLA: credenciales_api
-- API Keys propias de los usuarios (BYOA - Bring Your Own API)
-- ============================================================================
CREATE TABLE IF NOT EXISTS credenciales_api (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL REFERENCES usuarios_pro(id) ON DELETE CASCADE,

    -- Información del proveedor
    proveedor VARCHAR(50) NOT NULL,           -- openai, anthropic, deepseek, perplexity
    nombre_personalizado VARCHAR(100),         -- Nombre dado por el usuario

    -- Credenciales (encriptadas)
    api_key_encrypted TEXT NOT NULL,
    api_key_hint VARCHAR(20),                  -- Últimos 4 caracteres para identificación

    -- Estado y límites
    es_activa BOOLEAN DEFAULT true,
    prioridad INTEGER DEFAULT 0,               -- Para ordenar múltiples keys del mismo proveedor
    limite_mensual INTEGER,                    -- Límite autoimpuesto por el usuario
    uso_actual_mes INTEGER DEFAULT 0,

    -- Verificación
    ultima_verificacion TIMESTAMPTZ,
    estado_verificacion VARCHAR(20) DEFAULT 'pendiente', -- pendiente, valida, invalida
    mensaje_error TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Constraint para evitar duplicados
    UNIQUE(usuario_id, proveedor, api_key_hint)
);

CREATE INDEX idx_credenciales_usuario ON credenciales_api(usuario_id);
CREATE INDEX idx_credenciales_proveedor ON credenciales_api(proveedor);
CREATE INDEX idx_credenciales_activa ON credenciales_api(es_activa);

-- ============================================================================
-- TABLA: memoria_usuario
-- Preferencias y correcciones aprendidas de cada usuario
-- ============================================================================
CREATE TABLE IF NOT EXISTS memoria_usuario (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL REFERENCES usuarios_pro(id) ON DELETE CASCADE,

    -- Tipo y contenido
    tipo VARCHAR(50) NOT NULL,                -- preferencia, correccion, feedback, estilo
    clave VARCHAR(255) NOT NULL,              -- nombre de la preferencia
    valor TEXT NOT NULL,                      -- valor de la preferencia
    valor_anterior TEXT,                      -- para tracking de cambios

    -- Contexto
    fuente VARCHAR(50),                       -- telegram, web, automatico
    confianza DECIMAL(3,2) DEFAULT 1.0,       -- 0.00 a 1.00
    veces_aplicada INTEGER DEFAULT 0,

    -- Mensaje origen (para debugging)
    mensaje_origen TEXT,
    chat_id BIGINT,

    -- Estado
    es_activa BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    ultima_aplicacion TIMESTAMPTZ,

    -- Evitar duplicados de la misma preferencia
    UNIQUE(usuario_id, tipo, clave)
);

CREATE INDEX idx_memoria_usuario ON memoria_usuario(usuario_id);
CREATE INDEX idx_memoria_tipo ON memoria_usuario(tipo);
CREATE INDEX idx_memoria_activa ON memoria_usuario(es_activa);
CREATE INDEX idx_memoria_clave ON memoria_usuario(clave);

-- ============================================================================
-- TABLA: transacciones
-- Historial de movimientos de créditos
-- ============================================================================
CREATE TABLE IF NOT EXISTS transacciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL REFERENCES usuarios_pro(id) ON DELETE CASCADE,

    -- Tipo y cantidad
    tipo VARCHAR(50) NOT NULL,                -- compra, consumo, bonus, reembolso
    creditos INTEGER NOT NULL,                -- Positivo = añade, Negativo = resta
    saldo_anterior INTEGER NOT NULL,
    saldo_posterior INTEGER NOT NULL,

    -- Concepto
    concepto VARCHAR(255) NOT NULL,
    operacion_tipo VARCHAR(100),              -- analisis_rapido, guion_reel, etc.

    -- Información de pago (si aplica)
    stripe_payment_id VARCHAR(255),
    stripe_session_id VARCHAR(255),
    monto_euros DECIMAL(10,2),

    -- Metadata adicional
    metadata JSONB DEFAULT '{}'::jsonb,

    -- Timestamp
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_transacciones_usuario ON transacciones(usuario_id);
CREATE INDEX idx_transacciones_tipo ON transacciones(tipo);
CREATE INDEX idx_transacciones_fecha ON transacciones(created_at);
CREATE INDEX idx_transacciones_stripe ON transacciones(stripe_payment_id);

-- ============================================================================
-- TABLA: sesiones_ia
-- Log de todas las interacciones con el enjambre de IAs
-- ============================================================================
CREATE TABLE IF NOT EXISTS sesiones_ia (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL REFERENCES usuarios_pro(id) ON DELETE CASCADE,

    -- Contexto de la sesión
    chat_id BIGINT,                           -- Chat de Telegram donde ocurrió
    mensaje_usuario TEXT,                      -- Prompt original del usuario

    -- Configuración usada
    modo VARCHAR(50) NOT NULL,                -- fast, consensus, creative
    proveedores_usados JSONB,                 -- ["deepseek", "perplexity", ...]

    -- Respuestas
    respuestas_intermedias JSONB,             -- Respuestas de cada proveedor
    respuesta_final TEXT,                     -- Respuesta final del juez

    -- Métricas
    tokens_totales INTEGER,
    duracion_total_ms INTEGER,
    creditos_consumidos INTEGER,

    -- Estado
    estado VARCHAR(20) DEFAULT 'completado',  -- completado, error, timeout
    error_mensaje TEXT,

    -- Timestamp
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sesiones_usuario ON sesiones_ia(usuario_id);
CREATE INDEX idx_sesiones_modo ON sesiones_ia(modo);
CREATE INDEX idx_sesiones_fecha ON sesiones_ia(created_at);

-- ============================================================================
-- TABLA: publicaciones
-- Contenido generado y publicado
-- ============================================================================
CREATE TABLE IF NOT EXISTS publicaciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL REFERENCES usuarios_pro(id) ON DELETE CASCADE,
    sesion_ia_id UUID REFERENCES sesiones_ia(id),

    -- Plataforma y tipo
    plataforma VARCHAR(50) NOT NULL,          -- instagram, twitter, wordpress, telegram
    tipo_contenido VARCHAR(50),               -- reel, post, story, thread, articulo

    -- Contenido
    titulo TEXT,
    contenido TEXT NOT NULL,
    hashtags TEXT[],
    media_urls TEXT[],                        -- URLs de imágenes/videos

    -- Publicación externa
    external_post_id VARCHAR(255),            -- ID en la plataforma externa
    external_url TEXT,                        -- URL del post publicado

    -- Programación
    programada_para TIMESTAMPTZ,
    publicada_en TIMESTAMPTZ,

    -- Estado
    estado VARCHAR(20) DEFAULT 'borrador',    -- borrador, programado, publicado, error

    -- Métricas (se actualizan periódicamente)
    metricas JSONB DEFAULT '{}'::jsonb,
    /*
    {
        "likes": 0,
        "comentarios": 0,
        "compartidos": 0,
        "alcance": 0,
        "guardados": 0
    }
    */

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_publicaciones_usuario ON publicaciones(usuario_id);
CREATE INDEX idx_publicaciones_plataforma ON publicaciones(plataforma);
CREATE INDEX idx_publicaciones_estado ON publicaciones(estado);
CREATE INDEX idx_publicaciones_fecha ON publicaciones(created_at);

-- ============================================================================
-- TABLA: planes_precios
-- Configuración de planes y precios
-- ============================================================================
CREATE TABLE IF NOT EXISTS planes_precios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(50) UNIQUE NOT NULL,
    nombre_display VARCHAR(100),
    descripcion TEXT,

    -- Precios
    precio_mensual_eur DECIMAL(10,2),
    precio_anual_eur DECIMAL(10,2),
    stripe_price_id_mensual VARCHAR(255),
    stripe_price_id_anual VARCHAR(255),

    -- Límites
    creditos_mensuales INTEGER,
    requests_por_minuto INTEGER DEFAULT 10,
    publicaciones_diarias INTEGER,

    -- Features (JSONB para flexibilidad)
    features JSONB,
    /*
    {
        "modo_consenso": true,
        "byoa_permitido": true,
        "insights_avanzados": true,
        "soporte_prioritario": true,
        "api_access": false
    }
    */

    -- Estado
    es_activo BOOLEAN DEFAULT true,
    orden INTEGER DEFAULT 0,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insertar planes por defecto
INSERT INTO planes_precios (nombre, nombre_display, descripcion, precio_mensual_eur, creditos_mensuales, features) VALUES
('free', 'Gratuito', 'Para probar la plataforma', 0, 50, '{"modo_consenso": false, "byoa_permitido": false}'::jsonb),
('starter', 'Starter', 'Para creadores individuales', 19.90, 500, '{"modo_consenso": true, "byoa_permitido": true}'::jsonb),
('pro', 'Profesional', 'Para influencers y marcas', 49.90, 2000, '{"modo_consenso": true, "byoa_permitido": true, "insights_avanzados": true}'::jsonb),
('enterprise', 'Enterprise', 'Solución personalizada', 199.90, 10000, '{"modo_consenso": true, "byoa_permitido": true, "insights_avanzados": true, "api_access": true}'::jsonb)
ON CONFLICT (nombre) DO NOTHING;

-- ============================================================================
-- TABLA: costes_operaciones
-- Costes en créditos de cada tipo de operación
-- ============================================================================
CREATE TABLE IF NOT EXISTS costes_operaciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    operacion VARCHAR(100) UNIQUE NOT NULL,
    nombre_display VARCHAR(255),
    descripcion TEXT,
    creditos_base INTEGER NOT NULL,
    creditos_con_api_propia INTEGER,          -- Coste reducido si usa BYOA
    categoria VARCHAR(50),                     -- analisis, generacion, publicacion
    es_activo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insertar costes por defecto
INSERT INTO costes_operaciones (operacion, nombre_display, creditos_base, creditos_con_api_propia, categoria) VALUES
('analisis_rapido', 'Análisis Rápido (solo DeepSeek)', 2, 1, 'analisis'),
('analisis_consenso', 'Análisis Profundo (Enjambre)', 10, 3, 'analisis'),
('fact_check', 'Verificación de Hechos', 5, 2, 'analisis'),
('guion_reel', 'Guión de Reel (1 min)', 8, 3, 'generacion'),
('tweet_optimizado', 'Tweet Optimizado', 3, 1, 'generacion'),
('hilo_twitter', 'Hilo de Twitter', 15, 5, 'generacion'),
('caption_instagram', 'Caption para Instagram', 4, 2, 'generacion'),
('articulo_web', 'Artículo para Web', 20, 8, 'generacion'),
('publicar_instagram', 'Publicar en Instagram', 5, 5, 'publicacion'),
('publicar_twitter', 'Publicar en Twitter', 3, 3, 'publicacion'),
('publicar_wordpress', 'Publicar en WordPress', 5, 5, 'publicacion'),
('descargar_video', 'Descargar Video', 2, 2, 'descarga'),
('transcribir_video', 'Transcribir Video', 10, 4, 'descarga')
ON CONFLICT (operacion) DO NOTHING;

-- ============================================================================
-- TABLA: alertas_seguridad
-- Log de eventos de seguridad y anomalías
-- ============================================================================
CREATE TABLE IF NOT EXISTS alertas_seguridad (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID REFERENCES usuarios_pro(id) ON DELETE SET NULL,

    tipo VARCHAR(50) NOT NULL,                -- rate_limit, inyeccion, error_repetido
    severidad VARCHAR(20) NOT NULL,           -- info, warning, critical
    descripcion TEXT NOT NULL,

    -- Contexto
    metadata JSONB,

    -- Resolución
    accion_tomada VARCHAR(100),
    resuelta BOOLEAN DEFAULT false,
    resuelta_por VARCHAR(255),
    resuelta_en TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_alertas_usuario ON alertas_seguridad(usuario_id);
CREATE INDEX idx_alertas_tipo ON alertas_seguridad(tipo);
CREATE INDEX idx_alertas_severidad ON alertas_seguridad(severidad);
CREATE INDEX idx_alertas_resuelta ON alertas_seguridad(resuelta);

-- ============================================================================
-- FUNCIONES Y TRIGGERS
-- ============================================================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_usuarios_pro_updated_at BEFORE UPDATE ON usuarios_pro
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_credenciales_api_updated_at BEFORE UPDATE ON credenciales_api
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_memoria_usuario_updated_at BEFORE UPDATE ON memoria_usuario
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_publicaciones_updated_at BEFORE UPDATE ON publicaciones
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- FUNCIÓN: Descontar créditos con validación
-- ============================================================================
CREATE OR REPLACE FUNCTION descontar_creditos(
    p_usuario_id UUID,
    p_cantidad INTEGER,
    p_concepto VARCHAR(255),
    p_operacion_tipo VARCHAR(100),
    p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS TABLE(exito BOOLEAN, mensaje TEXT, saldo_actual INTEGER) AS $$
DECLARE
    v_saldo_actual INTEGER;
    v_saldo_nuevo INTEGER;
BEGIN
    -- Obtener saldo actual con bloqueo
    SELECT creditos_disponibles INTO v_saldo_actual
    FROM usuarios_pro
    WHERE id = p_usuario_id
    FOR UPDATE;

    IF v_saldo_actual IS NULL THEN
        RETURN QUERY SELECT false, 'Usuario no encontrado'::TEXT, 0;
        RETURN;
    END IF;

    -- Verificar saldo suficiente
    IF v_saldo_actual < p_cantidad THEN
        RETURN QUERY SELECT false, 'Créditos insuficientes'::TEXT, v_saldo_actual;
        RETURN;
    END IF;

    -- Calcular nuevo saldo
    v_saldo_nuevo := v_saldo_actual - p_cantidad;

    -- Actualizar saldo
    UPDATE usuarios_pro
    SET creditos_disponibles = v_saldo_nuevo,
        total_requests = total_requests + 1,
        total_tokens_consumidos = total_tokens_consumidos + p_cantidad,
        ultima_actividad = NOW()
    WHERE id = p_usuario_id;

    -- Registrar transacción
    INSERT INTO transacciones (
        usuario_id, tipo, creditos, saldo_anterior, saldo_posterior,
        concepto, operacion_tipo, metadata
    ) VALUES (
        p_usuario_id, 'consumo', -p_cantidad, v_saldo_actual, v_saldo_nuevo,
        p_concepto, p_operacion_tipo, p_metadata
    );

    RETURN QUERY SELECT true, 'OK'::TEXT, v_saldo_nuevo;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- FUNCIÓN: Añadir créditos (compra o bonus)
-- ============================================================================
CREATE OR REPLACE FUNCTION añadir_creditos(
    p_usuario_id UUID,
    p_cantidad INTEGER,
    p_tipo VARCHAR(50),
    p_concepto VARCHAR(255),
    p_stripe_payment_id VARCHAR(255) DEFAULT NULL,
    p_monto_euros DECIMAL(10,2) DEFAULT NULL
)
RETURNS TABLE(exito BOOLEAN, mensaje TEXT, saldo_actual INTEGER) AS $$
DECLARE
    v_saldo_actual INTEGER;
    v_saldo_nuevo INTEGER;
BEGIN
    -- Obtener saldo actual
    SELECT creditos_disponibles INTO v_saldo_actual
    FROM usuarios_pro
    WHERE id = p_usuario_id
    FOR UPDATE;

    IF v_saldo_actual IS NULL THEN
        RETURN QUERY SELECT false, 'Usuario no encontrado'::TEXT, 0;
        RETURN;
    END IF;

    -- Calcular nuevo saldo
    v_saldo_nuevo := v_saldo_actual + p_cantidad;

    -- Actualizar saldo
    UPDATE usuarios_pro
    SET creditos_disponibles = v_saldo_nuevo,
        creditos_totales_comprados = CASE
            WHEN p_tipo = 'compra' THEN creditos_totales_comprados + p_cantidad
            ELSE creditos_totales_comprados
        END
    WHERE id = p_usuario_id;

    -- Registrar transacción
    INSERT INTO transacciones (
        usuario_id, tipo, creditos, saldo_anterior, saldo_posterior,
        concepto, stripe_payment_id, monto_euros
    ) VALUES (
        p_usuario_id, p_tipo, p_cantidad, v_saldo_actual, v_saldo_nuevo,
        p_concepto, p_stripe_payment_id, p_monto_euros
    );

    RETURN QUERY SELECT true, 'OK'::TEXT, v_saldo_nuevo;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- FUNCIÓN: Verificar anomalías de usuario
-- ============================================================================
CREATE OR REPLACE FUNCTION verificar_anomalias(
    p_usuario_id UUID
)
RETURNS TABLE(debe_pausar BOOLEAN, razon TEXT) AS $$
DECLARE
    v_errores INTEGER;
    v_inyecciones INTEGER;
BEGIN
    SELECT errores_consecutivos, intentos_inyeccion
    INTO v_errores, v_inyecciones
    FROM usuarios_pro
    WHERE id = p_usuario_id;

    -- Demasiados errores de API
    IF v_errores >= 10 THEN
        -- Registrar alerta
        INSERT INTO alertas_seguridad (usuario_id, tipo, severidad, descripcion, accion_tomada)
        VALUES (p_usuario_id, 'error_api_repetido', 'warning',
                'Usuario con más de 10 errores de API consecutivos', 'pausa_temporal');

        UPDATE usuarios_pro SET estado = 'pausado', motivo_suspension = 'Demasiados errores de API'
        WHERE id = p_usuario_id;

        RETURN QUERY SELECT true, 'Demasiados errores de API consecutivos'::TEXT;
        RETURN;
    END IF;

    -- Intentos de inyección detectados
    IF v_inyecciones >= 3 THEN
        INSERT INTO alertas_seguridad (usuario_id, tipo, severidad, descripcion, accion_tomada)
        VALUES (p_usuario_id, 'intento_inyeccion', 'critical',
                'Usuario con múltiples intentos de inyección de prompts', 'suspension');

        UPDATE usuarios_pro SET estado = 'suspendido', motivo_suspension = 'Intentos de inyección detectados'
        WHERE id = p_usuario_id;

        RETURN QUERY SELECT true, 'Comportamiento sospechoso detectado'::TEXT;
        RETURN;
    END IF;

    RETURN QUERY SELECT false, 'OK'::TEXT;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Habilitar RLS en tablas sensibles
ALTER TABLE usuarios_pro ENABLE ROW LEVEL SECURITY;
ALTER TABLE credenciales_api ENABLE ROW LEVEL SECURITY;
ALTER TABLE memoria_usuario ENABLE ROW LEVEL SECURITY;
ALTER TABLE transacciones ENABLE ROW LEVEL SECURITY;

-- Políticas: usuarios solo ven sus propios datos
CREATE POLICY "usuarios_own_data" ON usuarios_pro
    FOR ALL USING (auth.uid()::text = id::text);

CREATE POLICY "credenciales_own_data" ON credenciales_api
    FOR ALL USING (auth.uid()::text = usuario_id::text);

CREATE POLICY "memoria_own_data" ON memoria_usuario
    FOR ALL USING (auth.uid()::text = usuario_id::text);

CREATE POLICY "transacciones_own_data" ON transacciones
    FOR ALL USING (auth.uid()::text = usuario_id::text);

-- ============================================================================
-- VISTAS ÚTILES
-- ============================================================================

-- Vista de dashboard de usuario
CREATE OR REPLACE VIEW vista_dashboard_usuario AS
SELECT
    u.id,
    u.telegram_user_id,
    u.nombre,
    u.plan_actual,
    u.creditos_disponibles,
    u.estado,
    u.total_requests,
    u.total_publicaciones,
    u.ultima_actividad,
    (SELECT COUNT(*) FROM publicaciones p WHERE p.usuario_id = u.id AND p.created_at > NOW() - INTERVAL '30 days') as publicaciones_mes,
    (SELECT SUM(ABS(creditos)) FROM transacciones t WHERE t.usuario_id = u.id AND t.tipo = 'consumo' AND t.created_at > NOW() - INTERVAL '30 days') as creditos_usados_mes
FROM usuarios_pro u;

-- Vista de estadísticas de uso de IA
CREATE OR REPLACE VIEW vista_stats_ia AS
SELECT
    usuario_id,
    modo,
    COUNT(*) as total_sesiones,
    AVG(tokens_totales) as promedio_tokens,
    AVG(duracion_total_ms) as promedio_duracion_ms,
    SUM(creditos_consumidos) as total_creditos
FROM sesiones_ia
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY usuario_id, modo;

-- ============================================================================
-- TABLA: vinculacion_codigos
-- Códigos temporales para vincular Telegram <-> Web
-- ============================================================================
CREATE TABLE IF NOT EXISTS vinculacion_codigos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL REFERENCES usuarios_pro(id) ON DELETE CASCADE,
    codigo VARCHAR(10) UNIQUE NOT NULL,
    tipo VARCHAR(20) NOT NULL,                -- telegram_to_web, web_to_telegram
    usado BOOLEAN DEFAULT false,
    expira_en TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_vinculacion_codigo ON vinculacion_codigos(codigo);
CREATE INDEX idx_vinculacion_usuario ON vinculacion_codigos(usuario_id);
CREATE INDEX idx_vinculacion_expira ON vinculacion_codigos(expira_en);

-- Función para limpiar códigos expirados (ejecutar con cron)
CREATE OR REPLACE FUNCTION limpiar_codigos_expirados()
RETURNS void AS $$
BEGIN
    DELETE FROM vinculacion_codigos WHERE expira_en < NOW();
END;
$$ LANGUAGE plpgsql;
