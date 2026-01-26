export function Features() {
  const features = [
    {
      icon: "🧠",
      title: "Consejo de Sabios",
      description:
        "4 IAs analizan tu consulta y llegan a un consenso. Resultados más precisos y equilibrados que cualquier IA individual.",
    },
    {
      icon: "⚡",
      title: "Modo FAST",
      description:
        "¿Necesitas una respuesta rápida? El modo FAST usa una sola IA para respuestas instantáneas por solo 1 crédito.",
    },
    {
      icon: "👤",
      title: "Perfil de Entrenamiento",
      description:
        "Configura tu tono, valores y estilo. La IA genera contenido que suena exactamente como tú.",
    },
    {
      icon: "🔑",
      title: "BYOA (Bring Your Own API)",
      description:
        "Usa tus propias API keys para costes aún menores. Compatible con OpenAI, Anthropic, DeepSeek y Perplexity.",
    },
    {
      icon: "📱",
      title: "Telegram + Web",
      description:
        "Genera contenido desde Telegram o gestiona todo desde el dashboard web. Sincronización perfecta.",
    },
    {
      icon: "📊",
      title: "Historial y Analytics",
      description:
        "Revisa todo tu contenido generado. Aprende qué funciona mejor con insights detallados.",
    },
  ];

  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-800/50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Todo lo que necesitas para crear contenido con IA
          </h2>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Una plataforma completa que combina lo mejor de múltiples IAs
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-slate-900/50 border border-slate-700 rounded-xl p-6 hover:border-blue-500/50 transition"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-slate-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
