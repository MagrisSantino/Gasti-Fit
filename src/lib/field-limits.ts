/**
 * Límites de campos según el esquema de Supabase.
 * Usar en todos los formularios (maxLength, max, min) y al validar antes de insert/update.
 * Para NUEVOS campos: definir aquí el límite y usarlo en el front.
 */

export const FIELD_LIMITS = {
  // ─── Auth / users ───────────────────────────────────────────────────────
  email: 255,
  password: 128,
  nombre_usuario: 255,

  // ─── exercise_groups ────────────────────────────────────────────────────
  grupo_nombre: 100,

  // ─── exercises ───────────────────────────────────────────────────────────
  ejercicio_nombre: 100,
  ejercicio_descripcion: 2000,
  tiempo_descanso: 50,
  /** Escala OMNI RES: 1 a 10 */
  intensidad_omni_min: 1,
  intensidad_omni_max: 10,
  /** URLs de video/foto (cada una) */
  url_length: 2048,

  // ─── plans ───────────────────────────────────────────────────────────────
  titulo_plan: 255,

  // ─── plan_exercises ──────────────────────────────────────────────────────
  series: 20,
  repeticiones: 20,

  // ─── workout_logs ────────────────────────────────────────────────────────
  observacion: 600,
  /** Rango típico para costo (si aplica) */
  costo_entrenamiento_min: 0,
  costo_entrenamiento_max: 999,
} as const;

/** Helper: recortar string al máximo permitido para un campo */
export function trimToLimit(value: string, limit: number): string {
  if (value.length <= limit) return value;
  return value.slice(0, limit);
}
