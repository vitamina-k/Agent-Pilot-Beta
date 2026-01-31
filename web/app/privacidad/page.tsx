import Link from "next/link";
import { Bot, ArrowLeft } from "lucide-react";

export default function PrivacidadPage() {
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
            Política de Privacidad
          </h1>

          <div className="prose prose-invert prose-slate max-w-none space-y-6">
            <p className="text-slate-300 text-lg">
              Última actualización: Enero 2026
            </p>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">
                1. Información que Recopilamos
              </h2>
              <p className="text-slate-300">
                En Agent Pilot recopilamos la siguiente información:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2">
                <li>Información de cuenta: email, nombre de usuario</li>
                <li>Datos de uso: consultas realizadas, historial de contenido generado</li>
                <li>Información de pago: procesada de forma segura por Stripe</li>
                <li>Datos de Telegram: ID de usuario para vincular cuentas</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">
                2. Uso de la Información
              </h2>
              <p className="text-slate-300">
                Utilizamos tu información para:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2">
                <li>Proporcionar y mejorar nuestros servicios</li>
                <li>Procesar pagos y gestionar suscripciones</li>
                <li>Personalizar la generación de contenido según tu perfil</li>
                <li>Comunicarnos contigo sobre actualizaciones del servicio</li>
                <li>Cumplir con obligaciones legales</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">
                3. Compartir Información
              </h2>
              <p className="text-slate-300">
                No vendemos tu información personal. Solo compartimos datos con:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2">
                <li>Proveedores de IA (OpenAI, Anthropic, etc.) para procesar consultas</li>
                <li>Stripe para procesamiento de pagos</li>
                <li>Supabase para almacenamiento de datos</li>
                <li>Autoridades legales cuando sea requerido por ley</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">
                4. Seguridad de Datos
              </h2>
              <p className="text-slate-300">
                Implementamos medidas de seguridad estándar de la industria para proteger
                tu información, incluyendo encriptación en tránsito y en reposo,
                autenticación segura y acceso limitado a datos personales.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">
                5. Tus Derechos (RGPD)
              </h2>
              <p className="text-slate-300">
                Como usuario en la Unión Europea, tienes derecho a:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2">
                <li>Acceder a tus datos personales</li>
                <li>Rectificar datos inexactos</li>
                <li>Solicitar la eliminación de tus datos</li>
                <li>Oponerte al procesamiento de tus datos</li>
                <li>Exportar tus datos (portabilidad)</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">
                6. Retención de Datos
              </h2>
              <p className="text-slate-300">
                Mantenemos tus datos mientras tu cuenta esté activa. Puedes solicitar
                la eliminación de tu cuenta y datos en cualquier momento contactándonos.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">
                7. Cookies
              </h2>
              <p className="text-slate-300">
                Utilizamos cookies esenciales para el funcionamiento del servicio
                y cookies de autenticación para mantener tu sesión. No utilizamos
                cookies de seguimiento o publicidad.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">
                8. Contacto
              </h2>
              <p className="text-slate-300">
                Para cualquier consulta sobre privacidad, contacta con nosotros en:
                <br />
                <a
                  href="mailto:privacy@agentpilot.es"
                  className="text-blue-400 hover:text-blue-300"
                >
                  privacy@agentpilot.es
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
