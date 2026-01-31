import Link from "next/link";

export function Hero() {
  return (
    <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-full px-4 py-2 mb-8">
          <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <span className="text-blue-600 text-sm font-medium">Consejo de Sabios</span>
          <span className="text-gray-500 text-sm">4 IAs en consenso</span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
          Tu asistente de IA con
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600">
            {" "}múltiples cerebros
          </span>
        </h1>

        {/* Subheadline */}
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10">
          Agent Pilot combina DeepSeek, Perplexity, GPT-4 y Claude para generar
          contenido personalizado con el poder del consenso inteligente.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Link
            href="/register"
            className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-full text-lg font-semibold transition shadow-lg shadow-blue-500/25"
          >
            Empezar gratis
          </Link>
          <a
            href="https://t.me/AgentPilotBot"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white hover:bg-gray-50 text-gray-700 px-8 py-4 rounded-full text-lg font-semibold transition border border-gray-200 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295l.213-3.053 5.56-5.023c.242-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.828.94z" />
            </svg>
            Probar en Telegram
          </a>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <div className="text-3xl font-bold text-gray-900">4</div>
            <div className="text-gray-500 text-sm">IAs en consenso</div>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <div className="text-3xl font-bold text-gray-900">50</div>
            <div className="text-gray-500 text-sm">Créditos gratis</div>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <div className="text-3xl font-bold text-gray-900">&lt;3s</div>
            <div className="text-gray-500 text-sm">Respuesta FAST</div>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <div className="text-3xl font-bold text-gray-900">BYOA</div>
            <div className="text-gray-500 text-sm">Usa tus API keys</div>
          </div>
        </div>
      </div>
    </section>
  );
}
