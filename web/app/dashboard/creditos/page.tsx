import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { formatCredits, formatDate } from "@/lib/utils";

export default async function CreditosPage() {
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
    .select("*")
    .ilike("correo_electronico", user.email?.toLowerCase() || "")
    .single();

  // Get all transactions
  const { data: transactions } = await supabase
    .from("transacciones")
    .select("*")
    .eq("usuario_id", profile?.id)
    .order("created_at", { ascending: false });

  // Calculate totals
  const totalComprado =
    transactions
      ?.filter((t) => t.tipo === "compra" || t.tipo === "suscripcion")
      .reduce((acc, t) => acc + t.creditos, 0) || 0;

  const totalConsumido =
    Math.abs(
      transactions
        ?.filter((t) => t.tipo === "consumo")
        .reduce((acc, t) => acc + t.creditos, 0) || 0
    );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Créditos</h2>
        <p className="text-slate-400">
          Gestiona tus créditos y consulta tu historial de uso.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <div className="text-slate-400 text-sm mb-1">Disponibles</div>
          <div className="text-3xl font-bold text-white">
            {formatCredits(profile?.creditos_disponibles ?? 0)}
          </div>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <div className="text-slate-400 text-sm mb-1">Total comprado</div>
          <div className="text-3xl font-bold text-green-400">
            +{formatCredits(totalComprado)}
          </div>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <div className="text-slate-400 text-sm mb-1">Total consumido</div>
          <div className="text-3xl font-bold text-red-400">
            -{formatCredits(totalConsumido)}
          </div>
        </div>
      </div>

      {/* Buy more */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-white mb-1">
              ¿Necesitas más créditos?
            </h3>
            <p className="text-blue-100">
              Mejora tu plan o compra créditos adicionales.
            </p>
          </div>
          <Link
            href="/checkout"
            className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition"
          >
            Comprar créditos
          </Link>
        </div>
      </div>

      {/* Transaction history */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          Historial de transacciones
        </h3>

        {transactions && transactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left text-slate-400 text-sm py-3 px-4">
                    Fecha
                  </th>
                  <th className="text-left text-slate-400 text-sm py-3 px-4">
                    Concepto
                  </th>
                  <th className="text-left text-slate-400 text-sm py-3 px-4">
                    Tipo
                  </th>
                  <th className="text-right text-slate-400 text-sm py-3 px-4">
                    Créditos
                  </th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr
                    key={tx.id}
                    className="border-b border-slate-700/50 last:border-0"
                  >
                    <td className="py-3 px-4 text-slate-300">
                      {formatDate(tx.created_at)}
                    </td>
                    <td className="py-3 px-4 text-white">{tx.concepto}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          tx.tipo === "compra" || tx.tipo === "suscripcion"
                            ? "bg-green-500/20 text-green-400"
                            : tx.tipo === "consumo"
                            ? "bg-red-500/20 text-red-400"
                            : tx.tipo === "bonus"
                            ? "bg-purple-500/20 text-purple-400"
                            : "bg-blue-500/20 text-blue-400"
                        }`}
                      >
                        {tx.tipo}
                      </span>
                    </td>
                    <td
                      className={`py-3 px-4 text-right font-semibold ${
                        tx.creditos > 0 ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {tx.creditos > 0 ? "+" : ""}
                      {formatCredits(tx.creditos)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-slate-400 text-center py-8">
            No hay transacciones todavía.
          </p>
        )}
      </div>

      {/* Credit costs reference */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          Costes por operación
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-900/50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-white">1</div>
            <div className="text-slate-400 text-sm">Modo FAST</div>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-white">5</div>
            <div className="text-slate-400 text-sm">Consenso</div>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-white">10</div>
            <div className="text-slate-400 text-sm">Análisis profundo</div>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-white">2</div>
            <div className="text-slate-400 text-sm">Post social</div>
          </div>
        </div>
      </div>
    </div>
  );
}
