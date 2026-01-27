import Stripe from "stripe";

// Initialize Stripe server-side client
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27.acacia",
  typescript: true,
});

// Plan types
export type PlanId = "starter" | "pro" | "enterprise";

export interface Plan {
  id: PlanId;
  name: string;
  price: number;
  priceId: string | null;
  credits: number;
  features: string[];
}

// Plans configuration
// Note: Replace priceId values with your actual Stripe Price IDs from the dashboard
export const PLANS: Record<PlanId, Plan> = {
  starter: {
    id: "starter",
    name: "Starter",
    price: 9,
    priceId: process.env.STRIPE_PRICE_STARTER || null,
    credits: 100,
    features: [
      "100 consultas/mes",
      "Acceso a 3 sabios",
      "Respuestas en 30 segundos",
      "Soporte por email",
    ],
  },
  pro: {
    id: "pro",
    name: "Pro",
    price: 29,
    priceId: process.env.STRIPE_PRICE_PRO || null,
    credits: 500,
    features: [
      "500 consultas/mes",
      "Acceso a todos los sabios",
      "Respuestas prioritarias",
      "Historial ilimitado",
      "Soporte prioritario",
    ],
  },
  enterprise: {
    id: "enterprise",
    name: "Enterprise",
    price: 99,
    priceId: process.env.STRIPE_PRICE_ENTERPRISE || null,
    credits: 2000,
    features: [
      "2000 consultas/mes",
      "Acceso a todos los sabios",
      "Respuestas instantáneas",
      "API access",
      "Soporte dedicado 24/7",
      "Personalización de sabios",
    ],
  },
};
