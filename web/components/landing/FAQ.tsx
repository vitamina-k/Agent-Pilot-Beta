"use client";

import { useState } from "react";

export function FAQ() {
  const faqs = [
    {
      question: "¿Qué es el Consejo de Sabios?",
      answer:
        "Es nuestro sistema de consenso de IA. Cuando usas el modo Consenso, 4 IAs diferentes (DeepSeek, Perplexity, GPT-4 y Claude) analizan tu consulta de forma independiente y luego sintetizan una respuesta que combina lo mejor de cada una. El resultado es más preciso y equilibrado que usar una sola IA.",
    },
    {
      question: "¿Qué diferencia hay entre modo FAST y Consenso?",
      answer:
        "El modo FAST usa una sola IA para respuestas rápidas (1 crédito). Es ideal para tareas simples. El modo Consenso usa 4 IAs y cuesta 5 créditos, pero ofrece respuestas más completas y equilibradas. Ideal para contenido importante o análisis complejos.",
    },
    {
      question: "¿Qué es BYOA?",
      answer:
        "BYOA significa 'Bring Your Own API' (Trae tu propia API). Puedes configurar tus propias API keys de OpenAI, Anthropic, DeepSeek o Perplexity. Esto te permite usar las IAs a coste de proveedor, sin pasar por nuestros créditos.",
    },
    {
      question: "¿Cómo funciona la vinculación Telegram ↔ Web?",
      answer:
        "Puedes empezar desde Telegram o desde la web. Si empiezas en Telegram, recibirás un código de vinculación que puedes usar en la web. Si empiezas en la web, el bot te pedirá tu email o código para vincular. Una vez vinculado, todo se sincroniza automáticamente.",
    },
    {
      question: "¿Qué es el perfil de entrenamiento?",
      answer:
        "Es tu perfil personalizado que la IA usa para generar contenido. Incluye tu descripción, tono preferido, valores, temas principales, hashtags, y estilo de escritura. Cuanto más completo esté, mejor será el contenido generado.",
    },
    {
      question: "¿Los créditos caducan?",
      answer:
        "Los créditos de tu plan mensual se renuevan cada mes. Los créditos no usados no se acumulan. Si compras créditos extra, esos sí se acumulan y no caducan.",
    },
    {
      question: "¿Puedo cambiar de plan?",
      answer:
        "Sí, puedes subir o bajar de plan en cualquier momento. Si subes, el cambio es inmediato y se te cobran los días restantes del mes. Si bajas, el cambio se aplica en tu próxima renovación.",
    },
  ];

  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-800/50">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Preguntas frecuentes
          </h2>
          <p className="text-xl text-slate-300">
            Todo lo que necesitas saber sobre Agent Pilot
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-slate-900/50 border border-slate-700 rounded-xl overflow-hidden"
            >
              <button
                className="w-full px-6 py-4 flex justify-between items-center text-left"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <span className="font-semibold text-white">{faq.question}</span>
                <svg
                  className={`w-5 h-5 text-slate-400 transition-transform ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {openIndex === index && (
                <div className="px-6 pb-4">
                  <p className="text-slate-300">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
