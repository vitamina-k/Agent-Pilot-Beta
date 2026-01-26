"""
Agent Pilot Bot - User Model
============================
Pydantic models for user data.
Replace this placeholder with your complete user.py
"""

from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field
from enum import Enum


class PlanType(str, Enum):
    FREE = "free"
    STARTER = "starter"
    PRO = "pro"
    ENTERPRISE = "enterprise"


class EstadoUsuario(str, Enum):
    ACTIVO = "activo"
    SUSPENDIDO = "suspendido"
    PENDIENTE = "pendiente"


class BioEntrenamiento(BaseModel):
    """User's AI training profile."""
    descripcion_personal: Optional[str] = None
    tono_preferido: Optional[str] = None
    valores: List[str] = Field(default_factory=list)
    temas_principales: List[str] = Field(default_factory=list)
    hashtags_fijos: List[str] = Field(default_factory=list)
    estilo_escritura: Optional[str] = None  # casual, formal, agresivo, neutral
    audiencia_objetivo: Optional[str] = None
    idioma_principal: str = "es"
    ejemplos_estilo: List[str] = Field(default_factory=list)


class Usuario(BaseModel):
    """Main user model."""
    id: str
    telegram_user_id: Optional[int] = None
    email: Optional[str] = None
    bio_entrenamiento: BioEntrenamiento = Field(default_factory=BioEntrenamiento)
    creditos_disponibles: int = 100
    plan_actual: PlanType = PlanType.FREE
    estado: EstadoUsuario = EstadoUsuario.ACTIVO
    codigo_vinculacion: Optional[str] = None
    stripe_customer_id: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: Optional[datetime] = None

    @property
    def is_linked(self) -> bool:
        """Check if user has both Telegram and Web accounts linked."""
        return self.telegram_user_id is not None and self.email is not None

    @property
    def can_use_consensus(self) -> bool:
        """Check if user's plan allows AI consensus."""
        return self.plan_actual != PlanType.FREE

    @property
    def has_credits(self) -> bool:
        """Check if user has any credits remaining."""
        return self.creditos_disponibles > 0


class CredencialAPI(BaseModel):
    """User's own API credentials (BYOA)."""
    id: str
    usuario_id: str
    proveedor: str  # openai, anthropic, deepseek, perplexity
    api_key_encrypted: str
    es_activa: bool = True


class Transaccion(BaseModel):
    """Credit transaction record."""
    id: str
    usuario_id: str
    tipo: str  # compra, consumo, bonus, reembolso
    creditos: int
    concepto: str
    stripe_payment_id: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.now)
