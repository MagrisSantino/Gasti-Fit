/**
 * Tipos de la base de datos Supabase (Gasti Fit).
 * Mantener en sync con el esquema en Supabase:
 * - public.users (auth.users)
 * - public.exercise_groups
 * - public.exercises
 * - public.plans
 * - public.plan_exercises
 * - public.workout_logs
 *
 * Límites de campos (maxLength, min, max) en front: ver y usar @/lib/field-limits.ts.
 * Para NUEVOS campos: definir el límite en field-limits.ts y usarlo en formularios.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

/** Rol del usuario en la app */
export type UserRol = "admin" | "client";

/** Categoría del ejercicio (escala OMNI RES) */
export type ExerciseCategoria = "General" | "Específico" | "Adaptado";

/** Días de la semana para plan_exercises */
export type DiaSemana =
  | "Lunes"
  | "Martes"
  | "Miércoles"
  | "Jueves"
  | "Viernes"
  | "Sábado"
  | "Domingo";

export interface Database {
  public: {
    Tables: {
      exercise_groups: {
        Row: {
          id: string;
          nombre: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          nombre: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          nombre?: string;
          created_at?: string;
        };
      };
      users: {
        Row: {
          id: string;
          rol: UserRol;
          nombre: string;
          email: string;
          created_at: string;
        };
        Insert: {
          id: string;
          rol?: UserRol;
          nombre: string;
          email: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          rol?: UserRol;
          nombre?: string;
          email?: string;
          created_at?: string;
        };
      };
      exercises: {
        Row: {
          id: string;
          nombre: string;
          group_id: string | null;
          video_url: string | null;
          videos: string[] | null;
          descripcion: string | null;
          fotos: string[] | null;
          categoria: ExerciseCategoria | null;
          intensidad_omni: number | null;
          tiempo_descanso: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          nombre: string;
          group_id?: string | null;
          video_url?: string | null;
          videos?: string[] | null;
          descripcion?: string | null;
          fotos?: string[] | null;
          categoria?: ExerciseCategoria | null;
          intensidad_omni?: number | null;
          tiempo_descanso?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          nombre?: string;
          group_id?: string | null;
          video_url?: string | null;
          videos?: string[] | null;
          descripcion?: string | null;
          fotos?: string[] | null;
          categoria?: ExerciseCategoria | null;
          intensidad_omni?: number | null;
          tiempo_descanso?: string | null;
          created_at?: string;
        };
      };
      plans: {
        Row: {
          id: string;
          user_id: string;
          titulo_plan: string;
          fecha_creacion: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          titulo_plan: string;
          fecha_creacion?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          titulo_plan?: string;
          fecha_creacion?: string;
        };
      };
      plan_exercises: {
        Row: {
          id: string;
          plan_id: string;
          exercise_id: string;
          dia_semana: DiaSemana;
          series: string;
          repeticiones: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          plan_id: string;
          exercise_id: string;
          dia_semana: DiaSemana;
          series: string;
          repeticiones: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          plan_id?: string;
          exercise_id?: string;
          dia_semana?: DiaSemana;
          series?: string;
          repeticiones?: string;
          created_at?: string;
        };
      };
      workout_logs: {
        Row: {
          id: string;
          user_id: string;
          plan_id: string;
          fecha: string;
          costo_entrenamiento: number | null;
          observacion: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          plan_id: string;
          fecha?: string;
          costo_entrenamiento?: number | null;
          observacion?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          plan_id?: string;
          fecha?: string;
          costo_entrenamiento?: number | null;
          observacion?: string | null;
          created_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

/** Helper: tipo Row de una tabla */
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

/** Helper: tipo Insert de una tabla */
export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];

/** Helper: tipo Update de una tabla */
export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];

/** Alias de uso frecuente */
export type User = Tables<"users">;
export type Exercise = Tables<"exercises">;
export type Plan = Tables<"plans">;
export type PlanExercise = Tables<"plan_exercises">;
export type WorkoutLog = Tables<"workout_logs">;
