"""
Agent Pilot - AI Swarm Orchestrator
====================================
El "Consejo de Sabios" (CouncilOfWiseMen)
Este módulo coordina múltiples proveedores de IA trabajando en paralelo
para producir respuestas de alta calidad mediante consenso.
Modos de operación:
- FAST: Solo DeepSeek (rápido, económico)
- CONSENSUS: Perplexity + Claude/GPT-4 -> DeepSeek como Juez
- CREATIVE: Especializado en generación de contenido viral
Autor: Agent Pilot Team
Versión: 1.0
"""

import asyncio
import logging
import time
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from enum import Enum
from typing import Optional, Dict, List, Any, Callable
from datetime import datetime
import json
import aiohttp
from openai import AsyncOpenAI

logger = logging.getLogger(__name__)

# ============================================================================
# ENUMS Y DATACLASSES
# ============================================================================

class SwarmMode(Enum):
    """Modos de operación del Enjambre de IAs."""
    FAST = "fast"
    CONSENSUS = "consensus"
    CREATIVE = "creative"


class ProviderType(Enum):
    """Tipos de proveedores de IA disponibles."""
    DEEPSEEK = "deepseek"
    PERPLEXITY = "perplexity"
    OPENAI = "openai"
    ANTHROPIC = "anthropic"
    GROQ = "groq"


@dataclass
class AIResponse:
    """Respuesta de un proveedor de IA individual."""
    provider: ProviderType
    content: str
    tokens_used: int = 0
    duration_ms: int = 0
    success: bool = True
    error: Optional[str] = None
    raw_response: Optional[Dict] = None
    metadata: Dict = field(default_factory=dict)


@dataclass
class SwarmResult:
    """Resultado final del Enjambre."""
    final_response: str
    mode: SwarmMode
    individual_responses: Dict[str, AIResponse] = field(default_factory=dict)
    total_tokens: int = 0
    total_duration_ms: int = 0
    credits_consumed: int = 0
    success: bool = True
    error: Optional[str] = None


@dataclass
class UserContext:
    """Contexto del usuario para personalizar respuestas."""
    user_id: str
    telegram_id: Optional[int] = None
    bio_entrenamiento: Dict = field(default_factory=dict)
    memoria: List[Dict] = field(default_factory=list)
    preferencias: Dict = field(default_factory=dict)
    plan: str = "free"
    creditos_disponibles: int = 0
    api_keys: Dict[str, str] = field(default_factory=dict)


@dataclass
class APICredentials:
    """Credenciales de API (sistema o usuario)."""
    api_key: str
    is_user_owned: bool = False
    provider: ProviderType = None


# ============================================================================
# PROVEEDOR BASE (INTERFAZ ABSTRACTA)
# ============================================================================

class BaseAIProvider(ABC):
    """Interfaz base para todos los proveedores de IA."""

    def __init__(self, credentials: APICredentials):
        self.credentials = credentials
        self.provider_type: ProviderType = None

    @abstractmethod
    async def generate(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        max_tokens: int = 2000,
        temperature: float = 0.7,
        **kwargs
    ) -> AIResponse:
        """Genera una respuesta basada en el prompt."""
        pass

    @abstractmethod
    async def health_check(self) -> bool:
        """Verifica que el proveedor está funcionando."""
        pass

    def _build_messages(self, prompt: str, system_prompt: Optional[str]) -> List[Dict]:
        """Construye el array de mensajes estándar."""
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})
        return messages


# ============================================================================
# PROVEEDORES DE IA
# ============================================================================

class DeepSeekProvider(BaseAIProvider):
    """Proveedor DeepSeek - El Juez del Enjambre."""

    def __init__(self, credentials: APICredentials):
        super().__init__(credentials)
        self.provider_type = ProviderType.DEEPSEEK
        self.client = AsyncOpenAI(
            api_key=credentials.api_key,
            base_url="https://api.deepseek.com"
        )
        self.model = "deepseek-chat"

    async def generate(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        max_tokens: int = 2000,
        temperature: float = 0.7,
        **kwargs
    ) -> AIResponse:
        start_time = time.time()
        try:
            messages = self._build_messages(prompt, system_prompt)
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                max_tokens=max_tokens,
                temperature=temperature
            )
            content = response.choices[0].message.content
            tokens = response.usage.total_tokens if response.usage else 0
            duration = int((time.time() - start_time) * 1000)
            return AIResponse(
                provider=self.provider_type,
                content=content,
                tokens_used=tokens,
                duration_ms=duration,
                success=True,
                raw_response=response.model_dump() if hasattr(response, 'model_dump') else None
            )
        except Exception as e:
            logger.error(f"DeepSeek error: {e}")
            return AIResponse(
                provider=self.provider_type,
                content="",
                success=False,
                error=str(e),
                duration_ms=int((time.time() - start_time) * 1000)
            )

    async def health_check(self) -> bool:
        try:
            response = await self.generate("Responde solo 'OK'", max_tokens=10)
            return response.success
        except:
            return False


class PerplexityProvider(BaseAIProvider):
    """Proveedor Perplexity - Especialista en Fact-Checking y datos actuales."""

    def __init__(self, credentials: APICredentials):
        super().__init__(credentials)
        self.provider_type = ProviderType.PERPLEXITY
        self.endpoint = "https://api.perplexity.ai/chat/completions"
        self.model = "sonar-pro"

    async def generate(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        max_tokens: int = 2000,
        temperature: float = 0.3,
        **kwargs
    ) -> AIResponse:
        start_time = time.time()
        try:
            messages = self._build_messages(prompt, system_prompt)
            headers = {
                "Authorization": f"Bearer {self.credentials.api_key}",
                "Content-Type": "application/json"
            }
            payload = {
                "model": self.model,
                "messages": messages,
                "max_tokens": max_tokens,
                "temperature": temperature
            }
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    self.endpoint,
                    headers=headers,
                    json=payload,
                    timeout=aiohttp.ClientTimeout(total=60)
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        content = data['choices'][0]['message']['content']
                        tokens = data.get('usage', {}).get('total_tokens', 0)
                        duration = int((time.time() - start_time) * 1000)
                        return AIResponse(
                            provider=self.provider_type,
                            content=content,
                            tokens_used=tokens,
                            duration_ms=duration,
                            success=True,
                            raw_response=data,
                            metadata={"citations": data.get('citations', [])}
                        )
                    else:
                        error_text = await response.text()
                        raise Exception(f"Status {response.status}: {error_text}")
        except Exception as e:
            logger.error(f"Perplexity error: {e}")
            return AIResponse(
                provider=self.provider_type,
                content="",
                success=False,
                error=str(e),
                duration_ms=int((time.time() - start_time) * 1000)
            )

    async def health_check(self) -> bool:
        try:
            response = await self.generate("¿Cuál es la fecha de hoy?", max_tokens=50)
            return response.success
        except:
            return False


class OpenAIProvider(BaseAIProvider):
    """Proveedor OpenAI/GPT-4 - Análisis de estilo y psicología."""

    def __init__(self, credentials: APICredentials):
        super().__init__(credentials)
        self.provider_type = ProviderType.OPENAI
        self.client = AsyncOpenAI(api_key=credentials.api_key)
        self.model = "gpt-4-turbo-preview"

    async def generate(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        max_tokens: int = 2000,
        temperature: float = 0.7,
        **kwargs
    ) -> AIResponse:
        start_time = time.time()
        try:
            messages = self._build_messages(prompt, system_prompt)
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                max_tokens=max_tokens,
                temperature=temperature
            )
            content = response.choices[0].message.content
            tokens = response.usage.total_tokens if response.usage else 0
            duration = int((time.time() - start_time) * 1000)
            return AIResponse(
                provider=self.provider_type,
                content=content,
                tokens_used=tokens,
                duration_ms=duration,
                success=True
            )
        except Exception as e:
            logger.error(f"OpenAI error: {e}")
            return AIResponse(
                provider=self.provider_type,
                content="",
                success=False,
                error=str(e),
                duration_ms=int((time.time() - start_time) * 1000)
            )

    async def health_check(self) -> bool:
        try:
            response = await self.generate("Responde solo 'OK'", max_tokens=10)
            return response.success
        except:
            return False


class AnthropicProvider(BaseAIProvider):
    """Proveedor Anthropic/Claude - Análisis de matices y estilo."""

    def __init__(self, credentials: APICredentials):
        super().__init__(credentials)
        self.provider_type = ProviderType.ANTHROPIC
        self.endpoint = "https://api.anthropic.com/v1/messages"
        self.model = "claude-3-5-sonnet-20241022"

    async def generate(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        max_tokens: int = 2000,
        temperature: float = 0.7,
        **kwargs
    ) -> AIResponse:
        start_time = time.time()
        try:
            headers = {
                "x-api-key": self.credentials.api_key,
                "anthropic-version": "2023-06-01",
                "Content-Type": "application/json"
            }
            payload = {
                "model": self.model,
                "max_tokens": max_tokens,
                "messages": [{"role": "user", "content": prompt}]
            }
            if system_prompt:
                payload["system"] = system_prompt
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    self.endpoint,
                    headers=headers,
                    json=payload,
                    timeout=aiohttp.ClientTimeout(total=60)
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        content = data['content'][0]['text']
                        tokens = data.get('usage', {}).get('input_tokens', 0) + \
                                data.get('usage', {}).get('output_tokens', 0)
                        duration = int((time.time() - start_time) * 1000)
                        return AIResponse(
                            provider=self.provider_type,
                            content=content,
                            tokens_used=tokens,
                            duration_ms=duration,
                            success=True,
                            raw_response=data
                        )
                    else:
                        error_text = await response.text()
                        raise Exception(f"Status {response.status}: {error_text}")
        except Exception as e:
            logger.error(f"Anthropic error: {e}")
            return AIResponse(
                provider=self.provider_type,
                content="",
                success=False,
                error=str(e),
                duration_ms=int((time.time() - start_time) * 1000)
            )

    async def health_check(self) -> bool:
        try:
            response = await self.generate("Responde solo 'OK'", max_tokens=10)
            return response.success
        except:
            return False


# ============================================================================
# SISTEMA DE PROMPTS
# ============================================================================

class PromptBuilder:
    """Constructor de prompts con inyección de identidad."""

    @staticmethod
    def build_system_prompt(user_context: UserContext, role: str = "general") -> str:
        """Construye el system prompt inyectando la identidad del usuario."""
        base_prompt = """Eres un asistente de IA especializado en análisis de contenido y
generación de publicaciones para redes sociales. Tu objetivo es ayudar al usuario
a crear contenido viral y de alta calidad."""

        bio = user_context.bio_entrenamiento
        if bio:
            identity_section = f"""

=== PERFIL DEL USUARIO ===
{bio.get('descripcion_personal', '')}

TONO PREFERIDO: {bio.get('tono_preferido', 'profesional pero accesible')}
VALORES: {', '.join(bio.get('valores', []))}
TEMAS PRINCIPALES: {', '.join(bio.get('temas_principales', []))}
ESTILO DE ESCRITURA: {bio.get('estilo_escritura', 'equilibrado')}
AUDIENCIA OBJETIVO: {bio.get('audiencia_objetivo', 'público general')}
HASHTAGS FIJOS: {', '.join(bio.get('hashtags_fijos', []))}
"""
            base_prompt += identity_section

        # Añadir memoria/preferencias aprendidas
        if user_context.memoria:
            memoria_section = "\n=== PREFERENCIAS APRENDIDAS ===\n"
            for mem in user_context.memoria[-10:]:  # Últimas 10
                memoria_section += f"- {mem.get('clave', '')}: {mem.get('valor', '')}\n"
            base_prompt += memoria_section

        # Instrucciones específicas por rol
        role_instructions = {
            "fact_checker": """

Tu rol específico es VERIFICAR HECHOS. Busca datos actuales, contrasta información
y proporciona fuentes cuando sea posible. Sé escéptico pero justo.""",

            "style_analyzer": """

Tu rol específico es ANALIZAR ESTILO Y PSICOLOGÍA. Evalúa el tono, la estructura,
el impacto emocional y sugiere mejoras para maximizar el engagement.""",

            "judge": """

Tu rol específico es SER EL JUEZ FINAL. Recibirás análisis de otros expertos.
Tu trabajo es sintetizar las mejores ideas, resolver contradicciones y
producir una respuesta final coherente y de alta calidad.""",

            "creative": """

Tu rol específico es CREAR CONTENIDO VIRAL. Genera ganchos potentes,
estructuras que enganchen y llamadas a la acción efectivas."""
        }

        if role in role_instructions:
            base_prompt += role_instructions[role]

        return base_prompt

    @staticmethod
    def build_judge_prompt(
        original_request: str,
        fact_check_response: str,
        style_response: str
    ) -> str:
        """Construye el prompt para el Juez (DeepSeek)."""
        return f"""Eres el JUEZ FINAL del Consejo de Sabios. Has recibido análisis de dos expertos
sobre la siguiente solicitud del usuario:

=== SOLICITUD ORIGINAL ===
{original_request}

=== ANÁLISIS DEL VERIFICADOR DE HECHOS (Perplexity) ===
{fact_check_response}

=== ANÁLISIS DE ESTILO Y PSICOLOGÍA (Claude/GPT-4) ===
{style_response}

=== TU TAREA ===
1. Sintetiza los mejores elementos de ambos análisis
2. Resuelve cualquier contradicción entre ellos
3. Añade tu propia perspectiva si es necesario
4. Produce una RESPUESTA FINAL que sea:
   - Factualmente correcta
   - Estilísticamente optimizada
   - Lista para usar

Responde SOLO con la respuesta final, sin explicar tu proceso de síntesis."""


# ============================================================================
# CONSEJO DE SABIOS - ORQUESTADOR PRINCIPAL
# ============================================================================

class CouncilOfWiseMen:
    """
    El Consejo de Sabios - Orquestador del Enjambre de IAs.

    Coordina múltiples proveedores de IA trabajando en paralelo
    para producir respuestas de alta calidad mediante consenso.
    """

    def __init__(
        self,
        system_credentials: Dict[str, str],
        cost_config: Optional[Dict[str, int]] = None
    ):
        """
        Inicializa el Consejo de Sabios.

        Args:
            system_credentials: Dict con API keys del sistema
                               {"deepseek": "sk-xxx", "perplexity": "pplx-xxx", ...}
            cost_config: Configuración de costes por operación
        """
        self.system_credentials = system_credentials
        self.cost_config = cost_config or {
            "fast": 2,
            "consensus": 10,
            "creative": 8
        }
        self.prompt_builder = PromptBuilder()

        # Callbacks para monitoreo
        self.on_provider_start: Optional[Callable] = None
        self.on_provider_complete: Optional[Callable] = None
        self.on_error: Optional[Callable] = None

    def _get_provider(
        self,
        provider_type: ProviderType,
        user_context: UserContext
    ) -> Optional[BaseAIProvider]:
        """
        Obtiene un proveedor de IA, priorizando API keys del usuario (BYOA).

        Args:
            provider_type: Tipo de proveedor a obtener
            user_context: Contexto del usuario (puede tener sus propias API keys)

        Returns:
            Instancia del proveedor o None si no hay credenciales
        """
        provider_name = provider_type.value

        # Prioridad 1: API key del usuario (BYOA)
        if provider_name in user_context.api_keys:
            api_key = user_context.api_keys[provider_name]
            is_user_owned = True
            logger.info(f"Usando API key propia del usuario para {provider_name}")
        # Prioridad 2: API key del sistema
        elif provider_name in self.system_credentials:
            api_key = self.system_credentials[provider_name]
            is_user_owned = False
            logger.info(f"Usando API key del sistema para {provider_name}")
        else:
            logger.warning(f"No hay credenciales disponibles para {provider_name}")
            return None

        credentials = APICredentials(
            api_key=api_key,
            is_user_owned=is_user_owned,
            provider=provider_type
        )

        # Mapeo de tipos a clases
        provider_classes = {
            ProviderType.DEEPSEEK: DeepSeekProvider,
            ProviderType.PERPLEXITY: PerplexityProvider,
            ProviderType.OPENAI: OpenAIProvider,
            ProviderType.ANTHROPIC: AnthropicProvider
        }

        provider_class = provider_classes.get(provider_type)
        if provider_class:
            return provider_class(credentials)
        return None

    def _calculate_credits(
        self,
        mode: SwarmMode,
        responses: Dict[str, AIResponse],
        user_context: UserContext
    ) -> int:
        """Calcula los créditos a consumir basándose en el modo y uso de API propias."""
        base_cost = self.cost_config.get(mode.value, 5)

        # Descuento por usar API keys propias
        user_owned_count = sum(
            1 for resp in responses.values()
            if resp.success and resp.metadata.get('is_user_owned', False)
        )

        if user_owned_count > 0:
            # Hasta 70% de descuento si usa todas sus propias APIs
            discount = min(0.7, user_owned_count * 0.25)
            base_cost = int(base_cost * (1 - discount))

        return max(1, base_cost)

    async def process(
        self,
        prompt: str,
        user_context: UserContext,
        mode: SwarmMode = SwarmMode.FAST,
        **kwargs
    ) -> SwarmResult:
        """
        Procesa una solicitud usando el modo especificado.

        Args:
            prompt: La consulta del usuario
            user_context: Contexto completo del usuario
            mode: Modo de operación (FAST, CONSENSUS, CREATIVE)
            **kwargs: Argumentos adicionales (content_type, etc.)

        Returns:
            SwarmResult con la respuesta final y métricas
        """
        start_time = time.time()

        try:
            if mode == SwarmMode.FAST:
                result = await self._process_fast(prompt, user_context, **kwargs)
            elif mode == SwarmMode.CONSENSUS:
                result = await self._process_consensus(prompt, user_context, **kwargs)
            elif mode == SwarmMode.CREATIVE:
                result = await self._process_creative(prompt, user_context, **kwargs)
            else:
                raise ValueError(f"Modo no soportado: {mode}")

            # Calcular métricas finales
            result.total_duration_ms = int((time.time() - start_time) * 1000)
            result.total_tokens = sum(
                r.tokens_used for r in result.individual_responses.values()
            )
            result.credits_consumed = self._calculate_credits(
                mode, result.individual_responses, user_context
            )

            return result

        except Exception as e:
            logger.error(f"Error en CouncilOfWiseMen.process: {e}")
            return SwarmResult(
                final_response="",
                mode=mode,
                success=False,
                error=str(e),
                total_duration_ms=int((time.time() - start_time) * 1000)
            )

    async def _process_fast(
        self,
        prompt: str,
        user_context: UserContext,
        **kwargs
    ) -> SwarmResult:
        """Modo FAST: Solo DeepSeek, rápido y económico."""
        deepseek = self._get_provider(ProviderType.DEEPSEEK, user_context)
        if not deepseek:
            raise ValueError("DeepSeek no disponible")

        system_prompt = self.prompt_builder.build_system_prompt(user_context, "general")

        if self.on_provider_start:
            self.on_provider_start(ProviderType.DEEPSEEK)

        response = await deepseek.generate(
            prompt=prompt,
            system_prompt=system_prompt,
            **kwargs
        )

        if self.on_provider_complete:
            self.on_provider_complete(ProviderType.DEEPSEEK, response)

        return SwarmResult(
            final_response=response.content,
            mode=SwarmMode.FAST,
            individual_responses={"deepseek": response},
            success=response.success,
            error=response.error
        )

    async def _process_consensus(
        self,
        prompt: str,
        user_context: UserContext,
        **kwargs
    ) -> SwarmResult:
        """
        Modo CONSENSUS: Múltiples IAs + Juez para análisis profundo.

        Flujo:
        1. Perplexity (fact-checking) + Claude/GPT-4 (estilo) en paralelo
        2. DeepSeek como Juez sintetiza ambas respuestas
        """
        # Obtener proveedores
        perplexity = self._get_provider(ProviderType.PERPLEXITY, user_context)
        style_provider = (
            self._get_provider(ProviderType.ANTHROPIC, user_context) or
            self._get_provider(ProviderType.OPENAI, user_context)
        )
        deepseek = self._get_provider(ProviderType.DEEPSEEK, user_context)

        if not deepseek:
            raise ValueError("DeepSeek (Juez) no disponible")

        responses = {}

        # Fase 1: Consultas paralelas a fact-checker y analizador de estilo
        async def run_fact_checker():
            if perplexity:
                system_prompt = self.prompt_builder.build_system_prompt(
                    user_context, "fact_checker"
                )
                if self.on_provider_start:
                    self.on_provider_start(ProviderType.PERPLEXITY)
                response = await perplexity.generate(
                    prompt=f"Verifica los hechos y proporciona datos actuales sobre: {prompt}",
                    system_prompt=system_prompt,
                    temperature=0.3
                )
                if self.on_provider_complete:
                    self.on_provider_complete(ProviderType.PERPLEXITY, response)
                return response
            return AIResponse(
                provider=ProviderType.PERPLEXITY,
                content="Fact-checking no disponible",
                success=False
            )

        async def run_style_analyzer():
            if style_provider:
                system_prompt = self.prompt_builder.build_system_prompt(
                    user_context, "style_analyzer"
                )
                provider_type = style_provider.provider_type
                if self.on_provider_start:
                    self.on_provider_start(provider_type)
                response = await style_provider.generate(
                    prompt=f"Analiza el estilo, tono y psicología para optimizar: {prompt}",
                    system_prompt=system_prompt,
                    temperature=0.7
                )
                if self.on_provider_complete:
                    self.on_provider_complete(provider_type, response)
                return response
            return AIResponse(
                provider=ProviderType.OPENAI,
                content="Análisis de estilo no disponible",
                success=False
            )

        # Ejecutar en paralelo
        fact_check_result, style_result = await asyncio.gather(
            run_fact_checker(),
            run_style_analyzer(),
            return_exceptions=True
        )

        # Manejar excepciones
        if isinstance(fact_check_result, Exception):
            fact_check_result = AIResponse(
                provider=ProviderType.PERPLEXITY,
                content="",
                success=False,
                error=str(fact_check_result)
            )

        if isinstance(style_result, Exception):
            style_result = AIResponse(
                provider=ProviderType.OPENAI,
                content="",
                success=False,
                error=str(style_result)
            )

        responses["perplexity"] = fact_check_result
        responses["style_analyzer"] = style_result

        # Fase 2: DeepSeek como Juez
        judge_prompt = self.prompt_builder.build_judge_prompt(
            original_request=prompt,
            fact_check_response=fact_check_result.content if fact_check_result.success else "No disponible",
            style_response=style_result.content if style_result.success else "No disponible"
        )

        judge_system = self.prompt_builder.build_system_prompt(user_context, "judge")

        if self.on_provider_start:
            self.on_provider_start(ProviderType.DEEPSEEK)

        judge_response = await deepseek.generate(
            prompt=judge_prompt,
            system_prompt=judge_system,
            temperature=0.5
        )

        if self.on_provider_complete:
            self.on_provider_complete(ProviderType.DEEPSEEK, judge_response)

        responses["deepseek_judge"] = judge_response

        return SwarmResult(
            final_response=judge_response.content,
            mode=SwarmMode.CONSENSUS,
            individual_responses=responses,
            success=judge_response.success,
            error=judge_response.error
        )

    async def _process_creative(
        self,
        prompt: str,
        user_context: UserContext,
        content_type: str = "reel",
        **kwargs
    ) -> SwarmResult:
        """
        Modo CREATIVE: Optimizado para contenido viral.

        Args:
            prompt: Tema o idea base
            content_type: Tipo de contenido (reel, thread, caption)
        """
        deepseek = self._get_provider(ProviderType.DEEPSEEK, user_context)
        if not deepseek:
            raise ValueError("DeepSeek no disponible para modo creativo")

        # Prompts específicos por tipo de contenido
        creative_prompts = {
            "reel": """Crea un GUIÓN DE REEL de 1 minuto con esta estructura:

🎣 GANCHO (0-3 segundos):
- Frase impactante que detenga el scroll
- Pregunta provocadora o dato sorprendente

📚 VALOR (3-50 segundos):
- Contenido principal dividido en 3-5 puntos
- Cada punto debe ser tweeteable por sí solo
- Usa transiciones claras

🎯 CTA (50-60 segundos):
- Llamada a la acción clara
- Invita a comentar, guardar o compartir

TEMA: {prompt}

Incluye también:
- 3 opciones de texto para overlay
- Sugerencia de música/sonido trending
- 10 hashtags optimizados""",

            "thread": """Crea un HILO DE TWITTER viral con esta estructura:

1️⃣ TWEET GANCHO:
- Máximo 280 caracteres
- Debe generar curiosidad o controversia

2️⃣-8️⃣ TWEETS DE DESARROLLO:
- Cada uno autónomo pero conectado
- Mezcla de datos, opiniones y preguntas

9️⃣ TWEET RESUMEN:
- Recapitula el mensaje principal

🔟 TWEET CTA:
- Invita a RT, seguir o comentar

TEMA: {prompt}""",

            "caption": """Crea un CAPTION DE INSTAGRAM optimizado para engagement:

📝 PRIMERA LÍNEA (CRUCIAL):
- Gancho que aparece antes del "más..."
- Máximo 125 caracteres

📖 CUERPO:
- Historia o valor en 3-4 párrafos cortos
- Usa emojis estratégicamente
- Incluye pregunta para generar comentarios

🎯 CTA:
- Guarda este post si...
- Comenta [emoji] si...
- Comparte con alguien que...

#️⃣ HASHTAGS:
- 25-30 hashtags en 3 niveles (popular, medio, nicho)

TEMA: {prompt}"""
        }

        creative_prompt = creative_prompts.get(content_type, creative_prompts["reel"])
        formatted_prompt = creative_prompt.format(prompt=prompt)

        system_prompt = self.prompt_builder.build_system_prompt(user_context, "creative")

        if self.on_provider_start:
            self.on_provider_start(ProviderType.DEEPSEEK)

        response = await deepseek.generate(
            prompt=formatted_prompt,
            system_prompt=system_prompt,
            temperature=0.8,
            max_tokens=3000
        )

        if self.on_provider_complete:
            self.on_provider_complete(ProviderType.DEEPSEEK, response)

        return SwarmResult(
            final_response=response.content,
            mode=SwarmMode.CREATIVE,
            individual_responses={"deepseek": response},
            success=response.success,
            error=response.error
        )

    async def learn_preference(
        self,
        user_context: UserContext,
        feedback: str,
        original_response: str
    ) -> Dict[str, str]:
        """
        Aprende una preferencia del usuario basada en su feedback.

        Args:
            user_context: Contexto del usuario
            feedback: El feedback o corrección del usuario
            original_response: La respuesta original que el usuario corrigió

        Returns:
            Dict con la preferencia extraída {clave, valor, tipo}
        """
        deepseek = self._get_provider(ProviderType.DEEPSEEK, user_context)
        if not deepseek:
            return {}

        extraction_prompt = f"""Analiza este feedback del usuario y extrae la preferencia subyacente.

RESPUESTA ORIGINAL DEL BOT:
{original_response[:500]}

FEEDBACK/CORRECCIÓN DEL USUARIO:
{feedback}

Extrae la preferencia en formato JSON con esta estructura:
{{"clave": "nombre_corto_preferencia", "valor": "descripcion_de_la_preferencia", "tipo": "estilo|tono|formato|contenido"}}

Ejemplos:
- "No seas tan formal" -> {{"clave": "tono_preferido", "valor": "casual y cercano", "tipo": "tono"}}
- "Más emojis" -> {{"clave": "uso_emojis", "valor": "usar emojis frecuentemente", "tipo": "formato"}}

Responde SOLO con el JSON, sin explicaciones."""

        response = await deepseek.generate(
            prompt=extraction_prompt,
            temperature=0.3,
            max_tokens=200
        )

        if response.success:
            try:
                import re
                json_match = re.search(r'\{[^}]+\}', response.content)
                if json_match:
                    return json.loads(json_match.group())
            except json.JSONDecodeError:
                pass

        return {}


# ============================================================================
# EJEMPLO DE USO
# ============================================================================

async def example_usage():
    """Ejemplo de cómo usar el CouncilOfWiseMen."""

    # Credenciales del sistema (normalmente de variables de entorno)
    system_credentials = {
        "deepseek": "sk-xxx",
        "perplexity": "pplx-xxx",
        "openai": "sk-xxx",
        "anthropic": "sk-ant-xxx"
    }

    # Inicializar el Consejo
    council = CouncilOfWiseMen(system_credentials)

    # Contexto del usuario (normalmente viene de la BD)
    user_context = UserContext(
        user_id="user-123",
        telegram_id=123456789,
        bio_entrenamiento={
            "descripcion_personal": "Soy Kevin, miembro del comité ejecutivo de SALF",
            "tono_preferido": "directo, sin filtros, crítico con el establishment",
            "valores": ["Transparencia", "Anti-corrupción"],
            "temas_principales": ["Política", "Economía"],
            "hashtags_fijos": ["#SALF", "#SeAcabóLaFiesta"]
        },
        memoria=[
            {"clave": "tono_preferido", "valor": "evitar ser demasiado formal"}
        ],
        plan="pro",
        creditos_disponibles=500,
        api_keys={
            "perplexity": "pplx-user-xxx"  # El usuario tiene su propia API key
        }
    )

    # Ejemplo 1: Modo FAST
    result_fast = await council.process(
        prompt="Analiza la última decisión del BCE sobre tipos de interés",
        user_context=user_context,
        mode=SwarmMode.FAST
    )
    print(f"FAST: {result_fast.final_response[:200]}...")
    print(f"Créditos: {result_fast.credits_consumed}")

    # Ejemplo 2: Modo CONSENSUS
    result_consensus = await council.process(
        prompt="Analiza en profundidad la reforma fiscal propuesta",
        user_context=user_context,
        mode=SwarmMode.CONSENSUS
    )
    print(f"CONSENSUS: {result_consensus.final_response[:200]}...")
    print(f"Créditos: {result_consensus.credits_consumed}")

    # Ejemplo 3: Modo CREATIVE
    result_creative = await council.process(
        prompt="La inflación y cómo afecta a los españoles",
        user_context=user_context,
        mode=SwarmMode.CREATIVE,
        content_type="reel"
    )
    print(f"CREATIVE: {result_creative.final_response[:200]}...")
    print(f"Créditos: {result_creative.credits_consumed}")


if __name__ == "__main__":
    asyncio.run(example_usage())
