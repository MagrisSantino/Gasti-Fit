"use client";

import React, { useState, useCallback, useEffect } from "react";
import {
  Plus,
  Trash2,
  Calendar,
  Dumbbell,
  Save,
  ChevronDown,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import type { User } from "@/types/database";
import type { Exercise } from "@/types/database";

// ─── Tipos del formulario (estado local) ────────────────────────────────────

type EjercicioEnPlan = {
  id: string;
  exerciseId: string;
  series: string;
  repeticiones: string;
  intensidad_omni: number;
  tiempo_descanso: string;
};

type DiaEnPlan = {
  id: string;
  titulo: string;
  frecuencia: string;
  exercises: EjercicioEnPlan[];
};

function generarId(): string {
  return `temp-${Math.random().toString(36).slice(2, 11)}`;
}

// ─── Componente ──────────────────────────────────────────────────────────────

export function PlanesTab() {
  const [alumnos, setAlumnos] = useState<User[]>([]);
  const [ejercicios, setEjercicios] = useState<Exercise[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [errorData, setErrorData] = useState<string | null>(null);

  const [userId, setUserId] = useState<string>("");
  const [tituloPlan, setTituloPlan] = useState("");
  const [days, setDays] = useState<DiaEnPlan[]>([]);

  const [guardando, setGuardando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [mensajeError, setMensajeError] = useState<string | null>(null);

  const inputBase =
    "w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-white/30 transition-colors";
  const selectBase =
    "w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-white/30 transition-colors appearance-none cursor-pointer";

  // ─── Data fetching al montar ─────────────────────────────────────────────

  useEffect(() => {
    let mounted = true;

    async function cargar() {
      const supabase = createClient();
      const [resUsers, resExercises] = await Promise.all([
        supabase
          .from("users")
          .select("id, nombre, email, rol")
          .eq("rol", "client")
          .order("nombre"),
        supabase.from("exercises").select("id, nombre").order("nombre"),
      ]);

      if (!mounted) return;

      if (resUsers.error) {
        setErrorData(resUsers.error.message);
        setLoadingData(false);
        return;
      }
      if (resExercises.error) {
        setErrorData(resExercises.error.message);
        setLoadingData(false);
        return;
      }

      setAlumnos(resUsers.data ?? []);
      setEjercicios(resExercises.data ?? []);
      if (resUsers.data?.length) setUserId(resUsers.data[0].id);
      setLoadingData(false);
    }

    cargar();
    return () => {
      mounted = false;
    };
  }, []);

  // ─── Días (inmutables) ───────────────────────────────────────────────────

  const agregarDia = useCallback(() => {
    const nuevo: DiaEnPlan = {
      id: generarId(),
      titulo: `Día ${days.length + 1}`,
      frecuencia: "",
      exercises: [],
    };
    setDays((prev) => [...prev, nuevo]);
  }, [days.length]);

  const eliminarDia = useCallback((id: string) => {
    setDays((prev) => prev.filter((d) => d.id !== id));
  }, []);

  const actualizarDia = useCallback(
    (id: string, campo: "titulo" | "frecuencia", valor: string) => {
      setDays((prev) =>
        prev.map((d) => (d.id === id ? { ...d, [campo]: valor } : d))
      );
    },
    []
  );

  // ─── Ejercicios dentro de un día (inmutables) ─────────────────────────────

  const agregarEjercicio = useCallback((diaId: string) => {
    const nuevo: EjercicioEnPlan = {
      id: generarId(),
      exerciseId: "",
      series: "",
      repeticiones: "",
      intensidad_omni: 5,
      tiempo_descanso: "",
    };
    setDays((prev) =>
      prev.map((d) =>
        d.id === diaId ? { ...d, exercises: [...d.exercises, nuevo] } : d
      )
    );
  }, []);

  const eliminarEjercicio = useCallback((diaId: string, ejercicioId: string) => {
    setDays((prev) =>
      prev.map((d) =>
        d.id === diaId
          ? { ...d, exercises: d.exercises.filter((e) => e.id !== ejercicioId) }
          : d
      )
    );
  }, []);

  const actualizarEjercicio = useCallback(
    (
      diaId: string,
      ejercicioId: string,
      campo: keyof EjercicioEnPlan,
      valor: string | number
    ) => {
      setDays((prev) =>
        prev.map((d) => {
          if (d.id !== diaId) return d;
          return {
            ...d,
            exercises: d.exercises.map((e) =>
              e.id === ejercicioId ? { ...e, [campo]: valor } : e
            ),
          };
        })
      );
    },
    []
  );

  // ─── Guardar en Supabase (cascada) ───────────────────────────────────────

  const guardarPlan = useCallback(async () => {
    setMensajeExito(null);
    setMensajeError(null);
    setGuardando(true);

    const supabase = createClient();

    try {
      // 1. Insertar plan
      const { data: planData, error: errPlan } = await supabase
        .from("plans")
        .insert({ user_id: userId, titulo_plan: tituloPlan.trim() })
        .select("id")
        .single();

      if (errPlan || !planData?.id) {
        setMensajeError(errPlan?.message ?? "No se pudo crear el plan.");
        setGuardando(false);
        return;
      }

      const planId = planData.id;

      // 2. Insertar cada día y luego sus ejercicios
      for (let i = 0; i < days.length; i++) {
        const dia = days[i];
        const { data: dayData, error: errDay } = await supabase
          .from("plan_days")
          .insert({
            plan_id: planId,
            titulo: dia.titulo.trim(),
            frecuencia: dia.frecuencia.trim(),
            orden: i,
          })
          .select("id")
          .single();

        if (errDay || !dayData?.id) {
          setMensajeError(
            errDay?.message ?? `Error al crear el día "${dia.titulo}".`
          );
          setGuardando(false);
          return;
        }

        const dayId = dayData.id;

        // 3. Insertar ejercicios del día
        for (let j = 0; j < dia.exercises.length; j++) {
          const ej = dia.exercises[j];
          if (!ej.exerciseId.trim()) continue;

          const { error: errEx } = await supabase.from("plan_exercises").insert({
            day_id: dayId,
            exercise_id: ej.exerciseId,
            series: ej.series.trim(),
            repeticiones: ej.repeticiones.trim(),
            intensidad_omni: ej.intensidad_omni,
            tiempo_descanso: ej.tiempo_descanso.trim(),
            orden: j,
          });

          if (errEx) {
            setMensajeError(
              errEx.message ?? `Error al guardar un ejercicio del día "${dia.titulo}".`
            );
            setGuardando(false);
            return;
          }
        }
      }

      setMensajeExito("Plan guardado correctamente.");
      setTituloPlan("");
      setDays([]);
      if (alumnos.length) setUserId(alumnos[0].id);
    } catch (e) {
      setMensajeError(
        e instanceof Error ? e.message : "Error inesperado al guardar."
      );
    } finally {
      setGuardando(false);
    }
  }, [userId, tituloPlan, days, alumnos]);

  // ─── Render: loading / error inicial ─────────────────────────────────────

  if (loadingData) {
    return (
      <div className="reveal rounded-[2.5rem] border border-white/5 bg-white/2 p-10 text-center">
        <p className="text-white/50">Cargando alumnos y ejercicios...</p>
      </div>
    );
  }

  if (errorData) {
    return (
      <div className="reveal spotlight-card overflow-hidden rounded-[2.5rem] border border-white/10 p-6">
        <div className="spotlight-content flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-red-200">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p>{errorData}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Mensajes de éxito / error tras guardar */}
      {mensajeExito && (
        <div className="reveal flex items-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-emerald-200">
          <CheckCircle className="h-5 w-5 shrink-0" />
          <p>{mensajeExito}</p>
        </div>
      )}
      {mensajeError && (
        <div className="reveal flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-red-200">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p>{mensajeError}</p>
        </div>
      )}

      {/* ── Datos generales ───────────────────────────────────────────────── */}
      <div className="reveal spotlight-card overflow-hidden rounded-[2.5rem] border border-white/10 p-6">
        <div className="spotlight-content">
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-white/80">
            Plan
          </p>
          <h2 className="mb-6 text-xl font-medium tracking-tight text-white">
            Datos generales del plan
          </h2>

          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-white/60">
                Alumno
              </label>
              <div className="relative">
                <select
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className={selectBase}
                >
                  {alumnos.map((a) => (
                    <option
                      key={a.id}
                      value={a.id}
                      className="bg-[#0c0c0c] text-white"
                    >
                      {a.nombre}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-white/60">
                Título del plan
              </label>
              <input
                type="text"
                value={tituloPlan}
                onChange={(e) => setTituloPlan(e.target.value)}
                placeholder="Ej: Plan Hipertrofia Marzo"
                className={inputBase}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Gestión de días ───────────────────────────────────────────────── */}
      <div className="reveal delay-100">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-white/60">
              Estructura
            </p>
            <h2 className="text-xl font-medium tracking-tight text-white">
              Días del plan
            </h2>
          </div>
          <button
            type="button"
            onClick={agregarDia}
            className="flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-medium text-black shadow-[0_4px_20px_-5px_rgba(255,255,255,0.2)] transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_4px_28px_-5px_rgba(255,255,255,0.25)] active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" /> Agregar Nuevo Día
          </button>
        </div>

        <div className="space-y-6">
          {days.length === 0 ? (
            <div className="rounded-[2.5rem] border border-dashed border-white/10 bg-white/2 p-10 text-center">
              <Calendar className="mx-auto mb-3 h-10 w-10 text-white/20" />
              <p className="text-sm text-white/40">
                Aún no hay días. Haz clic en &quot;Agregar Nuevo Día&quot; para
                empezar.
              </p>
            </div>
          ) : (
            days.map((dia, index) => (
              <div
                key={dia.id}
                className="reveal spotlight-card overflow-hidden rounded-[2.5rem] border border-white/10 p-6"
              >
                <div className="spotlight-content">
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1 space-y-3">
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-white/60">
                          Título del día
                        </label>
                        <input
                          type="text"
                          value={dia.titulo}
                          onChange={(e) =>
                            actualizarDia(dia.id, "titulo", e.target.value)
                          }
                          placeholder={`Día ${index + 1}: Tren Superior`}
                          className={inputBase}
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-white/60">
                          Frecuencia / días de la semana
                        </label>
                        <input
                          type="text"
                          value={dia.frecuencia}
                          onChange={(e) =>
                            actualizarDia(dia.id, "frecuencia", e.target.value)
                          }
                          placeholder='Ej: Lunes y Jueves o "2 veces por semana"'
                          className={inputBase}
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => eliminarDia(dia.id)}
                      className="mt-8 shrink-0 rounded-xl p-2 text-white/40 transition-colors hover:bg-white/5 hover:text-red-400"
                      title="Eliminar día"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Ejercicios del día */}
                  <div className="border-t border-white/5 pt-4">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-xs font-medium uppercase tracking-wide text-white/50">
                        Ejercicios
                      </span>
                      <button
                        type="button"
                        onClick={() => agregarEjercicio(dia.id)}
                        className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white/60 transition-colors hover:border-white/20 hover:bg-white/10 hover:text-white"
                      >
                        <Plus className="h-3.5 w-3.5" /> Agregar Ejercicio a este
                        Día
                      </button>
                    </div>

                    {dia.exercises.length === 0 ? (
                      <div className="rounded-2xl border border-white/5 bg-white/2 py-6 text-center">
                        <Dumbbell className="mx-auto mb-2 h-8 w-8 text-white/20" />
                        <p className="text-xs text-white/40">
                          Sin ejercicios. Agrega al menos uno.
                        </p>
                      </div>
                    ) : (
                      <ul className="space-y-4">
                        {dia.exercises.map((ej) => (
                          <li
                            key={ej.id}
                            className="rounded-2xl border border-white/5 bg-white/3 p-4"
                          >
                            <div className="mb-3 flex items-start justify-between gap-2">
                              <div className="min-w-0 flex-1">
                                <label className="mb-1 block text-xs text-white/50">
                                  Ejercicio
                                </label>
                                <div className="relative">
                                  <select
                                    value={ej.exerciseId}
                                    onChange={(e) =>
                                      actualizarEjercicio(
                                        dia.id,
                                        ej.id,
                                        "exerciseId",
                                        e.target.value
                                      )}
                                    className={selectBase + " py-2.5"}
                                  >
                                    <option
                                      value=""
                                      className="bg-[#0c0c0c] text-white"
                                    >
                                      Seleccionar ejercicio...
                                    </option>
                                    {ejercicios.map((ex) => (
                                      <option
                                        key={ex.id}
                                        value={ex.id}
                                        className="bg-[#0c0c0c] text-white"
                                      >
                                        {ex.nombre}
                                      </option>
                                    ))}
                                  </select>
                                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() =>
                                  eliminarEjercicio(dia.id, ej.id)
                                }
                                className="shrink-0 rounded-xl p-2 text-white/30 transition-colors hover:bg-white/5 hover:text-red-400"
                                title="Eliminar ejercicio"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                              <div>
                                <label className="mb-1 block text-xs text-white/50">
                                  Series
                                </label>
                                <input
                                  type="text"
                                  value={ej.series}
                                  onChange={(e) =>
                                    actualizarEjercicio(
                                      dia.id,
                                      ej.id,
                                      "series",
                                      e.target.value
                                    )}
                                  placeholder="4"
                                  className={inputBase + " py-2.5"}
                                />
                              </div>
                              <div>
                                <label className="mb-1 block text-xs text-white/50">
                                  Repeticiones
                                </label>
                                <input
                                  type="text"
                                  value={ej.repeticiones}
                                  onChange={(e) =>
                                    actualizarEjercicio(
                                      dia.id,
                                      ej.id,
                                      "repeticiones",
                                      e.target.value
                                    )}
                                  placeholder="10-12"
                                  className={inputBase + " py-2.5"}
                                />
                              </div>
                              <div>
                                <label className="mb-1 block text-xs text-white/50">
                                  Tiempo de descanso
                                </label>
                                <input
                                  type="text"
                                  value={ej.tiempo_descanso}
                                  onChange={(e) =>
                                    actualizarEjercicio(
                                      dia.id,
                                      ej.id,
                                      "tiempo_descanso",
                                      e.target.value
                                    )}
                                  placeholder="Ej: 90s o 2 min"
                                  className={inputBase + " py-2.5"}
                                />
                              </div>
                              <div>
                                <label className="mb-1 block text-xs text-white/50">
                                  Intensidad OMNI-RES (1–10)
                                </label>
                                <select
                                  value={ej.intensidad_omni}
                                  onChange={(e) =>
                                    actualizarEjercicio(
                                      dia.id,
                                      ej.id,
                                      "intensidad_omni",
                                      Number(e.target.value)
                                    )}
                                  className={selectBase + " py-2.5"}
                                >
                                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                                    <option
                                      key={n}
                                      value={n}
                                      className="bg-[#0c0c0c] text-white"
                                    >
                                      {n}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── Botón guardar plan ─────────────────────────────────────────────── */}
      <div className="reveal delay-200 flex justify-center pb-8">
        <button
          type="button"
          onClick={guardarPlan}
          disabled={
            guardando ||
            days.length === 0 ||
            !tituloPlan.trim()
          }
          className="flex w-full max-w-lg items-center justify-center gap-3 rounded-full bg-white px-10 py-5 text-lg font-medium text-black shadow-[0_4px_30px_-5px_rgba(255,255,255,0.15)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_4px_40px_-5px_rgba(255,255,255,0.25)] active:scale-[0.98] disabled:scale-100 disabled:opacity-50 disabled:pointer-events-none disabled:shadow-none"
        >
          <Save className="h-6 w-6" />
          {guardando ? "Guardando..." : "GUARDAR PLAN COMPLETADO"}
        </button>
      </div>
    </div>
  );
}
