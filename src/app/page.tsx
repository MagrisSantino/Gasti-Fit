"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ShieldHalf,
  GraduationCap,
  BookOpen,
  Smartphone,
  Target,
  Activity,
  Instagram,
  Mail,
  MessageCircle,
} from "lucide-react";

const DOT_PATTERN =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=";

function handleCardMouseMove(
  e: React.MouseEvent<HTMLDivElement>,
  el: HTMLDivElement
) {
  const rect = el.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  el.style.setProperty("--mouse-x", `${x}px`);
  el.style.setProperty("--mouse-y", `${y}px`);
}

export default function Home() {
  const cursorDotRef = useRef<HTMLDivElement>(null);
  const cursorGlowRef = useRef<HTMLDivElement>(null);

  // Cursor personalizado: seguir el mouse en desktop
  useEffect(() => {
    const cursorDot = cursorDotRef.current;
    const cursorGlow = cursorGlowRef.current;
    if (!cursorDot || !cursorGlow) return;

    const onMouseMove = (e: MouseEvent) => {
      if (typeof window !== "undefined" && window.innerWidth >= 768) {
        const t = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
        cursorDot.style.transform = t;
        cursorGlow.style.transform = t;
      }
    };

    window.addEventListener("mousemove", onMouseMove);
    return () => window.removeEventListener("mousemove", onMouseMove);
  }, []);

  // Intersection Observer: reveal al hacer scroll
  useEffect(() => {
    const observerOptions: IntersectionObserverInit = {
      root: null,
      rootMargin: "0px",
      threshold: 0.15,
    };

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.remove("opacity-0", "translate-y-12");
          entry.target.classList.add("opacity-100", "translate-y-0");
          obs.unobserve(entry.target);
        }
      });
    }, observerOptions);

    const elements = document.querySelectorAll(".reveal-scroll");
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-[#050505] text-white antialiased selection:bg-white/20 selection:text-white md:cursor-none [font-family:var(--font-plus-jakarta),sans-serif]">
      {/* Patrón de puntos de fondo */}
      <div
        className="pointer-events-none fixed inset-0 z-0 bg-[length:20px_20px] [mask-image:linear-gradient(to_bottom,white_20%,transparent_80%)]"
        style={{ backgroundImage: `url('${DOT_PATTERN}')` }}
      />

      {/* Cursor personalizado */}
      <div
        ref={cursorDotRef}
        className="fixed left-0 top-0 z-[100] hidden h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white mix-blend-difference pointer-events-none transition-transform duration-75 ease-out md:block"
        aria-hidden
      />
      <div
        ref={cursorGlowRef}
        className="fixed left-0 top-0 z-0 hidden h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/5 blur-[80px] pointer-events-none transition-transform duration-500 ease-out md:block"
        aria-hidden
      />

      {/* Hero */}
      <main className="relative z-10 mx-auto grid w-full min-h-[90vh] max-w-7xl grid-cols-1 items-center gap-16 px-6 pt-32 pb-24 lg:grid-cols-12 md:pt-40 md:pb-32">
        <div className="reveal-scroll flex flex-col items-start space-y-10 text-left opacity-0 translate-y-12 transition-all duration-1000 ease-out lg:col-span-7">
          <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-[#00e5ff] animate-pulse" />
            <span className="text-lg font-normal text-white/80">
              Entrenamiento Presencial y Virtual
            </span>
          </div>

          <h1 className="text-5xl font-medium leading-[1.05] tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white via-white/90 to-white/30 md:text-7xl lg:text-8xl">
            Gastón Mauhum
            <br />
            <span className="text-4xl font-light italic text-white/40 md:text-6xl lg:text-7xl">
              Tu mejor versión
            </span>
          </h1>

          <p className="max-w-2xl text-xl font-light leading-relaxed text-white/50 md:text-2xl">
            Especialista en entrenamiento deportivo y funcional. Planes adaptados
            a tus objetivos reales, con seguimiento constante y resultados
            comprobables.
          </p>

          <div className="flex w-full flex-col gap-6 pt-4 sm:flex-row sm:w-auto">
            <Link
              href="/login"
              className="group relative inline-flex items-center justify-center gap-4 rounded-full bg-white px-10 py-5 text-xl font-medium text-black transition-transform duration-300 hover:scale-[1.02] active:scale-[0.98] overflow-hidden"
            >
              Ingresar a mi Plan
              <ArrowRight
                className="h-6 w-6 transition-transform duration-300 group-hover:translate-x-1"
                strokeWidth={1.5}
              />
            </Link>
          </div>
        </div>

        {/* Imagen Hero */}
        <div className="reveal-scroll group relative aspect-[4/5] w-full overflow-hidden rounded-[2.5rem] border border-white/10 opacity-0 translate-y-12 transition-all duration-1000 ease-out delay-200 lg:col-span-5">
          <div className="absolute inset-0 bg-zinc-900 animate-pulse" />
          <img
            src="/profe_gasti.jpg"
            alt="Gastón Mauhum Entrenando"
            className="absolute inset-0 h-full w-full scale-105 object-cover opacity-80 transition-transform duration-1000 ease-out group-hover:scale-100 group-hover:opacity-100"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent opacity-80" />

          <div className="absolute bottom-8 left-8 right-8">
            <div className="flex items-center justify-between rounded-3xl border border-white/10 bg-black/40 px-8 py-6 backdrop-blur-2xl transition-colors duration-500 group-hover:border-white/20">
              <div className="flex flex-col">
                <span className="text-4xl font-medium tracking-tight text-white">
                  CAB
                </span>
                <span className="mt-1 text-xl font-light text-white/60">
                  Prep. Físico Futsal
                </span>
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white">
                <ShieldHalf className="h-7 w-7" strokeWidth={1.5} />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Bento Grid: Mi enfoque de trabajo */}
      <section className="relative z-10 mx-auto w-full max-w-7xl space-y-10 px-6 py-32">
        <h2 className="reveal-scroll mb-16 text-4xl font-medium tracking-tight text-white opacity-0 translate-y-12 transition-all duration-1000 ease-out md:text-5xl">
          Mi enfoque de trabajo
        </h2>

        <div className="grid auto-rows-auto grid-cols-1 gap-6 md:grid-cols-3">
          {/* Tarjeta 1: Sobre Mí */}
          <div
            className="interactive-card group relative overflow-hidden rounded-[2.5rem] border border-white/5 bg-zinc-950/50 p-10 transition-colors hover:border-white/10 reveal-scroll opacity-0 translate-y-12 transition-all duration-1000 ease-out md:col-span-2 lg:p-14"
            onMouseMove={(e) =>
              handleCardMouseMove(e, e.currentTarget)
            }
          >
            <div
              className="pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              style={{
                background:
                  "radial-gradient(800px circle at var(--mouse-x) var(--mouse-y), rgba(255,255,255,0.04), transparent 40%)",
              }}
            />
            <div className="absolute right-0 top-0 p-10 opacity-10 transition-opacity duration-500 group-hover:opacity-20">
              <GraduationCap
                className="h-32 w-32 text-white"
                strokeWidth={1.5}
              />
            </div>
            <div className="relative z-10 flex h-full flex-col justify-between space-y-12">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-white/10 bg-white/5">
                <BookOpen className="h-10 w-10 text-white" strokeWidth={1.5} />
              </div>
              <div className="max-w-2xl space-y-6">
                <h3 className="text-3xl font-medium tracking-tight text-white md:text-4xl">
                  Experiencia y Formación
                </h3>
                <p className="text-xl font-light leading-relaxed text-white/50">
                  Profesor de Educación Física egresado del IPEF y Licenciado en
                  Ciencias del Entrenamiento (UNRAF). Amplia trayectoria en salas
                  de musculación (Quality Gym, FITNET) y preparación física de
                  alto rendimiento.
                </p>
              </div>
            </div>
          </div>

          {/* Tarjeta 2: Virtual */}
          <div
            className="interactive-card group relative overflow-hidden rounded-[2.5rem] border border-white/5 bg-zinc-950/50 p-10 transition-colors hover:border-white/10 reveal-scroll opacity-0 translate-y-12 transition-all duration-1000 ease-out delay-100 lg:p-12"
            onMouseMove={(e) =>
              handleCardMouseMove(e, e.currentTarget)
            }
          >
            <div
              className="pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              style={{
                background:
                  "radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(0,229,255,0.05), transparent 40%)",
              }}
            />
            <div className="relative z-10 flex h-full flex-col justify-between space-y-12">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[#00e5ff]/20 bg-[#00e5ff]/10">
                <Smartphone className="h-8 w-8 text-[#00e5ff]" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="mb-4 text-3xl font-medium tracking-tight text-white">
                  Virtual
                </h3>
                <p className="text-xl font-light leading-relaxed text-white/50">
                  Seguimiento 100% online, rutinas adaptadas a tu entorno y videos
                  explicativos detallados.
                </p>
              </div>
            </div>
          </div>

          {/* Tarjeta 3: Personalizado */}
          <div
            className="interactive-card group relative overflow-hidden rounded-[2.5rem] border border-white/5 bg-zinc-950/50 p-10 transition-colors hover:border-white/10 reveal-scroll opacity-0 translate-y-12 transition-all duration-1000 ease-out delay-200 lg:p-12"
            onMouseMove={(e) =>
              handleCardMouseMove(e, e.currentTarget)
            }
          >
            <div
              className="pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              style={{
                background:
                  "radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(255,255,255,0.04), transparent 40%)",
              }}
            />
            <div className="relative z-10 flex h-full flex-col justify-between space-y-12">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                <Target className="h-8 w-8 text-white" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="mb-4 text-3xl font-medium tracking-tight text-white">
                  Personalizado
                </h3>
                <p className="text-xl font-light leading-relaxed text-white/50">
                  Enfoque específico en tus metas: hipertrofia, rendimiento
                  deportivo o salud general.
                </p>
              </div>
            </div>
          </div>

          {/* Tarjeta 4: Seguimiento */}
          <div
            className="interactive-card group relative overflow-hidden rounded-[2.5rem] border border-white/5 bg-zinc-950/50 p-10 transition-colors hover:border-white/10 reveal-scroll opacity-0 translate-y-12 transition-all duration-1000 ease-out delay-300 md:col-span-2 lg:p-14"
            onMouseMove={(e) =>
              handleCardMouseMove(e, e.currentTarget)
            }
          >
            <div
              className="pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              style={{
                background:
                  "radial-gradient(800px circle at var(--mouse-x) var(--mouse-y), rgba(255,255,255,0.04), transparent 40%)",
              }}
            />
            <div className="relative z-10 flex h-full flex-col gap-12 md:flex-row md:items-center">
              <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-[2rem] border border-white/10 bg-white/5">
                <Activity className="h-12 w-12 text-white" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="mb-6 text-3xl font-medium tracking-tight text-white md:text-4xl">
                  Seguimiento Constante
                </h3>
                <p className="text-xl font-light leading-relaxed text-white/50">
                  Monitoreo exhaustivo de intensidades, feedback continuo y
                  ajustes semanales a tu plan de entrenamiento para garantizar
                  progreso real y evitar estancamientos.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer / CTA */}
      <footer
        id="contacto"
        className="relative z-10 mt-24 w-full border-t border-white/5 bg-[#050505]"
      >
        <div className="reveal-scroll mx-auto max-w-7xl px-6 py-32 text-center opacity-0 translate-y-12 transition-all duration-1000 ease-out">
          <h2 className="mb-12 text-5xl font-medium tracking-tight text-white md:text-7xl">
            ¿Listo para dar el primer paso?
          </h2>
          <a
            href="mailto:gastimauhum@gmail.com"
            className="inline-flex items-center gap-4 rounded-full bg-white px-12 py-6 text-xl font-medium text-black transition-transform duration-300 hover:scale-[1.02] active:scale-[0.98]"
          >
            Contactame ahora
            <ArrowRight className="h-6 w-6" strokeWidth={1.5} />
          </a>
        </div>

        <div className="border-t border-white/5">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 px-6 py-12 md:flex-row">
            <p className="text-lg font-light text-white/30">
              © 2026 Gasti Fit — Gastón Mauhum.
            </p>
            <div className="flex items-center gap-8">
              <a
                href="https://instagram.com/gaston.mauhum"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/30 transition-colors duration-300 hover:text-white"
                aria-label="Instagram"
              >
                <Instagram className="h-6 w-6" strokeWidth={1.5} />
              </a>
              <a
                href="mailto:gastimauhum@gmail.com"
                className="text-white/30 transition-colors duration-300 hover:text-white"
                aria-label="Email"
              >
                <Mail className="h-6 w-6" strokeWidth={1.5} />
              </a>
              <a
                href="https://wa.me/543513279915"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/30 transition-colors duration-300 hover:text-white"
                aria-label="WhatsApp"
              >
                <MessageCircle className="h-6 w-6" strokeWidth={1.5} />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
