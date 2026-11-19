import Link from "next/link";

interface BrandLogoProps {
  size?: "sm" | "md" | "lg";
  withTagline?: boolean;
  withLink?: boolean;
}

export function BrandLogo({
  size = "md",
  withTagline = true,
  withLink = true,
}: BrandLogoProps) {
  const iconSizes = {
    sm: "w-7 h-7",
    md: "w-9 h-9",
    lg: "w-11 h-11",
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  };

  const content = (
    <div className="flex items-center gap-3 group select-none">
      {/* Bespoke Geometric Emblem */}
      <div
        className={`${iconSizes[size]} relative rounded-xl p-[2px] bg-gradient-to-tr from-[#3B52DF] via-[#4568F5] to-[#7B92FF] shadow-[0_4px_14px_rgba(69,104,245,0.25)] group-hover:shadow-[0_6px_20px_rgba(69,104,245,0.4)] transition-all duration-300 flex items-center justify-center shrink-0`}
      >
        <div className="w-full h-full bg-[#0D1117] rounded-[10px] flex items-center justify-center relative overflow-hidden">
          {/* Subtle glow inside emblem */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#4568F5]/30 to-transparent pointer-events-none" />

          {/* Precision SVG Monogram forming stylized tiered 'M' modules */}
          <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5 relative z-10 transition-transform duration-300 group-hover:scale-105"
          >
            <defs>
              <linearGradient id="moduly-grad-1" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                <stop stopColor="#6C8AFF" />
                <stop offset="1" stopColor="#3854E0" />
              </linearGradient>
              <linearGradient id="moduly-grad-2" x1="4" y1="4" x2="20" y2="20" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FFFFFF" />
                <stop offset="1" stopColor="#D2DCFF" />
              </linearGradient>
            </defs>

            {/* Left Pillar */}
            <rect x="3.5" y="4.5" width="4.5" height="15" rx="2.25" fill="url(#moduly-grad-1)" />

            {/* Center Dynamic Module Connection */}
            <path
              d="M8 8.5L12 13L16 8.5"
              stroke="url(#moduly-grad-2)"
              strokeWidth="3.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Right Pillar */}
            <rect x="16" y="4.5" width="4.5" height="15" rx="2.25" fill="url(#moduly-grad-1)" />

            {/* Central Focal Dot (The 'One Place' core) */}
            <circle cx="12" cy="18" r="1.75" fill="#4568F5" />
          </svg>
        </div>
      </div>

      {/* Typography */}
      <div className="flex flex-col leading-tight">
        <div className="flex items-center gap-2">
          <span
            className={`${textSizes[size]} font-extrabold tracking-[-0.03em] text-[#171717] font-sans`}
          >
            MODULY
          </span>
          <span className="hidden sm:inline-block px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#4568F5] bg-[#4568F5]/10 border border-[#4568F5]/20 rounded-full">
            Pro
          </span>
        </div>
        {withTagline && (
          <p className="text-[10px] font-semibold tracking-[0.14em] text-[#777777] uppercase hidden md:block mt-0.5">
            YOUR COURSES. ONE PLACE.
          </p>
        )}
      </div>
    </div>
  );

  if (!withLink) return content;

  return (
    <Link href="/" className="inline-flex focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4568F5]/50 rounded-xl">
      {content}
    </Link>
  );
}
