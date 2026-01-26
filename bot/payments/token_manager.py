"""
Agent Pilot Bot - Token/Credit Manager
======================================
Manages credit operations and Stripe integration.
"""

from typing import Optional
from database.supabase_client import db
from config import CREDIT_COSTS, PLAN_LIMITS


class TokenManager:
    """Manages user credits and token operations."""

    @staticmethod
    async def check_and_deduct(
        user_id: str,
        operation: str,
        custom_cost: Optional[int] = None
    ) -> tuple[bool, int]:
        """
        Check if user has enough credits and deduct if so.

        Args:
            user_id: User UUID
            operation: Operation type (fast, consensus, etc.)
            custom_cost: Override default cost

        Returns:
            Tuple of (success, remaining_credits)
        """
        cost = custom_cost or CREDIT_COSTS.get(operation, 1)

        success = await db.deduct_credits(user_id, cost, f"Operación: {operation}")

        if success:
            remaining = await db.get_credits(user_id)
            return True, remaining

        return False, 0

    @staticmethod
    async def add_purchase_credits(
        user_id: str,
        amount: int,
        stripe_payment_id: str
    ) -> int:
        """
        Add credits from a purchase.

        Args:
            user_id: User UUID
            amount: Credits to add
            stripe_payment_id: Stripe payment/session ID

        Returns:
            New credit balance
        """
        return await db.add_credits(
            user_id,
            amount,
            "Compra de créditos",
            stripe_payment_id
        )

    @staticmethod
    async def add_subscription_credits(user_id: str, plan: str) -> int:
        """
        Add monthly credits from subscription.

        Args:
            user_id: User UUID
            plan: Plan type

        Returns:
            New credit balance
        """
        credits = PLAN_LIMITS.get(plan, {}).get("credits_monthly", 0)

        return await db.add_credits(
            user_id,
            credits,
            f"Créditos mensuales plan {plan}"
        )

    @staticmethod
    async def refund_credits(user_id: str, amount: int, reason: str) -> int:
        """
        Refund credits to user.

        Args:
            user_id: User UUID
            amount: Credits to refund
            reason: Refund reason

        Returns:
            New credit balance
        """
        return await db.add_credits(
            user_id,
            amount,
            f"Reembolso: {reason}"
        )


# Global instance
token_manager = TokenManager()
