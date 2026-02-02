"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { BioEntrenamiento } from "@/types/database";

export default function PerfilPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [bio, setBio] = useState<BioEntrenamiento>({
    descripcion_personal: "",
    tono_preferido: "",
    valores: [],
    temas_principales: [],
    hashtags_fijos: [],
    estilo_escritura: "neutral",
    audiencia_objetivo: "",
    idioma_principal: "es",
    ejemplos_estilo: [],
  });

  // Temp inputs for array fields
  const [newValor, setNewValor] = useState("");
  const [newTema, setNewTema] = useState("");
  const [newHashtag, setNewHashtag] = useState("");
  const [newEjemplo, setNewEjemplo] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("usuarios_pro")
      .select("bio_entrenamiento")
      .ilike("Correo_Electronico", user.email?.toLowerCase() || "")
      .single();

    if (data?.bio_entrenamiento) {
      setBio({ ...bio, ...data.bio_entrenamiento });
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccess(false);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("usuarios_pro")
      .update({ bio_entrenamiento: bio })
      .ilike("Correo_Electronico", user.email?.toLowerCase() || "");

    setSaving(false);
    if (!error) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  const addToArray = (
    field: "valores" | "temas_principales" | "hashtags_fijos" | "ejemplos_estilo",
    value: string,
    setter: (v: string) => void
  ) => {
    if (value.trim() && !bio[field]?.includes(value.trim())) {
      setBio({ ...bio, [field]: [...(bio[field] || []), value.trim()] });
      setter("");
    }
  };

  const removeFromArray = (
    field: "valores" | "temas_principales" | "hashtags_fijos" | "ejemplos_estilo",
    index: number
  ) => {
    setBio({
      ...bio,
      [field]: bio[field]?.filter((_, i) => i !== index),
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-400">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">
          Perfil de Entrenamiento
        </h2>
        <p className="text-slate-400">
          Configura cómo quieres que la IA genere contenido para ti.
        </p>
      </div>

      {success && (
        <div className="bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-3 rounded-lg">
          ¡Perfil guardado correctamente!
        </div>
      )}

      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-6">
        {/* Descripción personal */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Descripción personal
          </label>
          <textarea
            value={bio.descripcion_personal || ""}
            onChange={(e) =>
              setBio({ ...bio, descripcion_personal: e.target.value })
            }
            rows={4}
            className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            placeholder="Describe quién eres, qué haces, tu estilo de comunicación..."
          />
        </div>

        {/* Tono preferido */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Tono preferido
          </label>
          <input
            type="text"
            value={bio.tono_preferido || ""}
            onChange={(e) => setBio({ ...bio, tono_preferido: e.target.value })}
            className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            placeholder="Ej: directo, crítico, empático, motivador..."
          />
        </div>

        {/* Estilo de escritura */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Estilo de escritura
          </label>
          <select
            value={bio.estilo_escritura || "neutral"}
            onChange={(e) =>
              setBio({
                ...bio,
                estilo_escritura: e.target.value as BioEntrenamiento["estilo_escritura"],
              })
            }
            className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
          >
            <option value="casual">Casual</option>
            <option value="neutral">Neutral</option>
            <option value="formal">Formal</option>
            <option value="agresivo">Agresivo/Directo</option>
          </select>
        </div>

        {/* Valores */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Valores que defiendes
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={newValor}
              onChange={(e) => setNewValor(e.target.value)}
              onKeyPress={(e) =>
                e.key === "Enter" && addToArray("valores", newValor, setNewValor)
              }
              className="flex-1 px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
              placeholder="Ej: Transparencia, Honestidad..."
            />
            <button
              type="button"
              onClick={() => addToArray("valores", newValor, setNewValor)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg"
            >
              Añadir
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {bio.valores?.map((valor, i) => (
              <span
                key={i}
                className="bg-slate-700 text-slate-300 px-3 py-1 rounded-full text-sm flex items-center gap-2"
              >
                {valor}
                <button
                  type="button"
                  onClick={() => removeFromArray("valores", i)}
                  className="text-slate-400 hover:text-white"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Temas principales */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Temas principales
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={newTema}
              onChange={(e) => setNewTema(e.target.value)}
              onKeyPress={(e) =>
                e.key === "Enter" &&
                addToArray("temas_principales", newTema, setNewTema)
              }
              className="flex-1 px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
              placeholder="Ej: Tecnología, Marketing, Política..."
            />
            <button
              type="button"
              onClick={() =>
                addToArray("temas_principales", newTema, setNewTema)
              }
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg"
            >
              Añadir
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {bio.temas_principales?.map((tema, i) => (
              <span
                key={i}
                className="bg-slate-700 text-slate-300 px-3 py-1 rounded-full text-sm flex items-center gap-2"
              >
                {tema}
                <button
                  type="button"
                  onClick={() => removeFromArray("temas_principales", i)}
                  className="text-slate-400 hover:text-white"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Hashtags fijos */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Hashtags fijos
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={newHashtag}
              onChange={(e) => setNewHashtag(e.target.value)}
              onKeyPress={(e) =>
                e.key === "Enter" &&
                addToArray("hashtags_fijos", newHashtag, setNewHashtag)
              }
              className="flex-1 px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
              placeholder="Ej: #MiMarca, #Marketing..."
            />
            <button
              type="button"
              onClick={() =>
                addToArray("hashtags_fijos", newHashtag, setNewHashtag)
              }
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg"
            >
              Añadir
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {bio.hashtags_fijos?.map((tag, i) => (
              <span
                key={i}
                className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm flex items-center gap-2"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeFromArray("hashtags_fijos", i)}
                  className="text-blue-300 hover:text-white"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Audiencia objetivo */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Audiencia objetivo
          </label>
          <input
            type="text"
            value={bio.audiencia_objetivo || ""}
            onChange={(e) =>
              setBio({ ...bio, audiencia_objetivo: e.target.value })
            }
            className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            placeholder="Ej: Emprendedores, profesionales de marketing, millennials..."
          />
        </div>

        {/* Save button */}
        <div className="flex justify-end pt-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white px-8 py-3 rounded-lg font-semibold transition"
          >
            {saving ? "Guardando..." : "Guardar perfil"}
          </button>
        </div>
      </div>
    </div>
  );
}
