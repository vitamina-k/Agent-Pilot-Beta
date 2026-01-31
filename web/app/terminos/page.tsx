import Link from "next/link";
import { Bot, ArrowLeft } from "lucide-react";

export default function TerminosPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-slate-900/80 backdrop-blur-sm border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <Bot className="w-8 h-8 text-blue-400" />
              <span className="text-xl font-bold text-white">Agent Pilot</span>
            </Link>
            <Link
              href="/"
              className="flex items-center gap-2 text-slate-300 hover:text-white transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver
            </Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-8">
            Términos y Condiciones
          </h1>

          <div className="prose prose-invert prose-slate max-w-none space-y-6">
            <p className="text-slate-300 text-lg">
              Última actualización: Enero 2026
            </p>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">
                1. Aceptación de los Términos
              </h2>
              <p className="text-slate-300">
                Al acceder y utilizar Agent Pilot, aceptas estos términos y condiciones
                en su totalidad. Si no estás de acuerdo con alguna parte de estos términos,
                no debes utilizar nuestro servicio.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">
                2. Descripción del Servicio
              </h2>
              <p className="text-slate-300">
                Agent Pilot es una plataforma de generación de contenido mediante
                inteligencia artificial. Ofrecemos:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2">
                <li>Generación de contenido mediante el Consejo de Sabios (múltiples IAs)</li>
                <li>Modo FAST para respuestas rápidas con una sola IA</li>
                <li>Personalización mediante perfiles de entrenamiento</li>
                <li>Acceso vía Telegram y plataforma web</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">
                3. Cuentas de Usuario
              </h2>
              <p className="text-slate-300">
                Para usar Agent Pilot necesitas crear una cuenta. Eres responsable de:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2">
                <li>Mantener la confidencialidad de tus credenciales</li>
                <li>Todas las actividades realizadas bajo tu cuenta</li>
                <li>Notificarnos inmediatamente de cualquier uso no autorizado</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">
                4. Planes y Pagos
              </h2>
              <p className="text-slate-300">
                Ofrecemos diferentes planes de suscripción:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2">
                <li><strong>Free:</strong> 50 créditos/mes, funcionalidad limitada</li>
                <li><strong>Starter:</strong> 9€/mes, 100 créditos</li>
                <li><strong>Pro:</strong> 29,90€/mes, 500 créditos</li>
                <li><strong>Enterprise:</strong> 99€/mes, 2000 créditos</li>
              </ul>
              <p className="text-slate-300">
                Los pagos se procesan de forma segura mediante Stripe. Los precios
                incluyen IVA (21%) para clientes en España.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">
                5. Créditos y Renovación
              </h2>
              <p className="text-slate-300">
                Los créditos incluidos en tu plan se renuevan mensualmente en la fecha
                de suscripción. Los créditos no utilizados no se acumulan al siguiente
                período. Los créditos comprados por separado sí se acumulan.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">
                6. Cancelación y Reembolsos
              </h2>
              <p className="text-slate-300">
                Puedes cancelar tu suscripción en cualquier momento. La cancelación
                será efectiva al final del período de facturación actual. No ofrecemos
                reembolsos por períodos parciales, excepto cuando lo requiera la ley.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">
                7. Uso Aceptable
              </h2>
              <p className="text-slate-300">
                Te comprometes a no utilizar Agent Pilot para:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2">
                <li>Generar contenido ilegal, difamatorio o dañino</li>
                <li>Infringir derechos de propiedad intelectual</li>
                <li>Spam o actividades de marketing no solicitadas</li>
                <li>Intentar acceder a sistemas sin autorización</li>
                <li>Compartir tu cuenta con terceros</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">
                8. Propiedad del Contenido
              </h2>
              <p className="text-slate-300">
                El contenido generado mediante Agent Pilot te pertenece. Sin embargo,
                nos reservamos el derecho de usar datos anonimizados para mejorar
                nuestros servicios. No reclamamos propiedad sobre tu contenido original
                o el contenido generado.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">
                9. Limitación de Responsabilidad
              </h2>
              <p className="text-slate-300">
                Agent Pilot se proporciona &quot;tal cual&quot;. No garantizamos que el servicio
                sea ininterrumpido o libre de errores. No nos hacemos responsables de:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2">
                <li>Pérdidas derivadas del uso del servicio</li>
                <li>Contenido generado por las IAs</li>
                <li>Interrupciones del servicio</li>
                <li>Pérdida de datos</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">
                10. Modificaciones
              </h2>
              <p className="text-slate-300">
                Nos reservamos el derecho de modificar estos términos en cualquier momento.
                Te notificaremos de cambios significativos por email. El uso continuado
                del servicio después de los cambios constituye aceptación de los nuevos términos.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">
                11. Ley Aplicable
              </h2>
              <p className="text-slate-300">
                Estos términos se rigen por las leyes de España. Cualquier disputa
                se someterá a los tribunales de Madrid.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">
                12. Contacto
              </h2>
              <p className="text-slate-300">
                Para cualquier consulta sobre estos términos:
                <br />
                <a
                  href="mailto:legal@agentpilot.es"
                  className="text-blue-400 hover:text-blue-300"
                >
                  legal@agentpilot.es
                </a>
              </p>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-700 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-slate-400 text-sm">
            © 2026 Agent Pilot. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
