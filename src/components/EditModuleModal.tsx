"use client";

import { useState, useEffect } from "react";
import { Module } from "@/types";
import { X, Check, AlertTriangle } from "lucide-react";

interface EditModuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  module: Module | null;
}

export function EditModuleModal({
  isOpen,
  onClose,
  onSuccess,
  module,
}: EditModuleModalProps) {
  const [numeroModule, setNumeroModule] = useState<number | "">(1);
  const [sousTitre, setSousTitre] = useState("");
  const [urlCours, setUrlCours] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (module && isOpen) {
      setNumeroModule(module.numero_module);
      setSousTitre(module.sous_titre);
      setUrlCours(module.url_cours);
      setError(null);
    }
  }, [module, isOpen]);

  const handleSubmit = async (forceReplace: boolean = false) => {
    if (!module) return;
    setError(null);

    if (numeroModule === "" || Number(numeroModule) < 1) {
      setError("Le numéro de module doit être supérieur ou égal à 1.");
      return;
    }
    if (!sousTitre.trim()) {
      setError("Le sous-titre est obligatoire.");
      return;
    }
    if (!urlCours.trim()) {
      setError("L'URL du cours est obligatoire.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`/api/modules/${module.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          numero_module: Number(numeroModule),
          sous_titre: sousTitre.trim(),
          url_cours: urlCours.trim(),
          replace_if_exists: forceReplace,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erreur de mise à jour");
      }

      onSuccess();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur serveur";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !module) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-[#EAECEF] shadow-xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#EAECEF] flex items-center justify-between">
          <h2 className="text-base font-bold text-[#171717] tracking-tight">
            Modifier le module
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-[#777777] hover:text-[#171717] p-1.5 rounded-lg hover:bg-[#F7F8FA]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#171717] uppercase tracking-wider mb-1.5">
              Numéro du module
            </label>
            <input
              type="number"
              min="1"
              value={numeroModule}
              onChange={(e) =>
                setNumeroModule(e.target.value === "" ? "" : parseInt(e.target.value, 10))
              }
              className="w-full px-3 py-2 text-sm bg-[#F7F8FA] border border-[#EAECEF] rounded-lg text-[#171717] font-mono focus:outline-none focus:border-[#4568F5]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#171717] uppercase tracking-wider mb-1.5">
              Sous-titre du module
            </label>
            <input
              type="text"
              value={sousTitre}
              onChange={(e) => setSousTitre(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-[#F7F8FA] border border-[#EAECEF] rounded-lg text-[#171717] focus:outline-none focus:border-[#4568F5]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#171717] uppercase tracking-wider mb-1.5">
              Lien URL du cours
            </label>
            <input
              type="url"
              value={urlCours}
              onChange={(e) => setUrlCours(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-[#F7F8FA] border border-[#EAECEF] rounded-lg text-[#171717] focus:outline-none focus:border-[#4568F5]"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#F7F8FA] border-t border-[#EAECEF] flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-[#777777] hover:text-[#171717]"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={() => handleSubmit(false)}
            disabled={loading}
            className="px-5 py-2 text-xs font-semibold text-white bg-[#4568F5] hover:bg-[#3654D9] rounded-lg flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>Enregistrer</span>
          </button>
        </div>
      </div>
    </div>
  );
}
