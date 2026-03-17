"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, ArrowRight } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { AuraPageWrapper } from "@/components/aura-page-wrapper";
import { FIELD_LIMITS } from "@/lib/field-limits";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();

    const { data, error: authError } =
      await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError(authError.message ?? "Error al iniciar sesión");
      setLoading(false);
      return;
    }

    const userId = data?.user?.id;
    if (!userId) {
      setError("No se pudo obtener el usuario.");
      setLoading(false);
      return;
    }

    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("rol")
      .eq("id", userId)
      .single();

    if ((userData as { rol?: string } | null)?.rol === "admin") {
      router.push("/admin");
    } else {
      router.push("/dashboard");
    }

    router.refresh();
    // No setLoading(false) al redirigir: el loading se mantiene hasta que cambie de página
  }

  return (
    <AuraPageWrapper>
      <div className="flex min-h-screen items-center justify-center px-4 py-8 sm:py-12 safe-area-inset-top safe-area-inset-bottom">
        <div className="w-full max-w-md">
          {/* Card: spotlight premium */}
          <div className="reveal spotlight-card rounded-2xl sm:rounded-[2.5rem] border border-white/10 p-6 sm:p-10">
            <div className="spotlight-content mb-8 text-center">
              <h1 className="reveal delay-100 text-2xl font-medium tracking-tight text-white sm:text-3xl">
                Iniciar sesión
              </h1>
              <p className="mt-2 text-lg font-light text-white/50">
                Ingresá con tu email y contraseña
              </p>
            </div>

            <form onSubmit={handleSubmit} className="spotlight-content space-y-6">
              {error && (
                <div
                  role="alert"
                  className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
                >
                  {error}
                </div>
              )}

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-white/70"
                >
                  Email
                </label>
                <div className="relative">
                  <Mail
                    className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40"
                    strokeWidth={1.5}
                  />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    maxLength={FIELD_LIMITS.email}
                    placeholder="tu@email.com"
                    className="w-full rounded-2xl border border-white/10 bg-white/5 py-3.5 pl-12 pr-4 text-white placeholder:text-white/30 outline-none transition-colors focus:border-white focus:ring-2 focus:ring-white/20"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium text-white/70"
                >
                  Contraseña
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40"
                    strokeWidth={1.5}
                  />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    maxLength={FIELD_LIMITS.password}
                    placeholder="••••••••"
                    className="w-full rounded-2xl border border-white/10 bg-white/5 py-3.5 pl-12 pr-4 text-white placeholder:text-white/30 outline-none transition-colors focus:border-white focus:ring-2 focus:ring-white/20"
                  />
                </div>
              </div>

              {/* Botón: paleta monocromática */}
              <button
                type="submit"
                disabled={loading}
                className="reveal delay-200 group flex w-full items-center justify-center gap-3 sm:gap-4 rounded-full bg-white px-6 sm:px-10 py-4 sm:py-5 text-base sm:text-xl font-medium text-black transition-transform duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:transform-none touch-manipulation"
              >
                {loading ? (
                  "Entrando..."
                ) : (
                  <>
                    Iniciar Sesión
                    <ArrowRight
                      className="h-6 w-6 transition-transform duration-300 group-hover:translate-x-1"
                      strokeWidth={1.5}
                    />
                  </>
                )}
              </button>
            </form>

            <p className="spotlight-content mt-6 text-center text-lg font-light text-white/40">
              <Link
                href="/"
                className="text-white/80 transition-colors hover:text-white"
              >
                ← Volver al inicio
              </Link>
            </p>
          </div>
        </div>
      </div>
    </AuraPageWrapper>
  );
}
