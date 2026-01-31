"""
Agent Pilot Bot - Supabase Database Client
==========================================
Database operations for users, credits, and transactions.
Replace this placeholder with your complete supabase_client.py
"""

from typing import Optional
from supabase import create_client, Client

from config import settings


class SupabaseClient:
    """Client for interacting with Supabase database."""

    _instance: Optional["SupabaseClient"] = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._client = create_client(
                settings.supabase_url,
                settings.supabase_key
            )
        return cls._instance

    @property
    def client(self) -> Client:
        return self._client

    # ---- User Operations ----

    async def get_user_by_telegram_id(self, telegram_id: int) -> Optional[dict]:
        """Get user by Telegram user ID."""
        response = self.client.table("usuarios_pro").select("*").eq(
            "telegram_user_id", telegram_id
        ).maybe_single().execute()
        return response.data

    async def get_user_by_email(self, email: str) -> Optional[dict]:
        """Get user by email."""
        response = self.client.table("usuarios_pro").select("*").eq(
            "email", email
        ).maybe_single().execute()
        return response.data

    async def create_user(self, telegram_id: int, **kwargs) -> dict:
        """Create a new user from Telegram with welcome credits."""
        data = {
            "telegram_user_id": telegram_id,
            "creditos_disponibles": 50,  # Welcome credits
            "plan_actual": "free",
            **kwargs
        }
        response = self.client.table("usuarios_pro").insert(data).execute()

        # Record welcome transaction
        if response.data:
            user = response.data[0]
            self.client.table("transacciones").insert({
                "usuario_id": user["id"],
                "tipo": "bienvenida",
                "creditos": 50,
                "concepto": "Creditos de bienvenida",
            }).execute()

        return response.data[0]

    async def update_user(self, user_id: str, **kwargs) -> dict:
        """Update user data."""
        response = self.client.table("usuarios_pro").update(kwargs).eq(
            "id", user_id
        ).execute()
        return response.data[0]

    async def link_telegram_to_user(
        self, user_id: str, telegram_id: int
    ) -> dict:
        """Link a Telegram account to an existing web user."""
        return await self.update_user(user_id, telegram_user_id=telegram_id)

    # ---- Credit Operations ----

    async def get_credits(self, user_id: str) -> int:
        """Get user's current credit balance."""
        response = self.client.table("usuarios_pro").select(
            "creditos_disponibles"
        ).eq("id", user_id).single().execute()
        return response.data["creditos_disponibles"]

    async def deduct_credits(self, user_id: str, amount: int, concepto: str) -> bool:
        """Deduct credits from user's balance. Returns False if insufficient."""
        # Get current balance
        current = await self.get_credits(user_id)
        if current < amount:
            return False

        # Deduct and record transaction
        new_balance = current - amount
        await self.update_user(user_id, creditos_disponibles=new_balance)

        # Record transaction
        self.client.table("transacciones").insert({
            "usuario_id": user_id,
            "tipo": "consumo",
            "creditos": -amount,
            "concepto": concepto,
        }).execute()

        return True

    async def add_credits(
        self, user_id: str, amount: int, concepto: str,
        stripe_payment_id: Optional[str] = None
    ) -> int:
        """Add credits to user's balance. Returns new balance."""
        current = await self.get_credits(user_id)
        new_balance = current + amount
        await self.update_user(user_id, creditos_disponibles=new_balance)

        # Record transaction
        self.client.table("transacciones").insert({
            "usuario_id": user_id,
            "tipo": "compra",
            "creditos": amount,
            "concepto": concepto,
            "stripe_payment_id": stripe_payment_id,
        }).execute()

        return new_balance

    # ---- Linking Code Operations ----

    async def get_user_by_link_code(self, code: str) -> Optional[dict]:
        """Get user by their linking code (for Telegram ↔ Web)."""
        response = self.client.table("usuarios_pro").select("*").eq(
            "codigo_vinculacion", code
        ).maybe_single().execute()

        if response.data:
            # Check if code is expired
            # TODO: Add expiration check
            pass

        return response.data


# Global instance
db = SupabaseClient()
