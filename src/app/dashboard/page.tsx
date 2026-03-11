"use client";

import { useState, useEffect } from "react";
import { Clock, Play, CheckCircle2, ArrowRight } from "lucide-react";
import { AuraPageWrapper } from "@/components/aura-page-wrapper";
import type { TablesInsert } from "@/types/database";
import { createClient } from "@/utils/supabase/client";

const DIAS_ES = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"] as const;
const DIAS_LABEL = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

type DiaPill = {
  id: string;
  label: string;
  dia: number;
  isToday: boolean;
  isDone: boolean;
};

type EjercicioRow = {
  id: string;
  nombre: string;
  seriesReps: string;
  descanso: string;
  video_url: string | null;
  completado: boolean;
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

export default function DashboardPage() {
  const [nombre, setNombre] = useState("");
  const [planId, setPlanId] = useState<string | null>(null);
  const [planTitulo, setPlanTitulo] = useState("");
  const [ejercicios, setEjercicios] = useState<EjercicioRow[]>([]);
  const [diasPills, setDiasPills] = useState<DiaPill[]>([]);
  const [loading, setLoading] = useState(true);
  const fechaHoy = formatFechaHoy();

  useEffect(() => {
    let mounted = true;

    async function cargar() {
      const supabase = createClient();

      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !mounted) return;

      // Nombre del usuario
      const { data: userData } = await supabase
        .from("users")
        .select("nombre")
        .eq("id", user.id)
        .single();
      if (userData && mounted) setNombre((userData as { nombre: string }).nombre);

      // Último plan asignado
      const { data: plan } = await supabase
        .from("plans")
        .select("id, titulo_plan")
        .eq("user_id", user.id)
        .order("fecha_creacion", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (plan && mounted) {
        const p = plan as { id: string; titulo_plan: string };
        setPlanId(p.id);
        setPlanTitulo(p.titulo_plan);

        // Ejercicios del plan para hoy
        const diaHoy = DIAS_ES[new Date().getDay()];
        const { data: peRows } = await supabase
          .from("plan_exercises")
          .select("id, series, repeticiones, exercises(nombre, video_url, tiempo_descanso)")
          .eq("plan_id", p.id)
          .eq("dia_semana", diaHoy);

        if (peRows && mounted) {
          type PeRow = { id: string; series: string; repeticiones: string; exercises: { nombre: string; video_url: string | null; tiempo_descanso: string | null } | null };
          setEjercicios(
            (peRows as PeRow[]).map((pe) => {
              const ex = pe.exercises;
              return {
                id: pe.id,
                nombre: ex?.nombre ?? "Ejercicio",
                seriesReps: `${pe.series} x ${pe.repeticiones}`,
                descanso: ex?.tiempo_descanso ? `${ex.tiempo_descanso} Descanso` : "",
                video_url: ex?.video_url ?? null,
                completado: false,
              };
            })
          );
        }
      }

      // Pills de la semana (Lun–Sáb)
      const hoy = new Date();
      const lunes = new Date(hoy);
      lunes.setDate(hoy.getDate() - ((hoy.getDay() + 6) % 7));

      const { data: logs } = await supabase
        .from("workout_logs")
        .select("fecha")
        .eq("user_id", user.id)
        .gte("fecha", lunes.toISOString().split("T")[0]);

      const logFechas = new Set(((logs ?? []) as { fecha: string }[]).map((l) => l.fecha));

      const pills: DiaPill[] = [];
      for (let i = 0; i < 6; i++) {
        const d = new Date(lunes);
        d.setDate(lunes.getDate() + i);
        pills.push({
          id: String(i),
          label: DIAS_LABEL[d.getDay()],
          dia: d.getDate(),
          isToday: d.toDateString() === hoy.toDateString(),
          isDone: logFechas.has(d.toISOString().split("T")[0]),
        });
      }
      if (mounted) {
        setDiasPills(pills);
        setLoading(false);
      }
    }

    cargar();
    return () => { mounted = false; };
  }, []);

  const toggleEjercicio = (id: string) => {
    setEjercicios((prev) =>
      prev.map((e) => (e.id === id ? { ...e, completado: !e.completado } : e))
    );
  };

  const handleFinalizarEntrenamiento = async () => {
    if (!planId) return;
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const payload: TablesInsert<"workout_logs"> = {
      user_id: user.id,
      plan_id: planId,
      fecha: new Date().toISOString().split("T")[0],
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase client table typings infer never in this build
    await (supabase.from("workout_logs") as any).insert(payload);

    setDiasPills((prev) =>
      prev.map((d) => (d.isToday ? { ...d, isDone: true } : d))
    );
  };

  return (
    <AuraPageWrapper className="pb-32">
      <div className="mx-auto max-w-lg p-5 md:pt-8 lg:max-w-2xl">
        {/* Header */}
        <header className="reveal mb-8 flex items-center justify-between">
          <div>
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

        {/* Weekly Progress Pills */}
        {diasPills.length > 0 && (
          <div className="reveal delay-100 mb-8">
            <div className="flex gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {diasPills.map((dia) => (
                <div
                  key={dia.id}
                  className={`relative flex h-20 w-18 shrink-0 flex-col items-center justify-center rounded-2xl ${
                    dia.isToday
                      ? "bg-white text-black shadow-[0_4px_30px_-5px_rgba(255,255,255,0.15)]"
                      : "border border-white/5 bg-white/5 text-white/50"
                  }`}
                >
                  <span
                    className={`mb-1 text-xs uppercase tracking-wider ${
                      dia.isToday ? "font-medium" : "font-normal"
                    }`}
                  >
                    {dia.label}
                  </span>
                  <span
                    className={
                      dia.isToday ? "text-lg font-semibold" : "text-lg font-medium"
                    }
                  >
                    {dia.dia}
                  </span>
                  {dia.isDone && !dia.isToday && (
                    <div className="absolute bottom-2 h-1 w-1 rounded-full bg-white/60" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Workout Summary Card */}
        {planTitulo && (
          <div className="reveal delay-200 spotlight-card mb-8 overflow-hidden rounded-[2.5rem] border border-white/10 p-6">
            <div className="spotlight-content">
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-white/80">
                Rutina de Hoy
              </p>
              <h2 className="mb-4 text-xl font-medium tracking-tight text-white">
                {planTitulo}
              </h2>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 rounded-full border border-white/5 bg-white/10 px-3 py-1.5 text-xs font-medium text-white/80 backdrop-blur-sm">
                  <Clock className="text-sm" strokeWidth={1.5} />
                  Tu plan personalizado
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sin plan asignado */}
        {!loading && !planTitulo && (
          <div className="reveal delay-200 mb-8 rounded-[2.5rem] border border-white/5 bg-white/2 p-8 text-center">
            <p className="text-white/40">Todavía no tenés un plan asignado.</p>
          </div>
        )}

        {/* Exercise List */}
        {ejercicios.length > 0 && (
          <div className="reveal delay-300 space-y-4">
            <h3 className="mb-4 px-1 text-sm font-medium uppercase tracking-wide text-white/50">
              Ejercicios
            </h3>

            {ejercicios.map((ej) => (
              <div
                key={ej.id}
                className="group flex items-center rounded-2xl border border-white/5 bg-white/2 p-3 transition-colors duration-300 hover:bg-white/4"
              >
                <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-neutral-900">
                  {ej.video_url ? (
                    <img
                      src={ej.video_url}
                      alt={ej.nombre}
                      className="h-full w-full object-cover opacity-60 mix-blend-overlay"
                    />
                  ) : (
                    <Play
                      className="h-8 w-8 text-white/30"
                      strokeWidth={1.5}
                      fill="currentColor"
                    />
                  )}
                </div>

                <div className="ml-4 flex-grow pr-2">
                  <h4
                    className={`mb-1 text-sm font-medium text-white ${
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
                    {ej.seriesReps}
                    {ej.descanso && (
                      <>
                        <span className="mx-1 opacity-50">•</span>
                        {ej.descanso}
                      </>
                    )}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => toggleEjercicio(ej.id)}
                  className="relative flex shrink-0 cursor-pointer items-center justify-center p-2"
                  aria-label={
                    ej.completado
                      ? "Marcar como no completado"
                      : "Marcar como completado"
                  }
                >
                  <div
                    className={`flex h-6 w-6 items-center justify-center rounded-full border transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                      ej.completado
                        ? "border-white bg-white text-black"
                        : "border-white/30 text-transparent hover:border-white/50"
                    }`}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2} />
                  </div>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Sin ejercicios hoy */}
        {!loading && planTitulo && ejercicios.length === 0 && (
          <div className="reveal delay-300 rounded-2xl border border-white/5 bg-white/2 p-6 text-center">
            <p className="text-white/40">No hay ejercicios programados para hoy.</p>
          </div>
        )}
      </div>

      {/* FAB */}
      <div className="pointer-events-none fixed bottom-0 left-0 z-50 flex w-full justify-center bg-gradient-to-t from-[#050505] via-[#050505]/95 to-transparent p-4 pb-8 md:pb-10">
        <button
          type="button"
          onClick={handleFinalizarEntrenamiento}
          disabled={!planId}
          className="reveal group pointer-events-auto mx-auto flex w-full max-w-lg items-center justify-center gap-4 rounded-full bg-white px-10 py-5 text-xl font-medium text-black shadow-[0_4px_30px_-5px_rgba(255,255,255,0.15)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_4px_40px_-5px_rgba(255,255,255,0.25)] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-30 lg:max-w-2xl"
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
