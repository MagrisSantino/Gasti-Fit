"use client";

import { useState } from "react";
import {
  Clock,
  Flame,
  Play,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { AuraPageWrapper } from "@/components/aura-page-wrapper";

// --- Mock: Días de la semana (listo para reemplazar con datos de Supabase)
const DIAS_SEMANA = [
  { id: "1", label: "Lun", dia: 12, isToday: false, isDone: true, hasScheduled: false },
  { id: "2", label: "Mar", dia: 13, isToday: false, isDone: false, hasScheduled: false },
  { id: "3", label: "Mié", dia: 14, isToday: true, isDone: false, hasScheduled: false },
  { id: "4", label: "Jue", dia: 15, isToday: false, isDone: false, hasScheduled: true },
  { id: "5", label: "Vie", dia: 16, isToday: false, isDone: false, hasScheduled: false },
  { id: "6", label: "Sáb", dia: 17, isToday: false, isDone: false, hasScheduled: false },
] as const;

// --- Mock: Ejercicios (listo para reemplazar con datos de Supabase)
const EJERCICIOS_MOCK = [
  {
    id: "e1",
    nombre: "Press de Banca con Mancuernas",
    seriesReps: "4 Series x 10-12 Reps",
    descanso: "90s Descanso",
    imagenUrl: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=200&q=80",
    completado: true,
  },
  {
    id: "e2",
    nombre: "Remo con Barra Inclinado",
    seriesReps: "4 Series x 10-12 Reps",
    descanso: "90s Descanso",
    imagenUrl: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=200&q=80",
    completado: false,
  },
  {
    id: "e3",
    nombre: "Elevaciones Laterales",
    seriesReps: "3 Series x 15 Reps",
    descanso: "60s Descanso",
    imagenUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=200&q=80",
    completado: false,
  },
  {
    id: "e4",
    nombre: "Curl de Bíceps Alterno",
    seriesReps: "3 Series x 12 Reps",
    descanso: "60s Descanso",
    imagenUrl: "https://images.unsplash.com/photo-1581009137042-c552e485697a?auto=format&fit=crop&w=200&q=80",
    completado: false,
  },
];

// Rutina de hoy (mock)
const RUTINA_HOY = {
  titulo: "Día 1: Tren Superior",
  duracion: "45 min",
  intensidad: "Intensidad Alta",
};

function formatFechaHoy(): string {
  const hoy = new Date();
  return hoy.toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function capitalizar(str: string): string {
  return str.replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function DashboardPage() {
  const [ejercicios, setEjercicios] = useState(EJERCICIOS_MOCK);
  const fechaHoy = formatFechaHoy();

  const toggleEjercicio = (id: string) => {
    setEjercicios((prev) =>
      prev.map((e) => (e.id === id ? { ...e, completado: !e.completado } : e))
    );
  };

  const handleFinalizarEntrenamiento = () => {
    // Listo para conectar con Supabase o lógica real
    console.log("FINALIZAR ENTRENAMIENTO");
  };

  return (
    <AuraPageWrapper className="pb-32">
      <div className="mx-auto max-w-lg p-5 md:pt-8 lg:max-w-2xl">
        {/* Header */}
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-medium tracking-tight text-white">
              Hola, Ezequiel <span className="text-xl">👋</span>
            </h1>
            <p className="mt-1 text-lg font-light text-white/50">
              {capitalizar(fechaHoy)}
            </p>
          </div>
          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full border border-white/10">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
              alt="Profile Avatar"
              className="h-full w-full object-cover"
            />
          </div>
        </header>

        {/* Weekly Progress Pills */}
        <div className="mb-8">
          <div
            className="flex gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {DIAS_SEMANA.map((dia) => (
              <div
                key={dia.id}
                className={`flex h-20 w-[4.5rem] shrink-0 flex-col items-center justify-center rounded-2xl ${
                  dia.isToday
                    ? "bg-[#00e5ff] text-black shadow-[0_0_20px_-5px_rgba(0,229,255,0.4)]"
                    : "border border-white/5 bg-white/5 text-white/50"
                } relative`}
              >
                <span
                  className={`mb-1 text-xs uppercase tracking-wider ${
                    dia.isToday ? "font-medium" : "font-normal"
                  }`}
                >
                  {dia.label}
                </span>
                <span
                  className={dia.isToday ? "text-lg font-semibold" : "text-lg font-medium"}
                >
                  {dia.dia}
                </span>
                {(dia.isDone || dia.hasScheduled) && !dia.isToday && (
                  <div className="absolute bottom-2 h-1 w-1 rounded-full bg-[#00e5ff] opacity-60" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Workout Summary Card */}
        <div className="relative mb-8 overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/[0.03] p-6 shadow-2xl shadow-black backdrop-blur-xl">
          <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[#00e5ff]/10 blur-3xl" />
          <div className="relative z-10">
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-[#00e5ff]">
              Rutina de Hoy
            </p>
            <h2 className="mb-4 text-xl font-medium tracking-tight text-white">
              {RUTINA_HOY.titulo}
            </h2>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 rounded-full border border-white/5 bg-white/10 px-3 py-1.5 text-xs font-medium text-white/80 backdrop-blur-sm">
                <Clock className="text-sm" strokeWidth={1.5} />
                {RUTINA_HOY.duracion}
              </div>
              <div className="flex items-center gap-1.5 rounded-full border border-white/5 bg-white/10 px-3 py-1.5 text-xs font-medium text-white/80 backdrop-blur-sm">
                <Flame className="text-sm" strokeWidth={1.5} />
                {RUTINA_HOY.intensidad}
              </div>
            </div>
          </div>
        </div>

        {/* Exercise List */}
        <div className="space-y-4">
          <h3 className="mb-4 px-1 text-sm font-medium uppercase tracking-wide text-white/50">
            Ejercicios
          </h3>

          {ejercicios.map((ej) => (
            <div
              key={ej.id}
              className="group flex items-center rounded-2xl border border-white/5 bg-white/[0.02] p-3 transition-colors duration-300 hover:bg-white/[0.04]"
            >
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-neutral-900">
                <img
                  src={ej.imagenUrl}
                  alt={ej.nombre}
                  className="h-full w-full object-cover opacity-60 mix-blend-overlay"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Play
                    className="h-8 w-8 text-white drop-shadow-md transition-transform group-hover:scale-110"
                    strokeWidth={1.5}
                    fill="currentColor"
                  />
                </div>
              </div>

              <div className="ml-4 flex-grow pr-2">
                <h4
                  className={`text-sm font-medium text-white mb-1 ${
                    ej.completado ? "line-through opacity-50" : ""
                  }`}
                >
                  {ej.nombre}
                </h4>
                <p
                  className={`text-xs font-normal ${
                    ej.completado ? "text-white/40 opacity-50" : "text-white/50"
                  }`}
                >
                  {ej.seriesReps} <span className="mx-1 opacity-50">•</span>{" "}
                  {ej.descanso}
                </p>
              </div>

              <button
                type="button"
                onClick={() => toggleEjercicio(ej.id)}
                className="relative flex shrink-0 cursor-pointer items-center justify-center p-2"
                aria-label={ej.completado ? "Marcar como no completado" : "Marcar como completado"}
              >
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-full border transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                    ej.completado
                      ? "border-[#00e5ff] bg-[#00e5ff] text-black"
                      : "border-white/30 text-transparent hover:border-[#00e5ff]/50"
                  }`}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2} />
                </div>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Action Button (FAB): mismo estilo que botón principal landing */}
      <div className="fixed bottom-0 left-0 z-50 flex w-full justify-center bg-gradient-to-t from-[#050505] via-[#050505]/95 to-transparent p-4 pb-8 pointer-events-none md:pb-10">
        <button
          type="button"
          onClick={handleFinalizarEntrenamiento}
          className="group pointer-events-auto mx-auto flex w-full max-w-lg items-center justify-center gap-4 rounded-full bg-[#00e5ff] px-10 py-5 text-xl font-medium text-black shadow-[0_4px_30px_-5px_rgba(0,229,255,0.4)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_4px_40px_-5px_rgba(0,229,255,0.5)] active:scale-[0.98] lg:max-w-2xl"
        >
          FINALIZAR ENTRENAMIENTO
          <ArrowRight
            className="h-6 w-6 transition-transform duration-300 group-hover:translate-x-1"
            strokeWidth={1.5}
          />
        </button>
      </div>
    </AuraPageWrapper>
  );
}
