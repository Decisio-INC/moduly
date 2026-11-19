"use client";

import { useState, useEffect } from "react";
import { EcoleWithCourses, CreateModulePayload } from "@/types";
import { X, Plus, AlertTriangle, Check, Layers, ExternalLink } from "lucide-react";

interface AddModuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  catalog: EcoleWithCourses[];
}

export function AddModuleModal({
  isOpen,
  onClose,
  onSuccess,
  catalog,
}: AddModuleModalProps) {
  // Mode école : existante vs nouvelle
  const [isNewEcole, setIsNewEcole] = useState(false);
  const [selectedEcoleId, setSelectedEcoleId] = useState("");
  const [newEcoleNom, setNewEcoleNom] = useState("");

  // Mode cours : existant vs nouveau
  const [isNewCours, setIsNewCours] = useState(false);
  const [selectedCoursId, setSelectedCoursId] = useState("");
  const [newCoursNom, setNewCoursNom] = useState("");
  const [thematique, setThematique] = useState("");

  // Champs du module
  const [numeroModule, setNumeroModule] = useState<number | "">(1);
  const [sousTitre, setSousTitre] = useState("");
  const [urlCours, setUrlCours] = useState("");

  // État de soumission et erreurs
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conflictData, setConflictData] = useState<{
    message: string;
    existingSubTitle: string;
  } | null>(null);

  // Initialisation par défaut
  useEffect(() => {
    if (isOpen) {
      setError(null);
      setConflictData(null);
      if (catalog.length > 0) {
        const firstEcole = catalog[0];
        setSelectedEcoleId(firstEcole.id);
        setIsNewEcole(false);

        if (firstEcole.courses.length > 0) {
          const firstCourse = firstEcole.courses[0];
          setSelectedCoursId(firstCourse.id);
          setThematique(firstCourse.thematique || "");
          setIsNewCours(false);

          // Calculer le prochain numéro de module disponible
          const takenNumbers = firstCourse.modules.map((m) => m.numero_module);
          const maxNum = takenNumbers.length > 0 ? Math.max(...takenNumbers) : 0;
          setNumeroModule(maxNum + 1);
        } else {
          setIsNewCours(true);
          setSelectedCoursId("");
          setThematique("");
          setNumeroModule(1);
        }
      } else {
        setIsNewEcole(true);
        setIsNewCours(true);
        setNumeroModule(1);
      }
    }
  }, [isOpen, catalog]);

  // Gestion du changement d'école
  const handleEcoleChange = (ecoleId: string) => {
    setSelectedEcoleId(ecoleId);
    const ecole = catalog.find((e) => e.id === ecoleId);
    if (ecole && ecole.courses.length > 0) {
      const firstCourse = ecole.courses[0];
      setSelectedCoursId(firstCourse.id);
      setThematique(firstCourse.thematique || "");
      setIsNewCours(false);

      const taken = firstCourse.modules.map((m) => m.numero_module);
      const maxNum = taken.length > 0 ? Math.max(...taken) : 0;
      setNumeroModule(maxNum + 1);
    } else {
      setIsNewCours(true);
      setSelectedCoursId("");
      setThematique("");
      setNumeroModule(1);
    }
  };

  // Gestion du changement de cours
  const handleCoursChange = (coursId: string) => {
    setSelectedCoursId(coursId);
    const ecole = catalog.find((e) => e.id === selectedEcoleId);
    const cours = ecole?.courses.find((c) => c.id === coursId);
    if (cours) {
      setThematique(cours.thematique || "");
      const taken = cours.modules.map((m) => m.numero_module);
      const maxNum = taken.length > 0 ? Math.max(...taken) : 0;
      setNumeroModule(maxNum + 1);
    }
  };

  // Validation et soumission
  const handleSubmit = async (forceReplace: boolean = false) => {
    setError(null);
    setConflictData(null);

    // Résolution du nom de l'école
    let finalEcoleNom = "";
    if (isNewEcole) {
      finalEcoleNom = newEcoleNom.trim();
    } else {
      const ecole = catalog.find((e) => e.id === selectedEcoleId);
      finalEcoleNom = ecole?.nom || "";
    }

    // Résolution du nom du cours
    let finalCoursNom = "";
    if (isNewCours) {
      finalCoursNom = newCoursNom.trim();
    } else {
      const ecole = catalog.find((e) => e.id === selectedEcoleId);
      const cours = ecole?.courses.find((c) => c.id === selectedCoursId);
      finalCoursNom = cours?.nom_cours || "";
    }

    if (!finalEcoleNom) {
      setError("Veuillez renseigner le nom de l'école.");
      return;
    }
    if (!finalCoursNom) {
      setError("Veuillez renseigner le nom du cours.");
      return;
    }
    if (numeroModule === "" || Number(numeroModule) < 1) {
      setError("Le numéro de module doit être un entier supérieur ou égal à 1.");
      return;
    }
    if (!sousTitre.trim()) {
      setError("Veuillez renseigner le sous-titre du module.");
      return;
    }
    if (!urlCours.trim()) {
      setError("Veuillez renseigner l'URL d'accès au cours.");
      return;
    }

    const payload: CreateModulePayload = {
      ecole_nom: finalEcoleNom,
      nom_cours: finalCoursNom,
      thematique: thematique.trim() || "Général",
      numero_module: Number(numeroModule),
      sous_titre: sousTitre.trim(),
      url_cours: urlCours.trim(),
      replace_if_exists: forceReplace,
    };

    setLoading(true);

    try {
      const res = await fetch("/api/modules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409 && data.conflict) {
          setConflictData({
            message: data.error,
            existingSubTitle: data.conflict.existing_module.sous_titre,
          });
          setLoading(false);
          return;
        }
        throw new Error(data.error || "Erreur lors de l'enregistrement");
      }

      // Succès
      setSousTitre("");
      setUrlCours("");
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur inattendue";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const currentEcole = catalog.find((e) => e.id === selectedEcoleId);
  const availableCourses = currentEcole?.courses || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-[#EAECEF] shadow-xl w-full max-w-lg overflow-hidden my-8">
        {/* Header Modal */}
        <div className="px-6 py-5 border-b border-[#EAECEF] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#4568F5]/10 flex items-center justify-center text-[#4568F5]">
              <Plus className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#171717] tracking-tight">
                Ajouter un nouveau module
              </h2>
              <p className="text-xs text-[#777777]">
                Création et placement automatique dans le catalogue
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#777777] hover:text-[#171717] p-1.5 rounded-lg hover:bg-[#F7F8FA] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {conflictData && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-3">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-900">
                  <p className="font-semibold mb-1">Attention : Conflit de numéro</p>
                  <p>{conflictData.message}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleSubmit(true)}
                  disabled={loading}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors shadow-sm"
                >
                  Remplacer le module existant
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setConflictData(null);
                    setNumeroModule((prev) => (typeof prev === "number" ? prev + 1 : 1));
                  }}
                  className="px-3 py-1.5 text-xs font-medium text-amber-900 bg-white border border-amber-300 hover:bg-amber-100 rounded-lg transition-colors"
                >
                  Changer le numéro (+1)
                </button>
              </div>
            </div>
          )}

          {/* 1. SECTION ÉCOLE */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-[#171717] uppercase tracking-wider">
                1. École <span className="text-[#4568F5]">*</span>
              </label>
              {catalog.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setIsNewEcole(!isNewEcole);
                    if (!isNewEcole) setIsNewCours(true);
                  }}
                  className="text-xs text-[#4568F5] hover:underline"
                >
                  {isNewEcole ? "Choisir une école existante" : "+ Nouvelle école"}
                </button>
              )}
            </div>

            {isNewEcole || catalog.length === 0 ? (
              <input
                type="text"
                value={newEcoleNom}
                onChange={(e) => setNewEcoleNom(e.target.value)}
                placeholder="Ex : École Supérieure de Commerce..."
                className="w-full px-3 py-2 text-sm bg-[#F7F8FA] border border-[#EAECEF] rounded-lg text-[#171717] focus:outline-none focus:border-[#4568F5]"
              />
            ) : (
              <select
                value={selectedEcoleId}
                onChange={(e) => handleEcoleChange(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-[#F7F8FA] border border-[#EAECEF] rounded-lg text-[#171717] focus:outline-none focus:border-[#4568F5]"
              >
                {catalog.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.nom}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* 2. SECTION COURS */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-[#171717] uppercase tracking-wider">
                2. Nom du cours <span className="text-[#4568F5]">*</span>
              </label>
              {!isNewEcole && availableCourses.length > 0 && (
                <button
                  type="button"
                  onClick={() => setIsNewCours(!isNewCours)}
                  className="text-xs text-[#4568F5] hover:underline"
                >
                  {isNewCours ? "Choisir un cours existant" : "+ Nouveau cours"}
                </button>
              )}
            </div>

            {isNewCours || isNewEcole || availableCourses.length === 0 ? (
              <input
                type="text"
                value={newCoursNom}
                onChange={(e) => setNewCoursNom(e.target.value)}
                placeholder="Ex : Stratégie de communication, Management de projet..."
                className="w-full px-3 py-2 text-sm bg-[#F7F8FA] border border-[#EAECEF] rounded-lg text-[#171717] focus:outline-none focus:border-[#4568F5]"
              />
            ) : (
              <select
                value={selectedCoursId}
                onChange={(e) => handleCoursChange(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-[#F7F8FA] border border-[#EAECEF] rounded-lg text-[#171717] focus:outline-none focus:border-[#4568F5]"
              >
                {availableCourses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nom_cours} ({c.modules?.length || 0} modules)
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* 3. THÉMATIQUE */}
          <div>
            <label className="block text-xs font-semibold text-[#171717] uppercase tracking-wider mb-1.5">
              3. Thématique du cours
            </label>
            <input
              type="text"
              value={thematique}
              onChange={(e) => setThematique(e.target.value)}
              placeholder="Ex : Marketing, Management, Informatique, Design..."
              className="w-full px-3 py-2 text-sm bg-[#F7F8FA] border border-[#EAECEF] rounded-lg text-[#171717] focus:outline-none focus:border-[#4568F5]"
            />
          </div>

          {/* 4 & 5. NUMÉRO DU MODULE & SOUS-TITRE */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1">
              <label className="block text-xs font-semibold text-[#171717] uppercase tracking-wider mb-1.5">
                4. Numéro <span className="text-[#4568F5]">*</span>
              </label>
              <input
                type="number"
                min="1"
                step="1"
                value={numeroModule}
                onChange={(e) =>
                  setNumeroModule(e.target.value === "" ? "" : parseInt(e.target.value, 10))
                }
                placeholder="1"
                className="w-full px-3 py-2 text-sm bg-[#F7F8FA] border border-[#EAECEF] rounded-lg text-[#171717] font-mono focus:outline-none focus:border-[#4568F5]"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-[#171717] uppercase tracking-wider mb-1.5">
                5. Sous-titre du module <span className="text-[#4568F5]">*</span>
              </label>
              <input
                type="text"
                value={sousTitre}
                onChange={(e) => setSousTitre(e.target.value)}
                placeholder="Ex : Les fondamentaux, Pilotage..."
                className="w-full px-3 py-2 text-sm bg-[#F7F8FA] border border-[#EAECEF] rounded-lg text-[#171717] focus:outline-none focus:border-[#4568F5]"
              />
            </div>
          </div>

          {/* 6. LIEN DU COURS (URL) */}
          <div>
            <label className="block text-xs font-semibold text-[#171717] uppercase tracking-wider mb-1.5">
              6. Lien URL d&apos;accès au cours <span className="text-[#4568F5]">*</span>
            </label>
            <div className="relative">
              <input
                type="url"
                value={urlCours}
                onChange={(e) => setUrlCours(e.target.value)}
                placeholder="https://plateforme-cours.com/..."
                className="w-full pl-3 pr-9 py-2 text-sm bg-[#F7F8FA] border border-[#EAECEF] rounded-lg text-[#171717] focus:outline-none focus:border-[#4568F5]"
              />
              <ExternalLink className="w-4 h-4 text-[#777777] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
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
            onClick={() => handleSubmit(false)}
            disabled={loading}
            className="px-5 py-2 text-xs font-semibold text-white bg-[#4568F5] hover:bg-[#3654D9] rounded-lg transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span>Enregistrement...</span>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>ENREGISTRER LE MODULE</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
