import { Module } from "@/types";
import { formatModuleNumber } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";

interface ModuleItemProps {
  module: Module;
}

export function ModuleItem({ module }: ModuleItemProps) {
  return (
    <a
      href={module.url_cours}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative flex items-center justify-between p-3 rounded-xl bg-white hover:bg-[#F8FAFF] border border-[#EAECEF] hover:border-[#4568F5]/30 transition-all duration-200 shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:shadow-[0_4px_12px_rgba(69,104,245,0.08)]"
      title={`Accéder au cours : ${module.sous_titre}`}
    >
      <div className="flex items-center gap-3.5 min-w-0 pr-2">
        {/* Module Number Monogram */}
        <div className="w-8 h-8 rounded-lg bg-[#F7F8FA] group-hover:bg-[#4568F5] text-[#171717] group-hover:text-white flex items-center justify-center font-mono text-xs font-bold shrink-0 transition-colors duration-200 border border-[#EAECEF] group-hover:border-[#4568F5]">
          {formatModuleNumber(module.numero_module)}
        </div>

        {/* Subtitle */}
        <span className="text-sm font-semibold text-[#171717] group-hover:text-[#4568F5] transition-colors truncate">
          {module.sous_titre}
        </span>
      </div>

      {/* Action Indicator */}
      <div className="flex items-center gap-1.5 shrink-0 text-[#888888] group-hover:text-[#4568F5] transition-all">
        <span className="text-[11px] font-semibold tracking-wide hidden sm:inline-block opacity-0 group-hover:opacity-100 transition-opacity">
          Accéder
        </span>
        <div className="w-6 h-6 rounded-md bg-[#F7F8FA] group-hover:bg-[#4568F5]/10 flex items-center justify-center transition-colors">
          <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </div>
      </div>
    </a>
  );
}
