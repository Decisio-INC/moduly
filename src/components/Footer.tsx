import Link from "next/link";
import { BrandLogo } from "./BrandLogo";

interface FooterProps {
  isAdmin?: boolean;
}

export function Footer({ isAdmin = false }: FooterProps) {
  return (
    <footer className="w-full border-t border-[#EAECEF] bg-white py-10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <BrandLogo size="sm" withTagline={false} withLink={!isAdmin} />
            <div className="h-4 w-px bg-[#EAECEF]" />
            <span className="text-xs text-[#777777] font-medium">
              © 2026 MODULY. Tous droits réservés.
            </span>
          </div>

          <div className="flex items-center gap-6 text-xs text-[#888888]">
            {!isAdmin ? (
              <Link
                href="/admin"
                className="text-[#999999] hover:text-[#171717] transition-colors py-1.5 px-3 rounded-lg hover:bg-[#F7F8FA] text-[11px] font-medium tracking-wide border border-transparent hover:border-[#EAECEF]"
                title="Accès au back-office d'administration"
              >
                Administration
              </Link>
            ) : (
              <Link
                href="/"
                className="text-[#777777] hover:text-[#4568F5] transition-colors py-1.5 px-3 rounded-lg hover:bg-[#4568F5]/5 text-[11px] font-semibold tracking-wide"
              >
                ← Retour au catalogue public
              </Link>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
