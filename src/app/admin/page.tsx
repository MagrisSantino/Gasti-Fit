"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Users, Library, FileEdit, User, ChevronRight, ArrowRight } from "lucide-react";
import { AuraPageWrapper } from "@/components/aura-page-wrapper";
import { createClient } from "@/utils/supabase/client";
import { BibliotecaTab } from "@/components/admin/biblioteca-tab";

const TAB_IDS = ["clientes", "biblioteca", "planes"] as const;
const TAB_LABELS: Record<(typeof TAB_IDS)[number], string> = {
  clientes: "Mis Clientes",
  biblioteca: "Biblioteca de Ejercicios",
  planes: "Creador de Planes",
};

type Cliente = {
  id: string;
  nombre: string;
  email: string;
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

export default function AdminPage() {
  const [tabActivo, setTabActivo] = useState<(typeof TAB_IDS)[number]>("clientes");
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loadingClientes, setLoadingClientes] = useState(true);
  const fechaHoy = formatFechaHoy();

  useEffect(() => {
    let mounted = true;

    async function cargarClientes() {
      const supabase = createClient();
      const { data } = await supabase
        .from("users")
        .select("id, nombre, email")
        .eq("rol", "client")
        .order("created_at", { ascending: false });
      if (!mounted) return;
      if (data) setClientes(data);
      setLoadingClientes(false);
    }

    cargarClientes();
    return () => { mounted = false; };
  }, []);

  return (
    <AuraPageWrapper>
      <div className="mx-auto min-w-0 max-w-2xl p-5 pb-24 md:pt-8 lg:max-w-4xl">
        {/* Header */}
        <header className="reveal mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-medium tracking-tight text-white">
              Panel de Control — Gasti
            </h1>
            <p className="mt-1 text-lg font-light text-white/50">
              {capitalizar(fechaHoy)}
            </p>
          </div>
          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full border border-white/10">
            <div className="flex h-full w-full items-center justify-center bg-white/5">
              <User className="h-6 w-6 text-white/40" />
            </div>
          </div>
        </header>

        {/* Tabs */}
        <div className="reveal delay-100 mb-8">
          <div className="flex flex-wrap gap-3">
            {TAB_IDS.map((id) => {
              const isActive = tabActivo === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTabActivo(id)}
                  className={`flex h-12 min-w-40 shrink-0 items-center justify-center gap-2 rounded-2xl border px-5 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "border-white/50 bg-white text-black shadow-[0_4px_30px_-5px_rgba(255,255,255,0.15)]"
                      : "border-white/5 bg-white/5 text-white/50 hover:border-white/10 hover:bg-white/[0.07] hover:text-white/70"
                  }`}
                >
                  {id === "clientes" && <Users className="h-4 w-4" />}
                  {id === "biblioteca" && <Library className="h-4 w-4" />}
                  {id === "planes" && <FileEdit className="h-4 w-4" />}
                  {TAB_LABELS[id]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Contenido */}
        <div key={tabActivo} className="space-y-8">
          {tabActivo === "clientes" && (
            <>
              <div className="reveal delay-200 spotlight-card overflow-hidden rounded-[2.5rem] border border-white/10 p-6">
                <div className="spotlight-content">
                  <p className="mb-1 text-xs font-medium uppercase tracking-wide text-white/80">
                    Clientes activos
                  </p>
                  <h2 className="mb-4 text-xl font-medium tracking-tight text-white">
                    Lista rápida
                  </h2>
                  <ul className="space-y-2">
                    {loadingClientes ? (
                      <li className="rounded-2xl border border-white/5 bg-white/2 px-4 py-3 text-sm text-white/40">
                        Cargando clientes...
                      </li>
                    ) : clientes.length === 0 ? (
                      <li className="rounded-2xl border border-white/5 bg-white/2 px-4 py-3 text-sm text-white/40">
                        Aún no hay clientes activos.
                      </li>
                    ) : (
                      clientes.map((c) => (
                        <li
                          key={c.id}
                          className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/2 p-3 transition-colors hover:bg-white/4"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5">
                              <span className="text-sm font-medium text-white/60">
                                {c.nombre[0].toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-white">{c.nombre}</p>
                              <p className="text-xs text-white/50">{c.email}</p>
                            </div>
                          </div>
                          <ChevronRight className="h-4 w-4 text-white/40" />
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              </div>

              <div className="reveal delay-300 flex justify-center">
                <a
                  href="https://strengthlevel.es/calculadora-de-una-repeticion-maxima"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex w-full max-w-lg items-center justify-center gap-4 rounded-full bg-white px-10 py-5 text-xl font-medium text-black shadow-[0_4px_30px_-5px_rgba(255,255,255,0.15)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_4px_40px_-5px_rgba(255,255,255,0.25)] active:scale-[0.98]"
                >
                  Calculadora RM
                  <ArrowRight
                    className="h-6 w-6 transition-transform duration-300 group-hover:translate-x-1"
                    strokeWidth={1.5}
                  />
                </a>
              </div>
            </>
          )}

          {tabActivo === "biblioteca" && <BibliotecaTab />}

          {tabActivo === "planes" && (
            <div className="reveal spotlight-card overflow-hidden rounded-[2.5rem] border border-white/10 p-8">
              <div className="spotlight-content text-center">
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-white/80">
                  Próximamente
                </p>
                <h2 className="text-xl font-medium tracking-tight text-white">
                  Creador de Planes
                </h2>
                <p className="mt-3 text-lg font-light text-white/50">
                  Crea y edita planes de entrenamiento para tus clientes.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="fixed bottom-4 left-4 z-40">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-lg font-light text-white/50 backdrop-blur-md transition-colors hover:border-white/20 hover:text-white"
        >
          ← Volver al inicio
        </Link>
      </div>
    </AuraPageWrapper>
  );
}
