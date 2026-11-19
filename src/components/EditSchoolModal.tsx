"use client";

import { useState, useEffect } from "react";
import { Ecole } from "@/types";
import { X, Check, AlertTriangle, GraduationCap } from "lucide-react";

interface EditSchoolModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  ecole: Ecole | null;
}

export function EditSchoolModal({
  isOpen,
  onClose,
  onSuccess,
  ecole,
}: EditSchoolModalProps) {
  const [nom, setNom] = useState("");
  const [statut, setStatut] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (ecole && isOpen) {
      setNom(ecole.nom);
      setStatut(ecole.statut);
      setError(null);
    }
  }, [ecole, isOpen]);

  const handleSubmit = async () => {
    if (!ecole) return;
    setError(null);

    if (!nom.trim()) {
      setError("Le nom de l'école est obligatoire.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`/api/ecoles/${ecole.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nom: nom.trim(),
          statut,
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

  if (!isOpen || !ecole) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-school-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
      style={{ overscrollBehavior: "contain" }}
    >
      <div className="bg-white rounded-2xl border border-[#EAECEF] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#EAECEF] flex items-center justify-between bg-gradient-to-r from-white to-[#F7F8FA]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#4568F5]/10 text-[#4568F5] flex items-center justify-center">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <h2 id="edit-school-title" className="text-base font-bold text-[#171717] tracking-tight">
                Modifier l&apos;école
              </h2>
              <p className="text-[11px] text-[#777777]">
                Renommez ou modifiez le statut de l&apos;établissement
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#777777] hover:text-[#171717] p-1.5 rounded-lg hover:bg-white transition-colors"
            aria-label="Fermer"
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
              Nom de l&apos;école
            </label>
            <input
              type="text"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              placeholder="Ex : École Supérieure de Commerce..."
              className="w-full px-3.5 py-2.5 text-sm bg-[#F7F8FA] border border-[#EAECEF] rounded-lg text-[#171717] focus:outline-none focus:ring-2 focus:ring-[#4568F5]/20 focus:border-[#4568F5] transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#171717] uppercase tracking-wider mb-1.5">
              Statut de l&apos;école
            </label>
            <select
              value={statut ? "true" : "false"}
              onChange={(e) => setStatut(e.target.value === "true")}
              className="w-full px-3.5 py-2.5 text-sm bg-[#F7F8FA] border border-[#EAECEF] rounded-lg text-[#171717] focus:outline-none focus:border-[#4568F5] cursor-pointer"
            >
              <option value="true">Active (Visible dans les cours)</option>
              <option value="false">Inactive / Archivée</option>
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#F7F8FA] border-t border-[#EAECEF] flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-[#777777] hover:text-[#171717] hover:bg-white rounded-lg transition-colors"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="px-5 py-2 text-xs font-semibold text-white bg-[#4568F5] hover:bg-[#3654D9] rounded-lg transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
            <span>{loading ? "Enregistrement..." : "Enregistrer"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
