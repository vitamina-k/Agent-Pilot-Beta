import Link from "next/link";

export function Hero() {
  return (
    <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2 mb-8">
          <span className="text-blue-400 text-sm font-medium">🧠 Consejo de Sabios</span>
          <span className="text-slate-400 text-sm">Múltiples IAs en consenso</span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
          Tu asistente de IA con
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
            {" "}múltiples cerebros
          </span>
        </h1>

        {/* Subheadline */}
        <p className="text-xl text-slate-300 max-w-3xl mx-auto mb-10">
          Agent Pilot combina DeepSeek, Perplexity, GPT-4 y Claude para generar
          contenido personalizado con el poder del consenso inteligente.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Link
            href="/register"
            className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-lg text-lg font-semibold transition shadow-lg shadow-blue-600/25"
          >
            Empezar gratis →
          </Link>
          <a
            href="https://t.me/AgentPilotBot"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-slate-700 hover:bg-slate-600 text-white px-8 py-4 rounded-lg text-lg font-semibold transition flex items-center justify-center gap-2"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295l.213-3.053 5.56-5.023c.242-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.828.94z" />
            </svg>
            Probar en Telegram
          </a>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="text-3xl font-bold text-white">4</div>
            <div className="text-slate-400">IAs en consenso</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white">50</div>
            <div className="text-slate-400">Créditos gratis</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white">&lt;3s</div>
            <div className="text-slate-400">Respuesta FAST</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white">BYOA</div>
            <div className="text-slate-400">Usa tus API keys</div>
          </div>
        </div>
      </div>
    </section>
  );
}
