"use client";

/**
 * Wrapper para páginas internas (login, dashboard, admin).
 * Misma estética que la landing: fondo #050505, patrón de puntos, tipografía Plus Jakarta Sans.
 */
const DOT_PATTERN =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=";

export function AuraPageWrapper({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`relative flex min-h-screen flex-col overflow-x-hidden bg-[#050505] text-white antialiased selection:bg-white/20 selection:text-white [font-family:var(--font-plus-jakarta),sans-serif] ${className}`}
    >
      {/* Patrón de puntos de fondo (igual que landing) */}
      <div
        className="pointer-events-none fixed inset-0 z-0 bg-[length:20px_20px] [mask-image:linear-gradient(to_bottom,white_20%,transparent_80%)]"
        style={{ backgroundImage: `url('${DOT_PATTERN}')` }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
