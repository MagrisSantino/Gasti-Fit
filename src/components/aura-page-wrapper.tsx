"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * Wrapper para páginas internas (login, dashboard, admin) y landing.
 * Fondos ambientales (ruido + orbes), reveal al scroll y spotlight en tarjetas.
 */
export function AuraPageWrapper({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const contentRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const container = contentRef.current;
    if (!container) return;

    const revealEls = container.querySelectorAll(".reveal");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("active");
          }
        });
      },
      { root: null, rootMargin: "0px", threshold: 0.1 }
    );
    revealEls.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [pathname]);

  useEffect(() => {
    const container = contentRef.current;
    if (!container) return;

    const spotlightCards = container.querySelectorAll(".spotlight-card");

    const handleMouseMove = (e: MouseEvent) => {
      const card = e.currentTarget as HTMLElement;
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty("--mouse-x", `${x}px`);
      card.style.setProperty("--mouse-y", `${y}px`);
    };

    spotlightCards.forEach((card) => {
      card.addEventListener("mousemove", handleMouseMove as EventListener);
    });

    return () => {
      spotlightCards.forEach((card) => {
        card.removeEventListener("mousemove", handleMouseMove as EventListener);
      });
    };
  }, [pathname]);

  return (
    <div
      className={`relative flex min-h-screen flex-col overflow-x-hidden bg-[#050505] text-white antialiased selection:bg-white/20 selection:text-white [font-family:var(--font-plus-jakarta),sans-serif] ${className}`}
    >
      <div className="noise-bg" />
      <div className="ambient-glow ambient-glow-1" />
      <div className="ambient-glow ambient-glow-2" />
      <div ref={contentRef} className="relative z-10 flex min-h-screen flex-col">
        {children}
      </div>
    </div>
  );
}
