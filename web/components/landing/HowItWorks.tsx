import { MessageSquare, Settings, PenLine, Brain, Sparkles, Send, Play } from "lucide-react";

export function HowItWorks() {
  const steps = [
    {
      number: "1",
      title: "Conecta con el Bot",
      description:
        "Abre Telegram y busca @AgentPilotx_Bot. Envía /start para comenzar. En segundos tendrás acceso al Consejo de Sabios.",
      icon: MessageSquare,
    },
    {
      number: "2",
      title: "Configura tu Perfil",
      description:
        "Define tu tono, valores y estilo de comunicación. El bot aprenderá a generar contenido que suena exactamente como tú.",
      icon: Settings,
    },
    {
      number: "3",
      title: "Haz tu Consulta",
      description:
        "Escribe lo que necesitas: un post para LinkedIn, un hilo de Twitter, ideas de contenido, análisis de mercado... lo que sea.",
      icon: PenLine,
    },
    {
      number: "4",
      title: "El Consejo Delibera",
      description:
        "4 IAs analizan tu consulta de forma independiente. DeepSeek, Perplexity, GPT-4 y Claude trabajan en paralelo.",
      icon: Brain,
    },
    {
      number: "5",
      title: "Consenso Inteligente",
      description:
        "Las respuestas se sintetizan en un resultado final que combina lo mejor de cada IA. Más preciso y equilibrado.",
      icon: Sparkles,
    },
    {
      number: "6",
      title: "Contenido Listo",
      description:
        "Recibe tu contenido personalizado en segundos. Copia, edita si quieres, y publica. Así de simple.",
      icon: Send,
    },
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            ¿Cómo funciona Agent Pilot?
          </h2>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            De tu idea a contenido publicable en 6 simples pasos
          </p>
        </div>

        <div className="relative">
          {/* Connection line - hidden on mobile */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 via-purple-500 to-blue-600 transform -translate-y-1/2" />

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div
                key={index}
                className="relative bg-slate-800/80 border border-slate-700 rounded-xl p-6 hover:border-blue-500/50 transition group"
              >
                {/* Step number badge */}
                <div className="absolute -top-4 left-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-lg">
                  {step.number}
                </div>

                <div className="pt-4">
                  <step.icon className="w-10 h-10 text-blue-400 mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {step.title}
                  </h3>
                  <p className="text-slate-400">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Demo video placeholder */}
        <div className="mt-16 bg-slate-800/50 rounded-xl border border-slate-700 p-8 text-center">
          <div className="max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-4">
              Mira cómo funciona en 2 minutos
            </h3>
            <p className="text-slate-300 mb-6">
              Un ejemplo real de cómo el Consejo de Sabios genera contenido de alta calidad
            </p>
            <div className="aspect-video bg-slate-900 rounded-lg flex items-center justify-center border border-slate-600">
              <div className="text-center">
                <Play className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                <p className="text-slate-400">Demo próximamente</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
