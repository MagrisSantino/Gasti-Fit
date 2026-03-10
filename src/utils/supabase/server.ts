import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";

/**
 * Cliente de Supabase para uso en el servidor (Server Components, Server Actions, Route Handlers).
 * Utiliza cookies() de next/headers para leer y escribir la sesión.
 * Tipado con el esquema de public (users, exercises, plans, plan_exercises, workout_logs).
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options ?? {})
            );
          } catch {
            // Llamado desde un Server Component; el middleware se encargará de refrescar la sesión.
          }
        },
      },
    }
  );
}
