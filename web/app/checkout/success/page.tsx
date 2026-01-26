import Link from "next/link";

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center px-4">
      <div className="max-w-md text-center">
        <div className="text-6xl mb-6">🎉</div>
        <h1 className="text-3xl font-bold text-white mb-4">
          ¡Pago completado!
        </h1>
        <p className="text-slate-300 mb-8">
          Tu suscripción está activa. Los créditos ya están disponibles en tu
          cuenta. ¡Empieza a crear contenido increíble!
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/dashboard"
            className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-lg font-semibold transition"
          >
            Ir al Dashboard
          </Link>
          <a
            href="https://t.me/AgentPilotBot"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-slate-700 hover:bg-slate-600 text-white px-8 py-3 rounded-lg font-semibold transition"
          >
            Abrir Telegram
          </a>
        </div>
      </div>
    </div>
  );
}
