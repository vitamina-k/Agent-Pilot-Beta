import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { formatDate } from "@/lib/utils";

export default async function HistorialPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get user profile
  const { data: profile } = await supabase
    .from("usuarios_pro")
    .select("id")
    .ilike("Correo_Electronico", user.email?.toLowerCase() || "")
    .single();

  // Get content history
  const { data: history } = await supabase
    .from("historial_contenido")
    .select("*")
    .eq("usuario_id", profile?.id)
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Historial</h2>
        <p className="text-slate-400">
          Revisa todo el contenido que has generado con Agent Pilot.
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">
          Todos
        </button>
        <button className="px-4 py-2 bg-slate-700 text-slate-300 hover:bg-slate-600 rounded-lg text-sm font-medium">
          Análisis
        </button>
        <button className="px-4 py-2 bg-slate-700 text-slate-300 hover:bg-slate-600 rounded-lg text-sm font-medium">
          Posts
        </button>
        <button className="px-4 py-2 bg-slate-700 text-slate-300 hover:bg-slate-600 rounded-lg text-sm font-medium">
          Consenso
        </button>
      </div>

      {/* History list */}
      <div className="space-y-4">
        {history && history.length > 0 ? (
          history.map((item) => (
            <div
              key={item.id}
              className="bg-slate-800 border border-slate-700 rounded-xl p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      item.modo === "consensus"
                        ? "bg-purple-500/20 text-purple-400"
                        : "bg-blue-500/20 text-blue-400"
                    }`}
                  >
                    {item.modo === "consensus" ? "🧠 Consenso" : "⚡ Fast"}
                  </span>
                  <span className="text-slate-400 text-sm">
                    {item.tipo}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-slate-400 text-sm">
                    {formatDate(item.created_at)}
                  </p>
                  <p className="text-slate-500 text-xs">
                    {item.creditos_usados} créditos
                  </p>
                </div>
              </div>

              {item.input_text && (
                <div className="mb-4">
                  <p className="text-slate-400 text-xs uppercase tracking-wide mb-1">
                    Input
                  </p>
                  <p className="text-slate-300 text-sm bg-slate-900/50 rounded-lg p-3">
                    {item.input_text.length > 200
                      ? `${item.input_text.slice(0, 200)}...`
                      : item.input_text}
                  </p>
                </div>
              )}

              <div>
                <p className="text-slate-400 text-xs uppercase tracking-wide mb-1">
                  Output
                </p>
                <div className="text-white text-sm bg-slate-900/50 rounded-lg p-3">
                  {item.output_text.length > 500
                    ? `${item.output_text.slice(0, 500)}...`
                    : item.output_text}
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <button className="text-blue-400 hover:text-blue-300 text-sm">
                  Ver completo
                </button>
                <button className="text-slate-400 hover:text-slate-300 text-sm">
                  Copiar
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-12 text-center">
            <div className="text-4xl mb-4">📭</div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Aún no hay historial
            </h3>
            <p className="text-slate-400 mb-4">
              Empieza a usar Agent Pilot para ver tu historial de contenido aquí.
            </p>
            <a
              href="https://t.me/AgentPilotx_Bot"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-medium transition"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295l.213-3.053 5.56-5.023c.242-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.828.94z" />
              </svg>
              Ir al bot de Telegram
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
