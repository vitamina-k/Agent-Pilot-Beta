"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

type Provider = "openai" | "anthropic" | "deepseek" | "perplexity";

interface ApiKey {
  id: string;
  proveedor: Provider;
  es_activa: boolean;
  created_at: string;
}

const PROVIDERS: { id: Provider; name: string; icon: string }[] = [
  { id: "openai", name: "OpenAI", icon: "🤖" },
  { id: "anthropic", name: "Anthropic (Claude)", icon: "🧠" },
  { id: "deepseek", name: "DeepSeek", icon: "🔍" },
  { id: "perplexity", name: "Perplexity", icon: "💡" },
];

export default function ApiKeysPage() {
  const supabase = createClient();
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [newApiKey, setNewApiKey] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadKeys();
  }, []);

  const loadKeys = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from("usuarios_pro")
      .select("id")
      .eq("correo_electronico", user.email)
      .single();

    if (profile) {
      const { data } = await supabase
        .from("credenciales_api")
        .select("*")
        .eq("usuario_id", profile.id);

      setKeys(data || []);
    }
    setLoading(false);
  };

  const handleSaveKey = async () => {
    if (!selectedProvider || !newApiKey.trim()) {
      setError("Selecciona un proveedor y añade tu API key");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from("usuarios_pro")
      .select("id")
      .eq("correo_electronico", user.email)
      .single();

    if (!profile) return;

    // Check if key already exists for this provider
    const existingKey = keys.find((k) => k.proveedor === selectedProvider);

    if (existingKey) {
      // Update existing
      const { error } = await supabase
        .from("credenciales_api")
        .update({
          api_key_encrypted: newApiKey.trim(),
          es_activa: true,
        })
        .eq("id", existingKey.id);

      if (error) {
        setError("Error al guardar la API key");
      } else {
        setSuccess("API key actualizada correctamente");
        loadKeys();
      }
    } else {
      // Insert new
      const { error } = await supabase.from("credenciales_api").insert({
        usuario_id: profile.id,
        proveedor: selectedProvider,
        api_key_encrypted: newApiKey.trim(),
        es_activa: true,
      });

      if (error) {
        setError("Error al guardar la API key");
      } else {
        setSuccess("API key guardada correctamente");
        loadKeys();
      }
    }

    setNewApiKey("");
    setSelectedProvider(null);
    setSaving(false);
  };

  const handleDeleteKey = async (id: string) => {
    if (!confirm("¿Seguro que quieres eliminar esta API key?")) return;

    const { error } = await supabase.from("credenciales_api").delete().eq("id", id);

    if (!error) {
      loadKeys();
      setSuccess("API key eliminada");
    }
  };

  const handleToggleKey = async (id: string, currentState: boolean) => {
    const { error } = await supabase
      .from("credenciales_api")
      .update({ es_activa: !currentState })
      .eq("id", id);

    if (!error) {
      loadKeys();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-400">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">API Keys (BYOA)</h2>
        <p className="text-slate-400">
          Configura tus propias API keys para usar las IAs a coste de proveedor.
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      {/* Add new key */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          Añadir API Key
        </h3>

        <div className="grid md:grid-cols-2 gap-4 mb-4">
          {PROVIDERS.map((provider) => (
            <button
              key={provider.id}
              onClick={() => setSelectedProvider(provider.id)}
              className={`p-4 rounded-lg border text-left transition ${
                selectedProvider === provider.id
                  ? "border-blue-500 bg-blue-500/10"
                  : "border-slate-600 hover:border-slate-500"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{provider.icon}</span>
                <div>
                  <p className="font-medium text-white">{provider.name}</p>
                  <p className="text-slate-400 text-sm">
                    {keys.find((k) => k.proveedor === provider.id)
                      ? "✓ Configurado"
                      : "Sin configurar"}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {selectedProvider && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                API Key para{" "}
                {PROVIDERS.find((p) => p.id === selectedProvider)?.name}
              </label>
              <input
                type="password"
                value={newApiKey}
                onChange={(e) => setNewApiKey(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                placeholder="sk-..."
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleSaveKey}
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white px-6 py-2 rounded-lg font-medium transition"
              >
                {saving ? "Guardando..." : "Guardar API Key"}
              </button>
              <button
                onClick={() => {
                  setSelectedProvider(null);
                  setNewApiKey("");
                }}
                className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-2 rounded-lg font-medium transition"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Existing keys */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          API Keys configuradas
        </h3>

        {keys.length > 0 ? (
          <div className="space-y-3">
            {keys.map((key) => {
              const provider = PROVIDERS.find((p) => p.id === key.proveedor);
              return (
                <div
                  key={key.id}
                  className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{provider?.icon}</span>
                    <div>
                      <p className="font-medium text-white">{provider?.name}</p>
                      <p className="text-slate-400 text-sm">
                        {key.es_activa ? "Activa" : "Inactiva"} · Añadida el{" "}
                        {new Date(key.created_at).toLocaleDateString("es-ES")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleKey(key.id, key.es_activa)}
                      className={`px-3 py-1 rounded text-sm font-medium ${
                        key.es_activa
                          ? "bg-green-500/20 text-green-400"
                          : "bg-slate-600 text-slate-300"
                      }`}
                    >
                      {key.es_activa ? "Activa" : "Inactiva"}
                    </button>
                    <button
                      onClick={() => handleDeleteKey(key.id)}
                      className="text-red-400 hover:text-red-300 px-2"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-slate-400 text-center py-8">
            No tienes API keys configuradas.
          </p>
        )}
      </div>

      {/* Info */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-blue-400 mb-2">
          ¿Qué es BYOA?
        </h3>
        <p className="text-slate-300">
          BYOA (Bring Your Own API) te permite usar tus propias API keys de los
          proveedores de IA. Cuando uses tu propia key, las llamadas se hacen
          directamente a coste de proveedor, sin consumir créditos de Agent Pilot.
          Esto puede ser más económico si usas mucho el servicio.
        </p>
      </div>
    </div>
  );
}
