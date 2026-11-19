"use client";

import { useState, useEffect } from "react";
import { CoursWithDetails } from "@/types";
import { X, Check, AlertTriangle } from "lucide-react";

interface EditCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  course: CoursWithDetails | null;
}

export function EditCourseModal({
  isOpen,
  onClose,
  onSuccess,
  course,
}: EditCourseModalProps) {
  const [nomCours, setNomCours] = useState("");
  const [thematique, setThematique] = useState("");
  const [description, setDescription] = useState("");
  const [statut, setStatut] = useState<"actif" | "archive">("actif");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (course && isOpen) {
      setNomCours(course.nom_cours);
      setThematique(course.thematique || "");
      setDescription(course.description || "");
      setStatut(course.statut === "archive" ? "archive" : "actif");
      setError(null);
    }
  }, [course, isOpen]);

  const handleSubmit = async () => {
    if (!course) return;
    setError(null);

    if (!nomCours.trim()) {
      setError("Le nom du cours est obligatoire.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`/api/courses/${course.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nom_cours: nomCours.trim(),
          thematique: thematique.trim() || "Général",
          description: description.trim() || null,
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

  if (!isOpen || !course) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-[#EAECEF] shadow-xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#EAECEF] flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#171717] tracking-tight">
              Modifier le cours
            </h2>
            {course.ecole && (
              <p className="text-xs text-[#777777]">{course.ecole.nom}</p>
            )}
          </div>
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
              Nom du cours
            </label>
            <input
              type="text"
              value={nomCours}
              onChange={(e) => setNomCours(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-[#F7F8FA] border border-[#EAECEF] rounded-lg text-[#171717] focus:outline-none focus:border-[#4568F5]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#171717] uppercase tracking-wider mb-1.5">
              Thématique
            </label>
            <input
              type="text"
              value={thematique}
              onChange={(e) => setThematique(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-[#F7F8FA] border border-[#EAECEF] rounded-lg text-[#171717] focus:outline-none focus:border-[#4568F5]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#171717] uppercase tracking-wider mb-1.5">
              Description (facultative)
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-[#F7F8FA] border border-[#EAECEF] rounded-lg text-[#171717] focus:outline-none focus:border-[#4568F5]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#171717] uppercase tracking-wider mb-1.5">
              Statut
            </label>
            <select
              value={statut}
              onChange={(e) => setStatut(e.target.value as "actif" | "archive")}
              className="w-full px-3 py-2 text-sm bg-[#F7F8FA] border border-[#EAECEF] rounded-lg text-[#171717] focus:outline-none focus:border-[#4568F5]"
            >
              <option value="actif">Actif (Visible sur le front-office)</option>
              <option value="archive">Archivé (Masqué du front-office)</option>
            </select>
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
            onClick={handleSubmit}
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
