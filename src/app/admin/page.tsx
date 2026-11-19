"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { EcoleWithCourses, CoursWithDetails, Module, CatalogStats, Ecole } from "@/types";
import { formatModuleNumber } from "@/lib/utils";
import { BrandLogo } from "@/components/BrandLogo";
import { AddModuleModal } from "@/components/AddModuleModal";
import { EditCourseModal } from "@/components/EditCourseModal";
import { EditModuleModal } from "@/components/EditModuleModal";
import { EditSchoolModal } from "@/components/EditSchoolModal";
import { ConfirmModal } from "@/components/ConfirmModal";
import { Footer } from "@/components/Footer";
import {
  Layers,
  Plus,
  ArrowLeft,
  GraduationCap,
  BookOpen,
  FolderOpen,
  Edit,
  Trash2,
  Copy,
  Archive,
  ArchiveRestore,
  ExternalLink,
  Search,
  Filter,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ShieldAlert,
  Building2,
  Sparkles,
} from "lucide-react";

export default function AdminPage() {
  const [catalog, setCatalog] = useState<EcoleWithCourses[]>([]);
  const [stats, setStats] = useState<CatalogStats>({
    totalEcoles: 0,
    totalCours: 0,
    totalModules: 0,
    totalArchives: 0,
  });
  const [loading, setLoading] = useState(true);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"courses" | "schools">("courses");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEcoleFilter, setSelectedEcoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "actif" | "archive">("all");

  // Expanded courses map
  const [expandedCourses, setExpandedCourses] = useState<Record<string, boolean>>({});

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSchool, setEditingSchool] = useState<Ecole | null>(null);
  const [editingCourse, setEditingCourse] = useState<CoursWithDetails | null>(null);
  const [editingModule, setEditingModule] = useState<Module | null>(null);

  // Confirmation modal
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    isDestructive?: boolean;
    onConfirm: () => Promise<void>;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: async () => {},
  });

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Chargement des données
  const loadData = async () => {
    try {
      setGlobalError(null);
      const [catRes, statsRes] = await Promise.all([
        fetch("/api/catalog?all=true", {
          cache: "no-store",
          headers: { "Cache-Control": "no-cache" },
        }),
        fetch("/api/stats", {
          cache: "no-store",
          headers: { "Cache-Control": "no-cache" },
        }),
      ]);

      if (!catRes.ok) {
        const errData = await catRes.json().catch(() => ({ error: "Erreur serveur" }));
        throw new Error(errData.error || "Impossible de charger le catalogue Supabase");
      }

      const catData: EcoleWithCourses[] = await catRes.json();
      const statsData: CatalogStats = await statsRes.json();
      setCatalog(catData);
      setStats(statsData);

      // Déplier tous les cours par défaut
      const initialExpanded: Record<string, boolean> = {};
      catData.forEach((e) => {
        e.courses.forEach((c) => {
          initialExpanded[c.id] = true;
        });
      });
      setExpandedCourses((prev) => ({ ...initialExpanded, ...prev }));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur Supabase";
      console.error("Erreur de chargement des données admin:", msg);
      setGlobalError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const toggleCourseExpand = (courseId: string) => {
    setExpandedCourses((prev) => ({
      ...prev,
      [courseId]: !prev[courseId],
    }));
  };

  // ===============================
  // GESTION DES ÉCOLES (CRUD)
  // ===============================
  const handleDeleteSchool = (ecole: Ecole) => {
    setConfirmConfig({
      isOpen: true,
      title: "Supprimer l'école",
      message: `Attention : Voulez-vous vraiment supprimer définitivement l'école "${ecole.nom}" ? Tous les cours et modules rattachés à cette école seront supprimés en cascade.`,
      confirmLabel: "Supprimer l'école",
      isDestructive: true,
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/ecoles/${ecole.id}`, { method: "DELETE" });
          if (res.ok) {
            showToast(`L'école "${ecole.nom}" a été supprimée.`);
            await loadData();
          } else {
            const data = await res.json();
            alert(data.error || "Erreur lors de la suppression de l'école.");
          }
        } catch {
          alert("Erreur réseau lors de la suppression.");
        } finally {
          setConfirmConfig((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  const handleToggleArchiveSchool = async (ecole: Ecole) => {
    const newStatus = !ecole.statut;
    try {
      const res = await fetch(`/api/ecoles/${ecole.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statut: newStatus }),
      });
      if (res.ok) {
        showToast(
          newStatus
            ? `École "${ecole.nom}" réactivée.`
            : `École "${ecole.nom}" mise en sommeil / archivée.`
        );
        await loadData();
      }
    } catch {
      alert("Erreur lors de la modification de l'école.");
    }
  };

  // ===============================
  // GESTION DES COURS (CRUD)
  // ===============================
  const handleDeleteCourse = (course: CoursWithDetails) => {
    setConfirmConfig({
      isOpen: true,
      title: "Supprimer le cours",
      message: `Êtes-vous sûr de vouloir supprimer définitivement le cours "${course.nom_cours}" ? Tous ses modules (${course.modules.length}) seront également supprimés.`,
      confirmLabel: "Supprimer définitivement",
      isDestructive: true,
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/courses/${course.id}`, { method: "DELETE" });
          if (res.ok) {
            showToast(`Le cours "${course.nom_cours}" a été supprimé.`);
            await loadData();
          } else {
            const data = await res.json();
            alert(data.error || "Erreur de suppression");
          }
        } catch {
          alert("Erreur lors de la suppression du cours.");
        } finally {
          setConfirmConfig((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  const handleToggleArchiveCourse = async (course: CoursWithDetails) => {
    const newStatus = course.statut === "archive" ? "actif" : "archive";
    try {
      const res = await fetch(`/api/courses/${course.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statut: newStatus }),
      });
      if (res.ok) {
        showToast(
          newStatus === "archive"
            ? `Cours "${course.nom_cours}" archivé.`
            : `Cours "${course.nom_cours}" réactivé.`
        );
        await loadData();
      }
    } catch {
      alert("Erreur lors de la modification du statut.");
    }
  };

  // ===============================
  // GESTION DES MODULES (CRUD)
  // ===============================
  const handleDeleteModule = (module: Module, courseName: string) => {
    setConfirmConfig({
      isOpen: true,
      title: "Supprimer le module",
      message: `Confirmez-vous la suppression du module ${module.numero_module} — "${module.sous_titre}" du cours "${courseName}" ?`,
      confirmLabel: "Supprimer le module",
      isDestructive: true,
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/modules/${module.id}`, { method: "DELETE" });
          if (res.ok) {
            showToast(`Module ${module.numero_module} supprimé.`);
            await loadData();
          } else {
            const data = await res.json();
            alert(data.error || "Erreur de suppression");
          }
        } catch {
          alert("Erreur lors de la suppression du module.");
        } finally {
          setConfirmConfig((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  const handleDuplicateModule = async (module: Module) => {
    try {
      const res = await fetch(`/api/modules/${module.id}/duplicate`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        showToast(`Module dupliqué avec le numéro ${data.module.numero_module}.`);
        await loadData();
      } else {
        alert(data.error || "Erreur de duplication");
      }
    } catch {
      alert("Erreur lors de la duplication.");
    }
  };

  const handleResetDemo = () => {
    setConfirmConfig({
      isOpen: true,
      title: "Réinitialiser les données de démo",
      message:
        "Cette action va restaurer les données initiales officielles (École A, École B, École C avec leurs cours et modules d'exemple). Toutes vos modifications personnalisées seront réinitialisées.",
      confirmLabel: "Réinitialiser les données",
      isDestructive: false,
      onConfirm: async () => {
        try {
          const res = await fetch("/api/reset-demo", { method: "POST" });
          if (res.ok) {
            showToast("Données de démonstration réinitialisées avec succès.");
            await loadData();
          }
        } catch {
          alert("Erreur lors de la réinitialisation.");
        } finally {
          setConfirmConfig((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  // Filtrage
  const filteredCatalog = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return catalog
      .filter((ecole) => {
        if (selectedEcoleFilter && ecole.id !== selectedEcoleFilter) return false;
        return true;
      })
      .map((ecole) => {
        const filteredCourses = ecole.courses.filter((course) => {
          if (statusFilter !== "all" && course.statut !== statusFilter) return false;

          if (!q) return true;

          const matchCourseName = course.nom_cours.toLowerCase().includes(q);
          const matchThematique = course.thematique?.toLowerCase().includes(q);
          const matchEcole = ecole.nom.toLowerCase().includes(q);
          const matchModule = course.modules?.some(
            (m) =>
              m.sous_titre.toLowerCase().includes(q) ||
              String(m.numero_module).includes(q)
          );

          return matchCourseName || matchThematique || matchEcole || matchModule;
        });

        return {
          ...ecole,
          courses: filteredCourses,
        };
      })
      .filter((ecole) => ecole.courses.length > 0 || !searchQuery);
  }, [catalog, searchQuery, selectedEcoleFilter, statusFilter]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F8FA] selection:bg-[#4568F5]/20 selection:text-[#4568F5]">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 bg-[#0D1117] text-white rounded-xl shadow-xl border border-[#333333] text-xs font-semibold animate-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Avertissement de sécurité */}
      <div className="w-full bg-amber-50 border-b border-amber-200/80 px-4 py-2.5 text-xs text-amber-900">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
            <span className="font-bold">Espace d&apos;administration simplifié :</span>
            <span className="hidden sm:inline">
              Accès direct sans mot de passe pour faciliter vos ajouts. Ne pas exposer publiquement sans protection d&apos;accès.
            </span>
          </div>
          <span className="text-[11px] font-mono text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded shrink-0">
            /admin
          </span>
        </div>
      </div>

      {/* Top Header Admin */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-[#EAECEF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 gap-4">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="flex items-center gap-1.5 text-xs font-semibold text-[#777777] hover:text-[#171717] p-2 rounded-xl hover:bg-[#F7F8FA] transition-colors"
                title="Revenir sur l'interface publique"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Retour au site public</span>
              </Link>
              <div className="h-5 w-px bg-[#EAECEF]" />
              <BrandLogo size="sm" withTagline={false} />
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleResetDemo}
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#777777] hover:text-[#171717] bg-white border border-[#EAECEF] hover:bg-[#F7F8FA] rounded-xl transition-colors shadow-xs"
                title="Rétablir les données d'exemple"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Données de démo</span>
              </button>

              <button
                type="button"
                onClick={() => setIsAddModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-[#4568F5] hover:bg-[#3654D9] rounded-xl shadow-[0_2px_8px_rgba(69,104,245,0.25)] hover:shadow-[0_4px_14px_rgba(69,104,245,0.35)] transition-all"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>+ AJOUTER UN MODULE</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Admin Area */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Error Banner Supabase */}
        {globalError && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-900 text-xs flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold">Erreur de connexion Supabase :</p>
              <p className="mt-1 font-mono text-[11px]">{globalError}</p>
              <p className="mt-2 text-[#666666]">
                Vérifiez que vos variables NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY sont renseignées et que les tables existent.
              </p>
            </div>
            <button
              type="button"
              onClick={loadData}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shrink-0"
            >
              Réessayer
            </button>
          </div>
        )}

        {/* Dashboard Metric Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-2xl border border-[#EAECEF] shadow-xs">
            <div className="flex items-center justify-between text-[#777777] mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Écoles</span>
              <GraduationCap className="w-4 h-4 text-[#4568F5]" />
            </div>
            <div className="text-2xl font-extrabold text-[#171717]">{stats.totalEcoles}</div>
            <p className="text-[11px] text-[#777777] mt-1">Établissements partenaires</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#EAECEF] shadow-xs">
            <div className="flex items-center justify-between text-[#777777] mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Cours</span>
              <BookOpen className="w-4 h-4 text-[#4568F5]" />
            </div>
            <div className="text-2xl font-extrabold text-[#171717]">{stats.totalCours}</div>
            <p className="text-[11px] text-[#777777] mt-1">Formations répertoriées</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#EAECEF] shadow-xs">
            <div className="flex items-center justify-between text-[#777777] mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Modules</span>
              <Layers className="w-4 h-4 text-[#4568F5]" />
            </div>
            <div className="text-2xl font-extrabold text-[#171717]">{stats.totalModules}</div>
            <p className="text-[11px] text-[#777777] mt-1">Liens de cours actifs</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#EAECEF] shadow-xs">
            <div className="flex items-center justify-between text-[#777777] mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Archivés</span>
              <Archive className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-extrabold text-[#171717]">{stats.totalArchives}</div>
            <p className="text-[11px] text-[#777777] mt-1">Masqués du catalogue</p>
          </div>
        </div>

        {/* Navigation Tabs (Cours vs Écoles) */}
        <div className="flex items-center gap-2 mb-6 border-b border-[#EAECEF] pb-2">
          <button
            type="button"
            onClick={() => setActiveTab("courses")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "courses"
                ? "bg-[#171717] text-white shadow-xs"
                : "bg-white text-[#777777] hover:text-[#171717] border border-[#EAECEF]"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Cours & Modules ({stats.totalCours})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("schools")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "schools"
                ? "bg-[#171717] text-white shadow-xs"
                : "bg-white text-[#777777] hover:text-[#171717] border border-[#EAECEF]"
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Gestion des Écoles ({catalog.length})</span>
          </button>
        </div>

        {/* ======================================================== */}
        {/* TAB 1 : GESTION DES COURS & MODULES                      */}
        {/* ======================================================== */}
        {activeTab === "courses" && (
          <>
            {/* Filter and Search Bar */}
            <div className="bg-white p-4 rounded-2xl border border-[#EAECEF] shadow-xs mb-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#888888] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filtrer par cours, école, module..."
                  className="w-full pl-9 pr-3 py-2 text-xs bg-[#F7F8FA] border border-[#EAECEF] rounded-xl text-[#171717] focus:outline-none focus:border-[#4568F5]"
                />
              </div>

              <div className="flex items-center gap-2.5 overflow-x-auto">
                <select
                  value={selectedEcoleFilter}
                  onChange={(e) => setSelectedEcoleFilter(e.target.value)}
                  className="text-xs bg-[#F7F8FA] border border-[#EAECEF] rounded-xl px-3 py-2 text-[#171717] focus:outline-none focus:border-[#4568F5]"
                >
                  <option value="">Toutes les écoles</option>
                  {catalog.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.nom}
                    </option>
                  ))}
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as "all" | "actif" | "archive")}
                  className="text-xs bg-[#F7F8FA] border border-[#EAECEF] rounded-xl px-3 py-2 text-[#171717] focus:outline-none focus:border-[#4568F5]"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="actif">Actifs uniquement</option>
                  <option value="archive">Archivés uniquement</option>
                </select>
              </div>
            </div>

            {/* List of Courses grouped by school */}
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center text-center">
                <div className="w-8 h-8 border-2 border-[#4568F5] border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-sm text-[#777777]">Chargement des données...</p>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredCatalog.length === 0 ? (
                  <div className="bg-white p-12 text-center rounded-2xl border border-dashed border-[#EAECEF]">
                    <FolderOpen className="w-8 h-8 text-[#999999] mx-auto mb-3" />
                    <h3 className="text-sm font-bold text-[#171717]">Aucun cours trouvé</h3>
                    <p className="text-xs text-[#777777] mt-1">
                      Créez un module pour initialiser un cours ou réinitialisez les filtres.
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsAddModalOpen(true)}
                      className="mt-4 px-4 py-2 text-xs font-bold text-white bg-[#4568F5] rounded-xl hover:bg-[#3654D9]"
                    >
                      + Ajouter un module
                    </button>
                  </div>
                ) : (
                  filteredCatalog.map((ecole) => (
                    <div
                      key={ecole.id}
                      className="bg-white rounded-2xl border border-[#EAECEF] shadow-xs overflow-hidden"
                    >
                      {/* School Section Banner */}
                      <div className="px-6 py-4 bg-gradient-to-r from-white to-[#F7F8FA] border-b border-[#EAECEF] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-[#0D1117] text-white flex items-center justify-center shadow-xs">
                            <GraduationCap className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h2 className="text-sm font-bold text-[#171717]">{ecole.nom}</h2>
                              {!ecole.statut && (
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                                  Archivée
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-[#777777]">
                              {ecole.courses.length} cours rattaché(s)
                            </p>
                          </div>
                        </div>

                        {/* Actions sur l'école */}
                        <div className="flex items-center gap-1.5 self-end sm:self-center">
                          <button
                            type="button"
                            onClick={() => setEditingSchool(ecole)}
                            className="px-2.5 py-1.5 text-[11px] font-semibold text-[#777777] hover:text-[#171717] hover:bg-white border border-[#EAECEF] rounded-lg transition-colors flex items-center gap-1"
                            title="Modifier le nom de l'école"
                          >
                            <Edit className="w-3 h-3" />
                            <span>Modifier l&apos;école</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteSchool(ecole)}
                            className="px-2.5 py-1.5 text-[11px] font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 rounded-lg transition-colors flex items-center gap-1"
                            title="Supprimer définitivement l'école et ses cours"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Supprimer</span>
                          </button>
                        </div>
                      </div>

                      {/* Courses within this school */}
                      <div className="divide-y divide-[#EAECEF]">
                        {ecole.courses.length === 0 ? (
                          <div className="p-6 text-center text-xs text-[#777777]">
                            Aucun cours pour cette école. Cliquez sur &quot;+ AJOUTER UN MODULE&quot; pour en ajouter un.
                          </div>
                        ) : (
                          ecole.courses.map((course) => {
                            const isExpanded = expandedCourses[course.id] ?? true;

                            return (
                              <div key={course.id} className="p-4 sm:p-6 transition-colors">
                                {/* Course Header Row */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                                  <div
                                    onClick={() => toggleCourseExpand(course.id)}
                                    className="flex items-start gap-3 cursor-pointer select-none flex-1"
                                  >
                                    <button
                                      type="button"
                                      className="mt-0.5 text-[#777777] hover:text-[#171717] p-0.5"
                                    >
                                      {isExpanded ? (
                                        <ChevronDown className="w-4 h-4" />
                                      ) : (
                                        <ChevronRight className="w-4 h-4" />
                                      )}
                                    </button>
                                    <div>
                                      <div className="flex flex-wrap items-center gap-2">
                                        <h3 className="text-sm font-bold text-[#171717]">
                                          {course.nom_cours}
                                        </h3>
                                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#4568F5]/10 text-[#4568F5]">
                                          {course.thematique || "Général"}
                                        </span>
                                        {course.statut === "archive" ? (
                                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                                            Archivé
                                          </span>
                                        ) : (
                                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                                            Actif
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-xs text-[#777777] mt-0.5">
                                        {course.modules?.length || 0} module(s) triés numériquement
                                        {course.description && ` · ${course.description}`}
                                      </p>
                                    </div>
                                  </div>

                                  {/* Course Actions */}
                                  <div className="flex items-center gap-1.5 shrink-0 pl-7 sm:pl-0">
                                    <button
                                      type="button"
                                      onClick={() => setEditingCourse(course)}
                                      className="px-2.5 py-1.5 text-xs font-semibold text-[#171717] bg-[#F7F8FA] hover:bg-[#EAECEF] border border-[#EAECEF] rounded-lg transition-colors flex items-center gap-1"
                                      title="Modifier le cours"
                                    >
                                      <Edit className="w-3.5 h-3.5 text-[#777777]" />
                                      <span>Modifier</span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => handleToggleArchiveCourse(course)}
                                      className="px-2.5 py-1.5 text-xs font-semibold text-[#777777] hover:text-[#171717] bg-[#F7F8FA] hover:bg-[#EAECEF] border border-[#EAECEF] rounded-lg transition-colors flex items-center gap-1"
                                      title={course.statut === "archive" ? "Désarchiver" : "Archiver"}
                                    >
                                      {course.statut === "archive" ? (
                                        <>
                                          <ArchiveRestore className="w-3.5 h-3.5 text-emerald-600" />
                                          <span>Réactiver</span>
                                        </>
                                      ) : (
                                        <>
                                          <Archive className="w-3.5 h-3.5 text-amber-600" />
                                          <span>Archiver</span>
                                        </>
                                      )}
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => handleDeleteCourse(course)}
                                      className="px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors flex items-center gap-1"
                                      title="Supprimer le cours et ses modules"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                      <span className="hidden sm:inline">Supprimer</span>
                                    </button>
                                  </div>
                                </div>

                                {/* Table of Modules (if expanded) */}
                                {isExpanded && (
                                  <div className="pl-0 sm:pl-7">
                                    {course.modules.length === 0 ? (
                                      <div className="py-4 px-3 bg-[#F7F8FA] rounded-xl border border-dashed border-[#EAECEF] text-center text-xs text-[#777777]">
                                        Aucun module. Cliquez sur &quot;+ AJOUTER UN MODULE&quot; pour en créer un.
                                      </div>
                                    ) : (
                                      <div className="overflow-x-auto border border-[#EAECEF] rounded-xl">
                                        <table className="w-full text-left text-xs">
                                          <thead className="bg-[#F7F8FA] text-[#777777] font-semibold border-b border-[#EAECEF]">
                                            <tr>
                                              <th className="py-2.5 px-3 w-16">N°</th>
                                              <th className="py-2.5 px-3">Sous-titre du module</th>
                                              <th className="py-2.5 px-3 hidden md:table-cell">Lien externe</th>
                                              <th className="py-2.5 px-3 text-right">Actions</th>
                                            </tr>
                                          </thead>
                                          <tbody className="divide-y divide-[#EAECEF] bg-white">
                                            {course.modules.map((m) => (
                                              <tr key={m.id} className="hover:bg-[#F7F8FA]/60">
                                                <td className="py-2.5 px-3 font-mono font-bold text-[#4568F5]">
                                                  {formatModuleNumber(m.numero_module)}
                                                </td>
                                                <td className="py-2.5 px-3 font-medium text-[#171717]">
                                                  {m.sous_titre}
                                                </td>
                                                <td className="py-2.5 px-3 text-[#777777] max-w-xs truncate hidden md:table-cell">
                                                  <a
                                                    href={m.url_cours}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 text-[#4568F5] hover:underline"
                                                  >
                                                    <span className="truncate">{m.url_cours}</span>
                                                    <ExternalLink className="w-3 h-3 shrink-0" />
                                                  </a>
                                                </td>
                                                <td className="py-2.5 px-3 text-right">
                                                  <div className="inline-flex items-center gap-1 justify-end">
                                                    <button
                                                      type="button"
                                                      onClick={() => setEditingModule(m)}
                                                      className="p-1.5 text-[#777777] hover:text-[#171717] rounded-lg hover:bg-[#F7F8FA]"
                                                      title="Modifier ce module"
                                                    >
                                                      <Edit className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                      type="button"
                                                      onClick={() => handleDuplicateModule(m)}
                                                      className="p-1.5 text-[#777777] hover:text-[#4568F5] rounded-lg hover:bg-[#F7F8FA]"
                                                      title="Dupliquer ce module (nouveau numéro automatique)"
                                                    >
                                                      <Copy className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                      type="button"
                                                      onClick={() =>
                                                        handleDeleteModule(m, course.nom_cours)
                                                      }
                                                      className="p-1.5 text-red-500 hover:text-red-700 rounded-lg hover:bg-red-50"
                                                      title="Supprimer ce module"
                                                    >
                                                      <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                  </div>
                                                </td>
                                              </tr>
                                            ))}
                                          </tbody>
                                        </table>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}

        {/* ======================================================== */}
        {/* TAB 2 : GESTION DÉDIÉE DES ÉCOLES                        */}
        {/* ======================================================== */}
        {activeTab === "schools" && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-[#EAECEF] shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-[#171717]">Écoles partenaires répertoriées</h3>
                  <p className="text-xs text-[#777777]">
                    Renommez, archivez ou supprimez définitivement les écoles et leurs cours associés.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto border border-[#EAECEF] rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F7F8FA] text-[#777777] font-semibold border-b border-[#EAECEF]">
                    <tr>
                      <th className="py-3 px-4">Établissement</th>
                      <th className="py-3 px-4">Cours rattachés</th>
                      <th className="py-3 px-4">Modules totaux</th>
                      <th className="py-3 px-4">Statut</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EAECEF] bg-white">
                    {catalog.map((ecole) => {
                      const totalModulesInSchool = ecole.courses.reduce(
                        (acc, c) => acc + (c.modules?.length || 0),
                        0
                      );

                      return (
                        <tr key={ecole.id} className="hover:bg-[#F7F8FA]/60">
                          <td className="py-3.5 px-4 font-bold text-[#171717]">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-lg bg-[#0D1117] text-white flex items-center justify-center shrink-0">
                                <GraduationCap className="w-3.5 h-3.5" />
                              </div>
                              <span>{ecole.nom}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-[#171717]">
                            {ecole.courses.length} cours
                          </td>
                          <td className="py-3.5 px-4 text-[#777777]">
                            {totalModulesInSchool} modules
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                ecole.statut
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {ecole.statut ? "Active" : "Archivée"}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="inline-flex items-center gap-2 justify-end">
                              <button
                                type="button"
                                onClick={() => setEditingSchool(ecole)}
                                className="px-2.5 py-1.5 text-xs font-semibold text-[#171717] bg-[#F7F8FA] hover:bg-[#EAECEF] border border-[#EAECEF] rounded-lg transition-colors flex items-center gap-1"
                                title="Modifier le nom de l'école"
                              >
                                <Edit className="w-3 h-3 text-[#777777]" />
                                <span>Modifier</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleToggleArchiveSchool(ecole)}
                                className="px-2.5 py-1.5 text-xs font-semibold text-[#777777] hover:text-[#171717] bg-[#F7F8FA] hover:bg-[#EAECEF] border border-[#EAECEF] rounded-lg transition-colors"
                              >
                                {ecole.statut ? "Archiver" : "Réactiver"}
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDeleteSchool(ecole)}
                                className="px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors flex items-center gap-1"
                                title="Supprimer l'école et tous ses cours"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>Supprimer</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modal d'ajout de module */}
      <AddModuleModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          showToast("Nouveau module enregistré avec succès !");
          loadData();
        }}
        catalog={catalog}
      />

      {/* Modal d'édition d'école */}
      <EditSchoolModal
        isOpen={Boolean(editingSchool)}
        onClose={() => setEditingSchool(null)}
        onSuccess={() => {
          showToast("École mise à jour avec succès.");
          loadData();
        }}
        ecole={editingSchool}
      />

      {/* Modal d'édition de cours */}
      <EditCourseModal
        isOpen={Boolean(editingCourse)}
        onClose={() => setEditingCourse(null)}
        onSuccess={() => {
          showToast("Cours mis à jour avec succès.");
          loadData();
        }}
        course={editingCourse}
      />

      {/* Modal d'édition de module */}
      <EditModuleModal
        isOpen={Boolean(editingModule)}
        onClose={() => setEditingModule(null)}
        onSuccess={() => {
          showToast("Module mis à jour avec succès.");
          loadData();
        }}
        module={editingModule}
      />

      {/* Modal de confirmation */}
      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmConfig.onConfirm}
        title={confirmConfig.title}
        message={confirmConfig.message}
        confirmLabel={confirmConfig.confirmLabel}
        isDestructive={confirmConfig.isDestructive}
      />

      {/* Footer Minimaliste */}
      <Footer isAdmin={true} />
    </div>
  );
}
