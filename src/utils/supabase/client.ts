import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

/**
 * Cliente de Supabase para uso en el navegador (Client Components).
 * Tipado con el esquema de public (users, exercises, plans, plan_exercises, workout_logs).
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
