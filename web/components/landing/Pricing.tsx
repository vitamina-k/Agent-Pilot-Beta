import Link from "next/link";

export function Pricing() {
  const plans = [
    {
      name: "Free",
      price: "0",
      credits: "50",
      description: "Perfecto para probar",
      features: [
        "50 créditos/mes",
        "Solo modo FAST",
        "Soporte por email",
      ],
      cta: "Empezar gratis",
      highlighted: false,
    },
    {
      name: "Starter",
      price: "9",
      credits: "100",
      description: "Para empezar a crear",
      features: [
        "100 créditos/mes",
        "Acceso a 3 sabios",
        "Respuestas en 30 segundos",
        "Soporte por email",
      ],
      cta: "Elegir Starter",
      highlighted: false,
    },
    {
      name: "Pro",
      price: "29.90",
      credits: "500",
      description: "Para creadores activos",
      features: [
        "500 créditos/mes",
        "Acceso a todos los sabios",
        "Respuestas prioritarias",
        "Historial ilimitado",
        "Soporte prioritario",
      ],
      cta: "Elegir Pro",
      highlighted: true,
    },
    {
      name: "Enterprise",
      price: "99",
      credits: "2000",
      description: "Para equipos y agencias",
      features: [
        "2000 créditos/mes",
        "Acceso a todos los sabios",
        "Respuestas instantáneas",
        "API access",
        "Soporte dedicado 24/7",
      ],
      cta: "Contactar",
      highlighted: false,
    },
  ];

  return (
    <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Planes simples y transparentes
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Elige el plan que mejor se adapte a tus necesidades
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`rounded-2xl p-6 transition-all duration-300 ${
                plan.highlighted
                  ? "bg-white text-gray-900 scale-105 shadow-2xl"
                  : "bg-gray-800/50 border border-gray-700 text-white hover:border-gray-600"
              }`}
            >
              {plan.highlighted && (
                <div className="text-center mb-4">
                  <span className="bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    MÁS POPULAR
                  </span>
                </div>
              )}
              <h3 className={`text-xl font-bold mb-1 ${plan.highlighted ? "text-gray-900" : "text-white"}`}>
                {plan.name}
              </h3>
              <p className={`text-sm mb-4 ${plan.highlighted ? "text-gray-600" : "text-gray-400"}`}>
                {plan.description}
              </p>
              <div className="mb-6">
                <span className={`text-4xl font-bold ${plan.highlighted ? "text-gray-900" : "text-white"}`}>
                  €{plan.price}
                </span>
                <span className={plan.highlighted ? "text-gray-500" : "text-gray-400"}>/mes</span>
              </div>
              <div className={`text-sm mb-6 ${plan.highlighted ? "text-gray-600" : "text-gray-300"}`}>
                <span className={`font-semibold ${plan.highlighted ? "text-gray-900" : "text-white"}`}>
                  {plan.credits}
                </span>{" "}
                créditos/mes
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li
                    key={featureIndex}
                    className={`flex items-center gap-2 text-sm ${
                      plan.highlighted ? "text-gray-600" : "text-gray-300"
                    }`}
                  >
                    <svg
                      className={`w-5 h-5 flex-shrink-0 ${
                        plan.highlighted ? "text-blue-500" : "text-green-400"
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                href={plan.name === "Enterprise" ? "/contacto" : "/register"}
                className={`block w-full text-center py-3 rounded-full font-semibold transition ${
                  plan.highlighted
                    ? "bg-blue-500 text-white hover:bg-blue-600"
                    : "bg-gray-700 text-white hover:bg-gray-600"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        {/* Credit costs */}
        <div className="mt-16 bg-gray-800/50 rounded-2xl p-8 border border-gray-700">
          <h3 className="text-xl font-bold text-white mb-6 text-center">
            Costes por operación
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-2xl font-bold text-white">1</div>
              <div className="text-gray-400 text-sm">crédito</div>
              <div className="text-gray-300 mt-1">Modo FAST</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">5</div>
              <div className="text-gray-400 text-sm">créditos</div>
              <div className="text-gray-300 mt-1">Consenso</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">10</div>
              <div className="text-gray-400 text-sm">créditos</div>
              <div className="text-gray-300 mt-1">Análisis profundo</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">2</div>
              <div className="text-gray-400 text-sm">créditos</div>
              <div className="text-gray-300 mt-1">Post social</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
