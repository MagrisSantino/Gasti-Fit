"use client";

import Link from "next/link";
import {
  ArrowRight,
  Smartphone,
  Target,
  Activity,
  Mail,
  Phone,
  Instagram,
} from "lucide-react";
import { ReactLenis } from "lenis/react";
import { AuraPageWrapper } from "@/components/aura-page-wrapper";

export default function Home() {
  return (
    <AuraPageWrapper>
      <ReactLenis
        root="asChild"
        className="min-h-screen w-full overflow-x-hidden"
        options={{
          lerp: 0.07,
          smoothWheel: true,
          wheelMultiplier: 1,
          touchMultiplier: 1.2,
        }}
      >
        {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#050505]/60 backdrop-blur-xl transition-all duration-300 safe-area-inset-top">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 h-14 sm:h-20 flex items-center justify-between">
          <span className="text-xl font-medium tracking-tighter text-white uppercase">
            GM
          </span>
          <a
            href="#contacto"
            className="text-sm font-normal text-neutral-400 hover:text-white transition-colors duration-300"
          >
            Contacto
          </a>
        </div>
      </nav>

      <main className="relative z-10 flex-grow pt-14 sm:pt-20">
        {/* HERO SECTION */}
        <section className="min-h-[85svh] sm:min-h-[90vh] flex flex-col justify-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-12 sm:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-16 lg:gap-12 items-center">
            {/* Hero Content */}
            <div className="flex flex-col items-start space-y-6 sm:space-y-10 z-10">
              <div className="reveal inline-flex items-center gap-3 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border border-white/10 bg-white/[0.02]">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                <span className="text-[10px] sm:text-xs font-medium text-neutral-300 tracking-wide uppercase">
                  Entrenamiento Presencial y Virtual
                </span>
              </div>

              <div className="space-y-4 sm:space-y-6">
                <h1 className="reveal delay-100 text-5xl sm:text-6xl md:text-8xl lg:text-[7rem] font-medium tracking-tighter text-white leading-[0.95]">
                  Gastón
                  <br />
                  Mauhum
                </h1>
                <p className="reveal delay-200 text-lg sm:text-xl md:text-2xl font-normal tracking-tight text-neutral-400 max-w-lg">
                  Profesor de Educación Física
                </p>
              </div>

              <div className="reveal delay-300 pt-2 sm:pt-4 w-full sm:w-auto">
                <Link
                  href="/login"
                  className="group inline-flex items-center justify-center gap-3 sm:gap-4 bg-white text-black w-full sm:w-auto px-8 sm:px-10 py-4 sm:py-5 rounded-full text-sm sm:text-base font-medium hover:bg-neutral-200 transition-all duration-300 active:scale-[0.98]"
                >
                  Ingresar a mi Plan
                  <ArrowRight
                    className="text-xl group-hover:translate-x-1 transition-transform duration-300"
                    strokeWidth={1.5}
                  />
                </Link>
              </div>
            </div>

            {/* Hero Image */}
            <div className="reveal delay-400 relative w-full aspect-[4/5] max-h-[60vh] sm:max-h-none rounded-2xl sm:rounded-3xl overflow-hidden border border-white/5 spotlight-card">
              <img
                src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=2070&auto=format&fit=crop"
                alt="Gastón Mauhum"
                className="absolute inset-0 w-full h-full object-cover img-premium"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent z-10 pointer-events-none" />
            </div>
          </div>
        </section>

        {/* MI ENFOQUE DE TRABAJO */}
        <section className="py-16 sm:py-24 lg:py-40 max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="reveal mb-10 sm:mb-20">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-white">
              Mi Enfoque de Trabajo
            </h2>
            <div className="h-px w-full bg-white/5 mt-10" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
            <div className="reveal delay-100 spotlight-card rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12 flex flex-col justify-between aspect-square md:aspect-auto min-h-0">
              <div className="spotlight-content h-full flex flex-col">
                <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-8">
                  <Smartphone
                    className="text-3xl text-white"
                    strokeWidth={1.5}
                  />
                </div>
                <div className="mt-auto space-y-4">
                  <h3 className="text-2xl font-medium tracking-tight text-white">
                    Virtual
                  </h3>
                  <p className="text-base font-normal text-neutral-400 leading-relaxed">
                    Seguimiento 100% online, rutinas adaptadas a tu entorno y
                    videos explicativos para asegurar la técnica correcta en cada
                    movimiento.
                  </p>
                </div>
              </div>
            </div>

            <div className="reveal delay-200 spotlight-card rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12 flex flex-col justify-between aspect-square md:aspect-auto min-h-0">
              <div className="spotlight-content h-full flex flex-col">
                <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-8">
                  <Target className="text-3xl text-white" strokeWidth={1.5} />
                </div>
                <div className="mt-auto space-y-4">
                  <h3 className="text-2xl font-medium tracking-tight text-white">
                    Personalizado
                  </h3>
                  <p className="text-base font-normal text-neutral-400 leading-relaxed">
                    Enfoque específico en tus metas: ya sea hipertrofia, rendimiento
                    deportivo o simplemente mejorar tu salud general y bienestar.
                  </p>
                </div>
              </div>
            </div>

            <div className="reveal delay-300 spotlight-card rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12 flex flex-col justify-between md:col-span-2 min-h-[280px] sm:min-h-[400px]">
              <div className="spotlight-content h-full flex flex-col md:flex-row md:items-end gap-6 sm:gap-10">
                <div className="flex-shrink-0 mb-auto md:mb-0">
                  <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                    <Activity
                      className="text-3xl text-white"
                      strokeWidth={1.5}
                    />
                  </div>
                </div>
                <div className="space-y-4 md:max-w-xl ml-auto">
                  <h3 className="text-3xl font-medium tracking-tight text-white">
                    Seguimiento Constante
                  </h3>
                  <p className="text-lg font-normal text-neutral-400 leading-relaxed">
                    Monitoreo exhaustivo de intensidades, feedback continuo y
                    ajustes semanales para garantizar que el progreso nunca se
                    detenga.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* EXPERIENCIA */}
        <section className="py-16 sm:py-24 lg:py-40 max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="reveal mb-10 sm:mb-20">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-white">
              Experiencia
            </h2>
            <div className="h-px w-full bg-white/5 mt-10" />
          </div>

          <div className="flex flex-col gap-6 sm:gap-10 lg:gap-16">
            <div className="reveal spotlight-card rounded-xl sm:rounded-[2rem] flex flex-col lg:flex-row overflow-hidden group">
              <div className="relative w-full lg:w-1/2 h-56 sm:h-72 lg:h-auto flex-shrink-0 border-b lg:border-b-0 lg:border-r border-white/5 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1577412647305-991150c7d163?q=80&w=2070&auto=format&fit=crop"
                  alt="Escuelas Pías"
                  className="absolute inset-0 w-full h-full object-cover img-premium"
                />
              </div>
              <div className="spotlight-content w-full lg:w-1/2 p-6 sm:p-8 lg:p-16 flex flex-col justify-center">
                <span className="text-xs sm:text-sm font-medium text-neutral-500 mb-2 sm:mb-4 tracking-wide uppercase">
                  Escuelas Pías
                </span>
                <h3 className="text-2xl sm:text-3xl md:text-4xl font-medium tracking-tight text-white mb-4 sm:mb-6">
                  Profesor de nivel secundario
                </h3>
                <p className="text-lg text-neutral-400 font-normal leading-relaxed">
                  Planificación e implementación de programas de educación física
                  orientados al desarrollo integral de los alumnos en el ámbito
                  escolar.
                </p>
              </div>
            </div>

            <div className="reveal spotlight-card rounded-xl sm:rounded-[2rem] flex flex-col lg:flex-row-reverse overflow-hidden group">
              <div className="relative w-full lg:w-1/2 h-56 sm:h-72 lg:h-auto flex-shrink-0 border-b lg:border-b-0 lg:border-l border-white/5 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1518605368461-1e1e38ce8ba9?q=80&w=2070&auto=format&fit=crop"
                  alt="Futsal CAB"
                  className="absolute inset-0 w-full h-full object-cover img-premium"
                />
              </div>
              <div className="spotlight-content w-full lg:w-1/2 p-6 sm:p-8 lg:p-16 flex flex-col justify-center">
                <span className="text-sm font-medium text-neutral-500 mb-4 tracking-wide uppercase">
                  Club Atlético Belgrano
                </span>
                <h3 className="text-3xl md:text-4xl font-medium tracking-tight text-white mb-6">
                  Preparador Físico de Reserva y Primera
                </h3>
                <p className="text-lg text-neutral-400 font-normal leading-relaxed">
                  Acondicionamiento físico de alto rendimiento y prevención de
                  lesiones para el plantel competitivo de Futsal.
                </p>
              </div>
            </div>

            <div className="reveal spotlight-card rounded-xl sm:rounded-[2rem] flex flex-col lg:flex-row overflow-hidden group">
              <div className="relative w-full lg:w-1/2 h-56 sm:h-72 lg:h-auto flex-shrink-0 border-b lg:border-b-0 lg:border-r border-white/5 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop"
                  alt="Quality Gym"
                  className="absolute inset-0 w-full h-full object-cover img-premium"
                />
              </div>
              <div className="spotlight-content w-full lg:w-1/2 p-6 sm:p-8 lg:p-16 flex flex-col justify-center">
                <span className="text-sm font-medium text-neutral-500 mb-4 tracking-wide uppercase">
                  Quality Gym &amp; Water
                </span>
                <h3 className="text-3xl md:text-4xl font-medium tracking-tight text-white mb-6">
                  Profesor de Sala de Acondicionamiento Físico General
                </h3>
                <p className="text-lg text-neutral-400 font-normal leading-relaxed">
                  Diseño de rutinas y acompañamiento personalizado asegurando la
                  correcta ejecución biomecánica en sala.
                </p>
              </div>
            </div>

            <div className="reveal spotlight-card rounded-xl sm:rounded-[2rem] flex flex-col lg:flex-row-reverse overflow-hidden group">
              <div className="relative w-full lg:w-1/2 h-56 sm:h-72 lg:h-auto flex-shrink-0 border-b lg:border-b-0 lg:border-l border-white/5 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=2070&auto=format&fit=crop"
                  alt="FITNET"
                  className="absolute inset-0 w-full h-full object-cover img-premium"
                />
              </div>
              <div className="spotlight-content w-full lg:w-1/2 p-6 sm:p-8 lg:p-16 flex flex-col justify-center">
                <span className="text-sm font-medium text-neutral-500 mb-4 tracking-wide uppercase">
                  FITNET
                </span>
                <h3 className="text-3xl md:text-4xl font-medium tracking-tight text-white mb-6">
                  Profesor de Clases grupales y Musculación
                </h3>
                <p className="text-lg text-neutral-400 font-normal leading-relaxed">
                  Dirección de dinámicas grupales de alta intensidad y
                  planificación de rutinas enfocadas en hipertrofia y
                  tonificación.
                </p>
              </div>
            </div>

            <div className="reveal spotlight-card rounded-xl sm:rounded-[2rem] flex flex-col lg:flex-row overflow-hidden group">
              <div className="relative w-full lg:w-1/2 h-56 sm:h-72 lg:h-auto flex-shrink-0 border-b lg:border-b-0 lg:border-r border-white/5 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=2070&auto=format&fit=crop"
                  alt="Gimnasio Movimiento Activo"
                  className="absolute inset-0 w-full h-full object-cover img-premium"
                />
              </div>
              <div className="spotlight-content w-full lg:w-1/2 p-6 sm:p-8 lg:p-16 flex flex-col justify-center">
                <span className="text-sm font-medium text-neutral-500 mb-4 tracking-wide uppercase">
                  Gimnasio Movimiento Activo
                </span>
                <h3 className="text-3xl md:text-4xl font-medium tracking-tight text-white mb-6">
                  Profesor de Sala de Musculación
                </h3>
                <p className="text-lg text-neutral-400 font-normal leading-relaxed">
                  Asesoramiento integral, corrección postural y optimización de
                  cargas para usuarios de todos los niveles.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* EDUCACIÓN */}
        <section className="py-16 sm:py-24 lg:py-40 max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="reveal mb-10 sm:mb-20">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-white">
              Educación
            </h2>
            <div className="h-px w-full bg-white/5 mt-10" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="reveal spotlight-card rounded-[2rem] flex flex-col overflow-hidden group md:col-span-2 lg:col-span-1">
              <div className="relative w-full h-72 border-b border-white/5 flex-shrink-0 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2070&auto=format&fit=crop"
                  alt="UNRAF"
                  className="absolute inset-0 w-full h-full object-cover img-premium"
                />
              </div>
              <div className="spotlight-content p-10 flex flex-col flex-grow">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-sm font-medium text-neutral-500 tracking-wide uppercase">
                    UNRAF
                  </span>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5">
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-pulse" />
                    <span className="text-xs font-medium text-neutral-300">
                      En progreso
                    </span>
                  </div>
                </div>
                <h3 className="text-2xl md:text-3xl font-medium tracking-tight text-white">
                  Licenciatura en Ciencias del Entrenamiento
                </h3>
              </div>
            </div>

            <div className="reveal delay-100 spotlight-card rounded-[2rem] flex flex-col overflow-hidden group">
              <div className="relative w-full h-72 border-b border-white/5 flex-shrink-0 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2070&auto=format&fit=crop"
                  alt="IPEF"
                  className="absolute inset-0 w-full h-full object-cover img-premium"
                />
              </div>
              <div className="spotlight-content p-10 flex flex-col flex-grow">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-sm font-medium text-neutral-500 tracking-wide uppercase">
                    IPEF (Univ. Provincial de Córdoba)
                  </span>
                </div>
                <h3 className="text-2xl md:text-3xl font-medium tracking-tight text-white">
                  Profesorado Universitario de Educación Física
                </h3>
              </div>
            </div>

            <div className="reveal delay-200 spotlight-card rounded-[2rem] flex flex-col md:flex-row overflow-hidden group md:col-span-2">
              <div className="relative w-full md:w-2/5 lg:w-1/3 h-72 md:h-auto border-b md:border-b-0 md:border-r border-white/5 flex-shrink-0 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=2073&auto=format&fit=crop"
                  alt="Escuelas Pías Bachiller"
                  className="absolute inset-0 w-full h-full object-cover img-premium"
                />
              </div>
              <div className="spotlight-content p-10 lg:p-12 flex flex-col justify-center flex-grow">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-sm font-medium text-neutral-500 tracking-wide uppercase">
                    Escuelas Pías
                  </span>
                </div>
                <h3 className="text-2xl md:text-3xl font-medium tracking-tight text-white">
                  Bachiller con orientación a Ciencias Sociales y Humanidades
                </h3>
              </div>
            </div>
          </div>
        </section>

        {/* CTA SECTION */}
        <section
          id="contacto"
          className="relative py-20 sm:py-28 lg:py-56 z-10"
        >
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <h2 className="reveal text-4xl sm:text-5xl md:text-6xl lg:text-[6rem] font-medium tracking-tighter text-white leading-none mb-8 sm:mb-12">
              ¿Listo para empezar?
            </h2>
            <div className="reveal delay-100">
              <a 
                href="https://wa.me/543513279915?text=Hola%20Gastón,%20quiero%20empezar%20a%20entrenar!" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex items-center justify-center bg-white text-black w-full sm:w-auto px-8 sm:px-12 py-4 sm:py-6 rounded-full text-base sm:text-lg font-medium hover:bg-neutral-200 transition-all duration-300 active:scale-[0.98]"
              >
                Contactame
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-white/10 py-8 sm:py-10 bg-[#050505] safe-area-inset-bottom">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6 reveal delay-200">
          <div className="text-sm font-normal text-neutral-500 tracking-wide text-center md:text-left">
            © 2026 Gasti Fit — Gastón Mauhum.
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8">
            <a
              href="mailto:gastimauhum@gmail.com"
              className="text-neutral-500 hover:text-white transition-colors duration-300 flex items-center gap-2 text-sm font-normal"
            >
              <Mail className="text-xl" strokeWidth={1.5} />
              <span className="hidden sm:inline">gastimauhum@gmail.com</span>
            </a>
            <a
              href="https://wa.me/543513279915"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-500 hover:text-white transition-colors duration-300 flex items-center gap-2 text-sm font-normal"
            >
              <Phone className="text-xl" strokeWidth={1.5} />
              <span className="hidden sm:inline">+54 351 3279915</span>
            </a>
            <a
              href="https://instagram.com/gaston.mauhum"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-500 hover:text-white transition-colors duration-300 flex items-center gap-2 text-sm font-normal"
            >
              <Instagram className="text-xl" strokeWidth={1.5} />
              <span className="hidden sm:inline">@gaston.mauhum</span>
            </a>
          </div>
        </div>
      </footer>
      </ReactLenis>
    </AuraPageWrapper>
  );
}
