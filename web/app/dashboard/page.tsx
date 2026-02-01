import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get user profile (case-insensitive email match)
  const { data: profile } = await supabase
    .from("usuarios_pro")
    .select("*")
    .ilike("email", user.email?.toLowerCase() || "")
    .single();

  // Get recent transactions
  const { data: transactions } = await supabase
    .from("transacciones")
    .select("*")
    .eq("usuario_id", profile?.id)
    .order("created_at", { ascending: false })
    .limit(5);

  const isTelegramLinked = !!profile?.telegram_user_id;
  const hasBio = !!profile?.bio_entrenamiento?.descripcion_personal;

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6">
        <h2 className="text-2xl font-bold text-white mb-2">
          ¡Bienvenido a Agent Pilot!
        </h2>
        <p className="text-blue-100">
          Tu asistente de IA con múltiples cerebros trabajando en consenso.
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <span className="text-2xl">💰</span>
            </div>
            <div>
              <p className="text-slate-400 text-sm">Créditos disponibles</p>
              <p className="text-2xl font-bold text-white">
                {profile?.creditos_disponibles ?? 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📦</span>
            </div>
            <div>
              <p className="text-slate-400 text-sm">Plan actual</p>
              <p className="text-2xl font-bold text-white capitalize">
                {profile?.plan_actual ?? "Free"}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📱</span>
            </div>
            <div>
              <p className="text-slate-400 text-sm">Telegram</p>
              <p className="text-lg font-bold text-white">
                {isTelegramLinked ? "✅ Vinculado" : "⚠️ Sin vincular"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Setup checklist */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          Configura tu cuenta
        </h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center ${
                hasBio ? "bg-green-500" : "bg-slate-600"
              }`}
            >
              {hasBio ? "✓" : "1"}
            </div>
            <span className={hasBio ? "text-slate-400" : "text-white"}>
              Configura tu perfil de entrenamiento
            </span>
            {!hasBio && (
              <Link
                href="/dashboard/perfil"
                className="text-blue-400 hover:text-blue-300 text-sm ml-auto"
              >
                Configurar →
              </Link>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center ${
                isTelegramLinked ? "bg-green-500" : "bg-slate-600"
              }`}
            >
              {isTelegramLinked ? "✓" : "2"}
            </div>
            <span className={isTelegramLinked ? "text-slate-400" : "text-white"}>
              Vincula tu cuenta de Telegram
            </span>
            {!isTelegramLinked && (
              <a
                href="https://t.me/AgentPilotx_Bot"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 text-sm ml-auto"
              >
                Ir al bot →
              </a>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-slate-600 flex items-center justify-center">
              3
            </div>
            <span className="text-white">Prueba el modo Consenso</span>
            <a
              href="https://t.me/AgentPilotx_Bot"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 text-sm ml-auto"
            >
              Probar →
            </a>
          </div>
        </div>
      </div>

      {/* Recent transactions */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">
            Últimas transacciones
          </h3>
          <Link
            href="/dashboard/creditos"
            className="text-blue-400 hover:text-blue-300 text-sm"
          >
            Ver todo →
          </Link>
        </div>

        {transactions && transactions.length > 0 ? (
          <div className="space-y-3">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between py-2 border-b border-slate-700 last:border-0"
              >
                <div>
                  <p className="text-white">{tx.concepto}</p>
                  <p className="text-slate-400 text-sm">
                    {new Date(tx.created_at).toLocaleDateString("es-ES")}
                  </p>
                </div>
                <span
                  className={`font-semibold ${
                    tx.creditos > 0 ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {tx.creditos > 0 ? "+" : ""}
                  {tx.creditos}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-400">No hay transacciones todavía.</p>
        )}
      </div>
    </div>
  );
}
