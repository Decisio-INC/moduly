"use client";

import { useState, useEffect, useMemo } from "react";
import { EcoleWithCourses } from "@/types";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CourseCard } from "@/components/CourseCard";
import {
  GraduationCap,
  Search,
  Sparkles,
  BookOpen,
  Layers,
  Zap,
  ShieldCheck,
  ExternalLink,
  ArrowRight,
  Filter,
  AlertTriangle,
} from "lucide-react";

export default function HomePage() {
  const [catalog, setCatalog] = useState<EcoleWithCourses[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEcole, setSelectedEcole] = useState("");
  const [selectedThematique, setSelectedThematique] = useState("");

  const fetchCatalog = async () => {
    try {
      setErrorMessage(null);
      const res = await fetch("/api/catalog", {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erreur lors du chargement des données.");
      }
      setCatalog(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur de connexion";
      console.error("Erreur lors de la récupération du catalogue:", msg);
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, []);

  // Extraire la liste des écoles pour les filtres
  const ecolesList = useMemo(() => {
    return catalog.map((e) => ({ id: e.id, nom: e.nom }));
  }, [catalog]);

  // Extraire la liste des thématiques uniques
  const thematiquesList = useMemo(() => {
    const set = new Set<string>();
    catalog.forEach((e) => {
      e.courses.forEach((c) => {
        if (c.thematique) set.add(c.thematique);
      });
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, "fr"));
  }, [catalog]);

  // Calcul des statistiques globales
  const totalStats = useMemo(() => {
    let totalCourses = 0;
    let totalModules = 0;
    catalog.forEach((e) => {
      totalCourses += e.courses.length;
      e.courses.forEach((c) => {
        totalModules += c.modules?.length || 0;
      });
    });
    return {
      totalEcoles: catalog.length,
      totalCourses,
      totalModules,
    };
  }, [catalog]);

  // Filtrage réactif et instantané
  const filteredCatalog = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return catalog
      .filter((ecole) => {
        if (selectedEcole && ecole.id !== selectedEcole) return false;
        return true;
      })
      .map((ecole) => {
        const matchingCourses = ecole.courses.filter((course) => {
          // Filtre thématique
          if (
            selectedThematique &&
            course.thematique?.toLowerCase() !== selectedThematique.toLowerCase()
          ) {
            return false;
          }

          // Filtre texte
          if (!q) return true;

          const matchCourseName = course.nom_cours.toLowerCase().includes(q);
          const matchThematique = course.thematique?.toLowerCase().includes(q);
          const matchEcole = ecole.nom.toLowerCase().includes(q);
          const matchModule = course.modules?.some((m) =>
            m.sous_titre.toLowerCase().includes(q)
          );

          return matchCourseName || matchThematique || matchEcole || matchModule;
        });

        return {
          ...ecole,
          courses: matchingCourses,
        };
      })
      .filter((ecole) => ecole.courses.length > 0);
  }, [catalog, searchQuery, selectedEcole, selectedThematique]);

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#171717] selection:bg-[#4568F5]/20 selection:text-[#4568F5]">
      {/* Header */}
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedEcole={selectedEcole}
        onSelectEcole={setSelectedEcole}
        selectedThematique={selectedThematique}
        onSelectThematique={setSelectedThematique}
        ecolesList={ecolesList}
        thematiquesList={thematiquesList}
      />

      {/* Main Landing Content */}
      <main className="flex-1 w-full">
        {/* Ambient Top Glow */}
        <div className="relative overflow-hidden pt-8 pb-14 sm:pt-14 sm:pb-20 border-b border-[#EAECEF] bg-gradient-to-b from-[#F7F8FA] via-white to-white">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-br from-[#4568F5]/10 via-[#6366F1]/5 to-transparent rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            {/* Top Badge */}
            <div className="flex justify-center mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#EAECEF] shadow-[0_2px_8px_rgba(0,0,0,0.03)] text-xs font-semibold text-[#171717]">
                <span className="w-2 h-2 rounded-full bg-[#4568F5] animate-pulse" />
                <span className="text-[#4568F5] font-bold">MODULY PRO</span>
                <span className="text-[#CCCCCC]">|</span>
                <span className="text-[#666666]">Plateforme d&apos;excellence pour enseignants & intervenants</span>
              </div>
            </div>

            {/* Hero Main Headline */}
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-[-0.04em] text-[#171717] leading-[1.08]">
                Tous vos cours & modules. <br />
                <span className="bg-gradient-to-r from-[#4568F5] via-[#5A77F8] to-[#7B92FF] bg-clip-text text-transparent">
                  Réunis en un seul endroit.
                </span>
              </h1>

              <p className="text-base sm:text-xl text-[#666666] mt-6 max-w-2xl mx-auto font-normal leading-relaxed">
                Centralisez vos liens de cours dispersés à travers différentes écoles et plateformes web.
                Le moteur déterministe classe automatiquement chaque module pour vos étudiants.
              </p>
            </div>

            {/* 3 Bento Feature Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mt-12 sm:mt-16 max-w-5xl mx-auto">
              <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#EAECEF] shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:border-[#4568F5]/30 transition-all duration-200">
                <div className="w-10 h-10 rounded-xl bg-[#4568F5]/10 text-[#4568F5] flex items-center justify-center mb-4">
                  <Zap className="w-5 h-5 stroke-[2.2]" />
                </div>
                <h3 className="text-sm font-bold text-[#171717] tracking-tight">Classement Déterministe</h3>
                <p className="text-xs text-[#777777] mt-1.5 leading-relaxed">
                  Tri numérique strict (1, 2, 3, 10) instantané, même en cas d&apos;insertion de modules dans le désordre.
                </p>
              </div>

              <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#EAECEF] shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:border-[#4568F5]/30 transition-all duration-200">
                <div className="w-10 h-10 rounded-xl bg-[#171717]/5 text-[#171717] flex items-center justify-center mb-4">
                  <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
                </div>
                <h3 className="text-sm font-bold text-[#171717] tracking-tight">Isolation Multi-Écoles</h3>
                <p className="text-xs text-[#777777] mt-1.5 leading-relaxed">
                  Deux écoles peuvent partager un cours de même nom en toute indépendance et sans collision.
                </p>
              </div>

              <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#EAECEF] shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:border-[#4568F5]/30 transition-all duration-200">
                <div className="w-10 h-10 rounded-xl bg-[#4568F5]/10 text-[#4568F5] flex items-center justify-center mb-4">
                  <ExternalLink className="w-5 h-5 stroke-[2.2]" />
                </div>
                <h3 className="text-sm font-bold text-[#171717] tracking-tight">Accès Direct 1-Clic</h3>
                <p className="text-xs text-[#777777] mt-1.5 leading-relaxed">
                  Ouverture sécurisée dans un nouvel onglet sans redirection superflue pour vos apprenants.
                </p>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            {!loading && (
              <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 mt-10 text-xs text-[#666666]">
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-[#EAECEF] shadow-xs">
                  <GraduationCap className="w-4 h-4 text-[#4568F5]" />
                  <span className="font-bold text-[#171717]">{totalStats.totalEcoles}</span>
                  <span>écoles partenaires</span>
                </div>
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-[#EAECEF] shadow-xs">
                  <BookOpen className="w-4 h-4 text-[#4568F5]" />
                  <span className="font-bold text-[#171717]">{totalStats.totalCourses}</span>
                  <span>cours répertoriés</span>
                </div>
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-[#EAECEF] shadow-xs">
                  <Layers className="w-4 h-4 text-[#4568F5]" />
                  <span className="font-bold text-[#171717]">{totalStats.totalModules}</span>
                  <span>modules centralisés</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Course Catalog Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          {/* Section Title & Filter Pills */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 pb-6 border-b border-[#EAECEF]">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#4568F5] mb-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Bibliothèque académique</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#171717] tracking-tight">
                Catalogue des formations
              </h2>
            </div>

            {/* Quick School Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              <button
                type="button"
                onClick={() => setSelectedEcole("")}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all ${
                  selectedEcole === ""
                    ? "bg-[#171717] text-white shadow-sm"
                    : "bg-[#F7F8FA] text-[#666666] hover:bg-[#EAECEF]"
                }`}
              >
                Toutes ({catalog.length})
              </button>
              {ecolesList.map((e) => (
                <button
                  key={e.id}
                  type="button"
                  onClick={() => setSelectedEcole(e.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all ${
                    selectedEcole === e.id
                      ? "bg-[#4568F5] text-white shadow-sm"
                      : "bg-[#F7F8FA] text-[#666666] hover:bg-[#EAECEF]"
                  }`}
                >
                  {e.nom}
                </button>
              ))}
            </div>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-8 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-900 text-xs flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Erreur de chargement Supabase :</p>
                <p className="mt-0.5 font-mono">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Loading Spinner */}
          {loading && (
            <div className="py-24 flex flex-col items-center justify-center text-center">
              <div className="w-10 h-10 border-3 border-[#4568F5] border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-sm font-medium text-[#777777]">Chargement des cours et modules...</p>
            </div>
          )}

          {/* Grouped Catalog View */}
          {!loading && (
            <div className="space-y-16">
              {filteredCatalog.length === 0 ? (
                <div className="py-20 text-center bg-[#F7F8FA] rounded-3xl border border-dashed border-[#EAECEF] px-4 max-w-xl mx-auto">
                  <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center mx-auto mb-4 border border-[#EAECEF]">
                    <Search className="w-5 h-5 text-[#888888]" />
                  </div>
                  <h3 className="text-base font-bold text-[#171717]">
                    Aucun résultat correspondant
                  </h3>
                  <p className="text-xs text-[#777777] mt-1.5 max-w-sm mx-auto leading-relaxed">
                    Aucun cours ou module ne correspond à vos filtres actuels. Modifiez votre recherche ou réinitialisez les sélections.
                  </p>
                  {(searchQuery || selectedEcole || selectedThematique) && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery("");
                        setSelectedEcole("");
                        setSelectedThematique("");
                      }}
                      className="mt-5 px-4 py-2 text-xs font-bold text-white bg-[#4568F5] rounded-xl hover:bg-[#3654D9] transition-colors shadow-sm"
                    >
                      Réinitialiser tous les filtres
                    </button>
                  )}
                </div>
              ) : (
                filteredCatalog.map((ecole) => (
                  <div key={ecole.id} className="space-y-6">
                    {/* School Section Banner */}
                    <div className="flex items-center justify-between pb-3.5 border-b border-[#EAECEF]">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#0D1117] text-white flex items-center justify-center shadow-xs">
                          <GraduationCap className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-lg sm:text-xl font-bold text-[#171717] tracking-tight">
                            {ecole.nom}
                          </h3>
                          <p className="text-xs text-[#777777]">
                            {ecole.courses.length} {ecole.courses.length > 1 ? "formations actives" : "formation active"}
                          </p>
                        </div>
                      </div>

                      <span className="text-xs font-bold px-3 py-1 bg-[#F7F8FA] border border-[#EAECEF] rounded-full text-[#777777]">
                        {ecole.courses.reduce((acc, c) => acc + (c.modules?.length || 0), 0)} modules au total
                      </span>
                    </div>

                    {/* Grid of Courses */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {ecole.courses.map((course) => (
                        <CourseCard key={course.id} course={course} />
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </section>
      </main>

      {/* Footer Minimaliste avec lien discret Administration vers /admin */}
      <Footer isAdmin={false} />
    </div>
  );
}
