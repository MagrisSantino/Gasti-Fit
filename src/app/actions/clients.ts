"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * Crea una cuenta de cliente desde el panel de administrador.
 * Usa la Admin API (service role) para no afectar la sesión del admin.
 * El trigger de la base de datos inserta la fila en public.users con rol 'client'.
 */
export async function createClientAccount(formData: FormData) {
  const nombre = (formData.get("nombre") as string)?.trim();
  const email = (formData.get("email") as string)?.trim();
  const password = (formData.get("password") as string) ?? "";

  if (!email) {
    return { error: "El email es obligatorio." };
  }
  if (!password) {
    return { error: "La contraseña es obligatoria." };
  }
  if (password.length < 6) {
    return { error: "La contraseña debe tener al menos 6 caracteres." };
  }

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return { error: "Configuración del servidor incompleta." };
  }

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { nombre: nombre || email.split("@")[0] },
  });

  if (error) {
    if (error.message.toLowerCase().includes("already been registered")) {
      return { error: "Ya existe una cuenta con ese email." };
    }
    return { error: error.message };
  }

  revalidatePath("/admin");
  return { success: true };
}
