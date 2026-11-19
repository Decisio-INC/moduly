"use client";

import { useState } from "react";
import { CoursWithDetails } from "@/types";
import { ModuleItem } from "./ModuleItem";
import { ChevronDown, ChevronUp, BookOpen, Layers, Sparkles } from "lucide-react";

interface CourseCardProps {
  course: CoursWithDetails;
  defaultExpanded?: boolean;
}

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter((w) => w.length > 2)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("") || name.slice(0, 2).toUpperCase();
}

export function CourseCard({ course, defaultExpanded = true }: CourseCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const moduleCount = course.modules?.length || 0;
  const schoolInitials = course.ecole ? getInitials(course.ecole.nom) : "MO";

  return (
    <div className="group relative bg-white rounded-2xl border border-[#EAECEF] hover:border-[#4568F5]/30 transition-all duration-300 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_32px_rgba(69,104,245,0.08)] flex flex-col overflow-hidden">
      {/* Top subtle highlight line on hover */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#4568F5] to-[#7B92FF] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Course Header */}
      <div className="p-6 pb-4 border-b border-[#F7F8FA]">
        <div className="flex items-center justify-between gap-3 mb-3">
          {/* School monogram & Name */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded-md bg-[#4568F5]/10 text-[#4568F5] flex items-center justify-center text-[10px] font-bold tracking-tight shrink-0">
              {schoolInitials}
            </div>
            <span className="text-xs font-medium text-[#777777] truncate">
              {course.ecole?.nom || "Établissement"}
            </span>
          </div>

          {/* Theme Tag */}
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-[#4568F5] bg-[#4568F5]/8 rounded-full shrink-0">
            <Sparkles className="w-2.5 h-2.5" />
            {course.thematique || "Général"}
          </span>
        </div>

        {/* Course Title */}
        <h3 className="text-lg font-bold text-[#171717] tracking-tight leading-snug group-hover:text-[#4568F5] transition-colors">
          {course.nom_cours}
        </h3>

        {/* Description si disponible */}
        {course.description && (
          <p className="text-xs text-[#777777] mt-2 line-clamp-2 leading-relaxed">
            {course.description}
          </p>
        )}

        {/* Module Counter Bar */}
        <div className="flex items-center justify-between pt-3 mt-3 border-t border-[#F7F8FA] text-xs">
          <div className="flex items-center gap-1.5 text-[#777777]">
            <Layers className="w-3.5 h-3.5 text-[#4568F5]" />
            <span className="font-semibold text-[#171717]">{moduleCount}</span>
            <span>{moduleCount > 1 ? "modules disponibles" : "module disponible"}</span>
          </div>
          {moduleCount > 3 && (
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs font-semibold text-[#4568F5] hover:text-[#3654D9] flex items-center gap-1 transition-colors"
            >
              {isExpanded ? (
                <>
                  <span>Réduire</span>
                  <ChevronUp className="w-3.5 h-3.5" />
                </>
              ) : (
                <>
                  <span>Voir tout ({moduleCount})</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Modules List Section */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col bg-[#FCFCFD]">
        {moduleCount === 0 ? (
          <div className="py-8 text-center text-xs text-[#888888] bg-white rounded-xl border border-dashed border-[#EAECEF] flex flex-col items-center justify-center gap-1.5">
            <BookOpen className="w-4 h-4 text-[#CCCCCC]" />
            <span>Aucun module configuré pour ce cours</span>
          </div>
        ) : (
          <div
            className={`space-y-2 transition-all ${
              !isExpanded && moduleCount > 3 ? "max-h-[220px] overflow-hidden relative" : ""
            }`}
          >
            {course.modules.map((module) => (
              <ModuleItem key={module.id} module={module} />
            ))}

            {!isExpanded && moduleCount > 3 && (
              <div
                onClick={() => setIsExpanded(true)}
                className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#FCFCFD] via-[#FCFCFD]/90 to-transparent flex items-end justify-center pb-2 cursor-pointer"
              >
                <span className="text-[11px] font-bold text-[#4568F5] bg-white px-3.5 py-1.5 rounded-full border border-[#EAECEF] shadow-sm hover:border-[#4568F5] transition-colors">
                  + {moduleCount - 3} autre(s) module(s)
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
