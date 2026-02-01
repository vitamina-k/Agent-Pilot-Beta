import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
    .eq("correo_electronico", user.email)
    .single();

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: "📊" },
    { name: "Mi Perfil", href: "/dashboard/perfil", icon: "👤" },
    { name: "Créditos", href: "/dashboard/creditos", icon: "💰" },
    { name: "API Keys", href: "/dashboard/api-keys", icon: "🔑" },
    { name: "Historial", href: "/dashboard/historial", icon: "📈" },
  ];

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-64 bg-slate-800 border-r border-slate-700">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-slate-700">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🤖</span>
            <span className="text-xl font-bold text-white">Agent Pilot</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-slate-700 hover:text-white rounded-lg transition"
            >
              <span>{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>

        {/* Credits display */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700">
          <div className="bg-slate-900/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-sm">Créditos</span>
              <span className="text-white font-bold">
                {profile?.creditos_disponibles ?? 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-sm">Plan</span>
              <span className="text-blue-400 font-medium capitalize">
                {profile?.plan_actual ?? "free"}
              </span>
            </div>
            <Link
              href="/checkout"
              className="mt-3 block w-full text-center bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg text-sm transition"
            >
              Comprar créditos
            </Link>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="pl-64">
        {/* Header */}
        <header className="h-16 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-6">
          <h1 className="text-lg font-semibold text-white">Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-slate-400 text-sm">{user.email}</span>
            <form action="/api/auth/signout" method="POST">
              <button
                type="submit"
                className="text-slate-400 hover:text-white text-sm"
              >
                Cerrar sesión
              </button>
            </form>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
