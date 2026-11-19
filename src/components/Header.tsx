"use client";

import { useEffect, useRef } from "react";
import { Search, X, Filter, Sparkles } from "lucide-react";
import { BrandLogo } from "./BrandLogo";

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedEcole: string;
  onSelectEcole: (ecoleId: string) => void;
  selectedThematique: string;
  onSelectThematique: (thematique: string) => void;
  ecolesList: { id: string; nom: string }[];
  thematiquesList: string[];
}

export function Header({
  searchQuery,
  onSearchChange,
  selectedEcole,
  onSelectEcole,
  selectedThematique,
  onSelectThematique,
  ecolesList,
  thematiquesList,
}: HeaderProps) {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const hasActiveFilters = searchQuery !== "" || selectedEcole !== "" || selectedThematique !== "";

  // Shortcut ⌘K / Ctrl+K pour ouvrir la recherche
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <header className="sticky top-0 z-30 w-full bg-white/80 backdrop-blur-xl border-b border-[#EAECEF] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4 sm:gap-6">
          {/* Logo Brand */}
          <div className="shrink-0">
            <BrandLogo size="md" />
          </div>

          {/* Search bar premium style */}
          <div className="flex-1 max-w-lg mx-2 sm:mx-6">
            <div className="relative group">
              <Search className="w-4 h-4 text-[#888888] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none group-focus-within:text-[#4568F5] transition-colors" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Rechercher un cours, une école, un module..."
                className="w-full pl-10 pr-16 py-2.5 text-xs sm:text-sm bg-[#F7F8FA] hover:bg-[#F2F4F7] focus:bg-white border border-[#EAECEF] focus:border-[#4568F5] rounded-xl text-[#171717] placeholder-[#888888] focus:outline-none focus:ring-4 focus:ring-[#4568F5]/10 transition-all duration-200 shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none">
                {searchQuery ? (
                  <button
                    type="button"
                    onClick={() => onSearchChange("")}
                    className="pointer-events-auto p-1 text-[#888888] hover:text-[#171717] rounded-md transition-colors"
                    aria-label="Effacer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono text-[#888888] bg-white border border-[#EAECEF] rounded shadow-xs">
                    ⌘K
                  </kbd>
                )}
              </div>
            </div>
          </div>

          {/* Desktop Filter Pills */}
          <div className="hidden lg:flex items-center gap-2.5">
            {/* Filter by School */}
            <div className="relative">
              <select
                value={selectedEcole}
                onChange={(e) => onSelectEcole(e.target.value)}
                className={`text-xs font-medium border rounded-xl px-3.5 py-2.5 focus:outline-none transition-all cursor-pointer ${
                  selectedEcole
                    ? "bg-[#4568F5]/5 border-[#4568F5] text-[#4568F5] ring-2 ring-[#4568F5]/10"
                    : "bg-[#F7F8FA] hover:bg-[#F2F4F7] border-[#EAECEF] text-[#171717]"
                }`}
              >
                <option value="">Toutes les écoles ({ecolesList.length})</option>
                {ecolesList.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.nom}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter by Theme */}
            <div className="relative">
              <select
                value={selectedThematique}
                onChange={(e) => onSelectThematique(e.target.value)}
                className={`text-xs font-medium border rounded-xl px-3.5 py-2.5 focus:outline-none transition-all cursor-pointer ${
                  selectedThematique
                    ? "bg-[#4568F5]/5 border-[#4568F5] text-[#4568F5] ring-2 ring-[#4568F5]/10"
                    : "bg-[#F7F8FA] hover:bg-[#F2F4F7] border-[#EAECEF] text-[#171717]"
                }`}
              >
                <option value="">Toutes les thématiques</option>
                {thematiquesList.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={() => {
                  onSearchChange("");
                  onSelectEcole("");
                  onSelectThematique("");
                }}
                className="text-xs font-semibold text-[#4568F5] hover:text-[#3654D9] px-2.5 py-2 rounded-lg hover:bg-[#4568F5]/5 transition-colors"
              >
                Réinitialiser
              </button>
            )}
          </div>
        </div>

        {/* Mobile filter bar */}
        <div className="flex lg:hidden items-center gap-2 pb-3.5 overflow-x-auto no-scrollbar">
          <Filter className="w-3.5 h-3.5 text-[#888888] shrink-0 ml-1" />
          <select
            value={selectedEcole}
            onChange={(e) => onSelectEcole(e.target.value)}
            className="text-xs bg-[#F7F8FA] border border-[#EAECEF] rounded-lg px-2.5 py-1.5 text-[#171717]"
          >
            <option value="">Écoles ({ecolesList.length})</option>
            {ecolesList.map((e) => (
              <option key={e.id} value={e.id}>
                {e.nom}
              </option>
            ))}
          </select>

          <select
            value={selectedThematique}
            onChange={(e) => onSelectThematique(e.target.value)}
            className="text-xs bg-[#F7F8FA] border border-[#EAECEF] rounded-lg px-2.5 py-1.5 text-[#171717]"
          >
            <option value="">Thématiques</option>
            {thematiquesList.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => {
                onSearchChange("");
                onSelectEcole("");
                onSelectThematique("");
              }}
              className="text-xs font-semibold text-[#4568F5] shrink-0 px-2.5 py-1 bg-[#4568F5]/10 rounded-lg"
            >
              Effacer
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
