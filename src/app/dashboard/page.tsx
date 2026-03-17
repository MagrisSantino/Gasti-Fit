"use client";

import { useState, useEffect, useMemo } from "react";
import { Clock, Play, CheckCircle2, ArrowRight, X } from "lucide-react";
import { AuraPageWrapper } from "@/components/aura-page-wrapper";
import type { TablesInsert } from "@/types/database";
import { createClient } from "@/utils/supabase/client";

const DIAS_LABEL = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

type WeekPill = {
  id: string;
  label: string;
  day: number;
  date: Date;
  isToday: boolean;
};

/** Genera un array con los últimos 2 días, hoy y los próximos 4 días. */
function getWeekPills(): WeekPill[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const pills: WeekPill[] = [];

  for (let offset = -2; offset <= 4; offset++) {
    const d = new Date(today);
    d.setDate(today.getDate() + offset);
    const isToday = d.toDateString() === today.toDateString();
    pills.push({
      id: d.toISOString().split("T")[0],
      label: DIAS_LABEL[d.getDay()],
      day: d.getDate(),
      date: d,
      isToday,
    });
  }
  return pills;
}

function isYouTubeUrl(url: string): boolean {
  return /youtube\.com|youtu\.be/i.test(url);
}

function getYouTubeEmbedUrl(url: string): string {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  const videoId = match?.[1] ?? "";
  return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
}

// Tipos para el plan anidado traído de Supabase
type ExerciseRef = {
  nombre: string;
  fotos: string[] | null;
  video_url: string | null;
} | null;

type PlanExerciseRow = {
  id: string;
  day_id: string;
  exercise_id: string;
  series: string;
  repeticiones: string;
  intensidad_omni: number;
  tiempo_descanso: string;
  orden: number;
  exercises: ExerciseRef;
};

type PlanDayRow = {
  id: string;
  plan_id: string;
  titulo: string;
  frecuencia: string;
  orden: number;
  created_at: string;
  plan_exercises: PlanExerciseRow[] | null;
};

type PlanWithNested = {
  id: string;
  user_id: string;
  titulo_plan: string;
  fecha_creacion?: string;
  plan_days: PlanDayRow[] | null;
};

function formatFechaHoy(): string {
  return new Date().toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function capitalizar(str: string): string {
  return str.replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Ordena días y ejercicios por campo orden (client-side). */
function sortPlan(plan: PlanWithNested): PlanWithNested {
  if (!plan.plan_days?.length) return plan;
  const sortedDays = [...plan.plan_days].sort((a, b) => a.orden - b.orden);
  const daysWithSortedExercises = sortedDays.map((d) => ({
    ...d,
    plan_exercises: d.plan_exercises
      ? [...d.plan_exercises].sort((a, b) => a.orden - b.orden)
      : null,
  }));
  return { ...plan, plan_days: daysWithSortedExercises };
}

export default function DashboardPage() {
  const [nombre, setNombre] = useState("");
  const [activePlan, setActivePlan] = useState<PlanWithNested | null>(null);
  const [selectedDayId, setSelectedDayId] = useState<string | null>(null);
  const [completedExercises, setCompletedExercises] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string | null>(null);

  const fechaHoy = formatFechaHoy();
  const weekPills = useMemo(() => getWeekPills(), []);

  const sortedPlan = useMemo(
    () => (activePlan ? sortPlan(activePlan) : null),
    [activePlan]
  );

  const planDays = sortedPlan?.plan_days ?? [];
  const selectedDay = planDays.find((d) => d.id === selectedDayId) ?? planDays[0];
  const exercisesOfDay = selectedDay?.plan_exercises ?? [];

  useEffect(() => {
    let mounted = true;

    async function cargar() {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || !mounted) {
        setLoading(false);
        return;
      }

      const { data: userData } = await supabase
        .from("users")
        .select("nombre")
        .eq("id", user.id)
        .single();
      if (userData && mounted) {
        setNombre((userData as { nombre: string }).nombre);
      }

      const { data: planData } = await supabase
        .from("plans")
        .select(
          `
          *,
          plan_days (
            *,
            plan_exercises (
              *,
              exercises ( nombre, fotos, video_url )
            )
          )
        `
        )
        .eq("user_id", user.id)
        .order("fecha_creacion", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!mounted) return;

      if (planData) {
        const plan = planData as unknown as PlanWithNested;
        setActivePlan(plan);
        const days = plan.plan_days ?? [];
        const sorted = [...days].sort((a, b) => a.orden - b.orden);
        if (sorted.length > 0) {
          setSelectedDayId(sorted[0].id);
        }
      }
      setLoading(false);
    }

    cargar();
    return () => {
      mounted = false;
    };
  }, []);

  const toggleExercise = (planExerciseId: string) => {
    setCompletedExercises((prev) =>
      prev.includes(planExerciseId)
        ? prev.filter((id) => id !== planExerciseId)
        : [...prev, planExerciseId]
    );
  };

  const openVideo = (url: string | null | undefined) => {
    if (url) {
      setCurrentVideoUrl(url);
      setIsVideoModalOpen(true);
    }
  };

  const closeVideoModal = () => {
    setIsVideoModalOpen(false);
    setCurrentVideoUrl(null);
  };

  const handleFinalizarEntrenamiento = async () => {
    if (!activePlan?.id) return;
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const payload: TablesInsert<"workout_logs"> = {
      user_id: user.id,
      plan_id: activePlan.id,
      fecha: new Date().toISOString().split("T")[0],
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase client table typings
    await (supabase.from("workout_logs") as any).insert(payload);
  };

  const hasPlan = Boolean(activePlan);
  const showEmptyPlan = !loading && !hasPlan;
  const showWorkout = hasPlan && selectedDay;

  return (
    <AuraPageWrapper className="pb-32">
      <div className="mx-auto max-w-lg min-w-0 p-4 pb-24 sm:p-5 md:pt-8 lg:max-w-2xl safe-area-inset-left safe-area-inset-right">
        {/* Header */}
        <header className="reveal mb-6 flex items-center justify-between sm:mb-8">
          <div className="min-w-0">
            <h1 className="text-2xl font-medium tracking-tight text-white">
              {nombre ? `Hola, ${nombre.split(" ")[0]}` : "Hola"}{" "}
              <span className="text-xl">👋</span>
            </h1>
            <p className="mt-1 text-lg font-light text-white/50">
              {capitalizar(fechaHoy)}
            </p>
          </div>
          <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/5">
            <span className="text-lg font-medium text-white/60">
              {nombre ? nombre[0].toUpperCase() : "?"}
            </span>
          </div>
        </header>

        {/* Calendario semanal dinámico (últimos 2 + hoy + próximos 4) */}
        <div className="reveal delay-100 mb-6 sm:mb-8">
          <div className="flex gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {weekPills.map((pill) => (
              <div
                key={pill.id}
                className={`flex min-w-16 shrink-0 flex-col items-center justify-center rounded-2xl px-2 py-3 sm:min-w-20 sm:px-3 ${
                  pill.isToday
                    ? "bg-white text-black shadow-[0_0_20px_-5px_rgba(255,255,255,0.4)]"
                    : "border border-white/5 text-white/50"
                }`}
              >
                <span className="mb-0.5 text-xs uppercase tracking-wider">
                  {pill.label}
                </span>
                <span className="text-lg font-semibold">{pill.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="reveal delay-100 mb-8 rounded-[2.5rem] border border-white/5 bg-white/2 p-8 text-center">
            <p className="text-white/40">Cargando tu rutina...</p>
          </div>
        )}

        {/* Sin plan asignado */}
        {showEmptyPlan && (
          <div className="reveal delay-200 mb-8 rounded-[2.5rem] border border-white/5 bg-white/2 p-8 text-center">
            <p className="text-lg text-white/60">
              Aún no tienes un plan asignado.
            </p>
            <p className="mt-2 text-sm text-white/40">
              Contacta a tu entrenador.
            </p>
          </div>
        )}

        {/* Selector de días del plan (Día 1, Día 2, …) */}
        {showWorkout && planDays.length > 0 && (
          <div className="reveal delay-100 mb-4 sm:mb-6">
            <p className="mb-2 px-1 text-xs font-medium uppercase tracking-wide text-white/50">
              Día del plan
            </p>
            <div className="flex gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {planDays.map((day) => {
                const isSelected = day.id === selectedDayId;
                return (
                  <button
                    key={day.id}
                    type="button"
                    onClick={() => setSelectedDayId(day.id)}
                    className={`relative flex shrink-0 flex-col items-center justify-center rounded-2xl px-3 py-2.5 text-left transition-all sm:px-4 sm:py-3 ${
                      isSelected
                        ? "bg-white text-black shadow-[0_4px_30px_-5px_rgba(255,255,255,0.15)]"
                        : "border border-white/5 bg-white/5 text-white/50 hover:border-white/10 hover:text-white/70"
                    }`}
                  >
                    <span
                      className={`block max-w-24 truncate text-xs uppercase tracking-wider ${
                        isSelected ? "font-medium" : "font-normal"
                      }`}
                    >
                      {day.titulo}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Cabecera de rutina (título del día seleccionado) */}
        {showWorkout && (
          <div className="reveal delay-200 spotlight-card mb-6 overflow-hidden rounded-[2.5rem] border border-white/10 p-4 sm:mb-8 sm:p-6">
            <div className="spotlight-content">
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-white/80">
                Rutina
              </p>
              <h2 className="mb-4 text-xl font-medium tracking-tight text-white">
                {selectedDay.titulo}
              </h2>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5 rounded-full border border-white/5 bg-white/10 px-3 py-1.5 text-xs font-medium text-white/80 backdrop-blur-sm">
                  <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={1.5} />
                  {activePlan?.titulo_plan ?? "Tu plan"}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Lista de ejercicios del día seleccionado */}
        {showWorkout && (
          <div className="reveal delay-300 space-y-4">
            <h3 className="mb-4 px-1 text-sm font-medium uppercase tracking-wide text-white/50">
              Ejercicios
            </h3>

            {exercisesOfDay.length === 0 ? (
              <div className="rounded-2xl border border-white/5 bg-white/2 p-6 text-center">
                <p className="text-white/40">
                  No hay ejercicios en este día.
                </p>
              </div>
            ) : (
              exercisesOfDay.map((pe) => {
                const exercise = pe.exercises;
                const nombreEj = exercise?.nombre ?? "Ejercicio";
                const fotoUrl = exercise?.fotos?.[0] ?? null;
                const videoUrl = exercise?.video_url ?? null;
                const isCompleted = completedExercises.includes(pe.id);
                const detalle = `${pe.series} Series x ${pe.repeticiones} Reps • Descanso: ${pe.tiempo_descanso || "—"} • RPE: ${pe.intensidad_omni}`;

                return (
                  <div
                    key={pe.id}
                    className="group flex items-center gap-3 rounded-2xl border border-white/5 bg-white/2 p-3 transition-colors duration-300 hover:bg-white/4 sm:gap-4"
                  >
                    <button
                      type="button"
                      onClick={() => openVideo(videoUrl)}
                      className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-neutral-900 transition-opacity hover:opacity-90 active:opacity-80 sm:h-20 sm:w-20"
                      aria-label="Ver video del ejercicio"
                    >
                      {fotoUrl ? (
                        <img
                          src={fotoUrl}
                          alt={nombreEj}
                          className="h-full w-full object-cover opacity-60 mix-blend-overlay"
                        />
                      ) : null}
                      <Play
                        className="absolute h-7 w-7 text-white/70 drop-shadow-md sm:h-8 sm:w-8"
                        strokeWidth={1.5}
                        fill="currentColor"
                      />
                    </button>

                    <div className="min-w-0 flex-1 flex flex-col pr-1 sm:pr-2">
                      <h4
                        className={`mb-0.5 text-sm font-medium text-white sm:mb-1 ${
                          isCompleted ? "line-through opacity-50" : ""
                        }`}
                      >
                        {nombreEj}
                      </h4>
                      <p
                        className={`text-xs font-normal ${
                          isCompleted
                            ? "text-white/40 opacity-50"
                            : "text-white/50"
                        }`}
                      >
                        {detalle}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExercise(pe.id);
                      }}
                      className="relative flex shrink-0 cursor-pointer items-center justify-center p-2 touch-manipulation"
                      aria-label={
                        isCompleted
                          ? "Marcar como no completado"
                          : "Marcar como completado"
                      }
                    >
                      <div
                        className={`flex h-7 w-7 items-center justify-center rounded-full border transition-all duration-200 ease-in-out sm:h-6 sm:w-6 ${
                          isCompleted
                            ? "border-white bg-white text-black"
                            : "border-white/30 text-transparent hover:border-white/50"
                        }`}
                      >
                        <CheckCircle2
                          className="h-3.5 w-3.5 sm:h-3.5 sm:w-3.5"
                          strokeWidth={2}
                        />
                      </div>
                    </button>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* FAB Finalizar */}
        {showWorkout && (
          <div className="pointer-events-none fixed bottom-0 left-0 right-0 z-50 flex w-full justify-center bg-gradient-to-t from-[#050505] via-[#050505]/95 to-transparent p-4 pb-6 sm:pb-8 md:pb-10 safe-area-inset-bottom">
            <button
              type="button"
              onClick={handleFinalizarEntrenamiento}
              disabled={!activePlan?.id}
              className="reveal group pointer-events-auto mx-auto flex w-full max-w-lg items-center justify-center gap-3 rounded-full bg-white px-4 py-4 text-base font-medium text-black shadow-[0_4px_30px_-5px_rgba(255,255,255,0.15)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_4px_40px_-5px_rgba(255,255,255,0.25)] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-30 sm:gap-4 sm:px-10 sm:py-5 sm:text-xl lg:max-w-2xl touch-manipulation"
            >
              FINALIZAR ENTRENAMIENTO
              <ArrowRight
                className="h-5 w-5 sm:h-6 sm:w-6 transition-transform duration-300 group-hover:translate-x-1"
                strokeWidth={1.5}
              />
            </button>
          </div>
        )}
      </div>

      {/* Modal de video */}
      {isVideoModalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-xl"
          onClick={closeVideoModal}
          role="dialog"
          aria-modal="true"
          aria-label="Reproductor de video"
        >
          <button
            type="button"
            onClick={closeVideoModal}
            className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition-colors hover:bg-white/20 sm:top-6 sm:right-6"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>

          <div
            className="relative w-full max-w-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            {currentVideoUrl ? (
              isYouTubeUrl(currentVideoUrl) ? (
                <div className="aspect-video w-full overflow-hidden rounded-2xl">
                  <iframe
                    src={getYouTubeEmbedUrl(currentVideoUrl)}
                    title="Video del ejercicio"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="h-full w-full rounded-2xl"
                  />
                </div>
              ) : (
                <video
                  src={currentVideoUrl}
                  controls
                  autoPlay
                  playsInline
                  className="w-full max-w-3xl rounded-2xl"
                />
              )
            ) : (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/5 py-16 text-center">
                <Play className="mb-3 h-12 w-12 text-white/30" />
                <p className="text-white/50">Video no disponible</p>
                <button
                  type="button"
                  onClick={closeVideoModal}
                  className="mt-4 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/20"
                >
                  Cerrar
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </AuraPageWrapper>
  );
}
