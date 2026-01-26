"use client";

import { useState } from "react";
import Link from "next/link";
import { PLANS, type PlanId } from "@/lib/stripe";

export default function CheckoutPage() {
  const [selectedPlan, setSelectedPlan] = useState<PlanId>("pro");
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);

    try {
      const response = await fetch("/api/stripe/create-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ planId: selectedPlan }),
      });

      const { url, error } = await response.json();

      if (error) {
        alert(error);
        setLoading(false);
        return;
      }

      // Redirect to Stripe Checkout
      window.location.href = url;
    } catch (err) {
      console.error(err);
      alert("Error al procesar el pago");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <Link href="/" className="inline-flex items-center gap-2 mb-8">
            <span className="text-3xl">🤖</span>
            <span className="text-2xl font-bold text-white">Agent Pilot</span>
          </Link>
          <h1 className="text-3xl font-bold text-white mb-4">
            Elige tu plan
          </h1>
          <p className="text-slate-300">
            Desbloquea todo el potencial del Consejo de Sabios
          </p>
        </div>

        {/* Plans */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {(["starter", "pro", "enterprise"] as PlanId[]).map((planId) => {
            const plan = PLANS[planId];
            const isSelected = selectedPlan === planId;

            return (
              <button
                key={planId}
                onClick={() => setSelectedPlan(planId)}
                className={`p-6 rounded-xl text-left transition ${
                  isSelected
                    ? "bg-blue-600 border-2 border-blue-400"
                    : "bg-slate-800 border-2 border-slate-700 hover:border-slate-600"
                }`}
              >
                {planId === "pro" && (
                  <span className="inline-block bg-blue-400 text-blue-900 text-xs font-bold px-2 py-1 rounded mb-3">
                    MÁS POPULAR
                  </span>
                )}
                <h3 className="text-xl font-bold text-white mb-1">
                  {plan.name}
                </h3>
                <div className="mb-4">
                  <span className="text-3xl font-bold text-white">
                    €{plan.price}
                  </span>
                  <span className="text-slate-300">/mes</span>
                </div>
                <p className="text-slate-300 mb-4">
                  {plan.credits.toLocaleString()} créditos/mes
                </p>
                <ul className="space-y-2">
                  {plan.features.map((feature, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-2 text-sm text-slate-300"
                    >
                      <svg
                        className="w-4 h-4 text-green-400 flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </button>
            );
          })}
        </div>

        {/* Checkout button */}
        <div className="text-center">
          <button
            onClick={handleCheckout}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white px-12 py-4 rounded-lg text-lg font-semibold transition shadow-lg shadow-blue-600/25"
          >
            {loading
              ? "Procesando..."
              : `Continuar con ${PLANS[selectedPlan].name} - €${PLANS[selectedPlan].price}/mes`}
          </button>
          <p className="text-slate-400 text-sm mt-4">
            Pago seguro con Stripe. Cancela cuando quieras.
          </p>
        </div>

        {/* Back link */}
        <div className="text-center mt-8">
          <Link href="/dashboard" className="text-slate-400 hover:text-white">
            ← Volver al dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
