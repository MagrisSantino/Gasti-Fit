"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Users,
  Library,
  FileEdit,
  User,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { AuraPageWrapper } from "@/components/aura-page-wrapper";

const TAB_IDS = ["clientes", "biblioteca", "planes"] as const;
const TAB_LABELS: Record<(typeof TAB_IDS)[number], string> = {
  clientes: "Mis Clientes",
  biblioteca: "Biblioteca de Ejercicios",
  planes: "Creador de Planes",
};

// Clientes de ejemplo para la lista rápida
const CLIENTES_ACTIVOS = [
  { id: "1", nombre: "Ezequiel M.", plan: "Plan Mensual" },
  { id: "2", nombre: "María L.", plan: "Plan 3x Semana" },
  { id: "3", nombre: "Juan P.", plan: "Plan Personalizado" },
];

function formatFechaHoy(): string {
  const hoy = new Date();
  return hoy.toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

// Capitalizar primera letra de cada palabra
function capitalizar(str: string): string {
  return str.replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function AdminPage() {
  const [tabActivo, setTabActivo] = useState<(typeof TAB_IDS)[number]>("clientes");
  const fechaHoy = formatFechaHoy();

  return (
    <AuraPageWrapper>
      <div className="mx-auto max-w-2xl p-5 pb-24 md:pt-8 lg:max-w-4xl">
        {/* Header */}
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-medium tracking-tight text-white">
              Panel de Control - Gasti
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

        {/* Tabs (píldoras: mismo estilo que landing / dashboard) */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-3">
            {TAB_IDS.map((id) => {
              const isActive = tabActivo === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTabActivo(id)}
                  className={`flex h-12 min-w-[10rem] shrink-0 items-center justify-center gap-2 rounded-2xl border px-5 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "border-[#00e5ff]/50 bg-[#00e5ff] text-black shadow-[0_0_20px_-5px_rgba(0,229,255,0.4)]"
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

        {/* Contenido principal según tab */}
        <div className="space-y-8">
          {tabActivo === "clientes" && (
            <>
              {/* Tarjeta: Lista rápida de clientes activos */}
              <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/[0.03] p-6 shadow-2xl shadow-black backdrop-blur-xl">
                <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[#00e5ff]/10 blur-3xl" />
                <div className="relative z-10">
                  <p className="mb-1 text-xs font-medium uppercase tracking-wide text-[#00e5ff]">
                    Clientes activos
                  </p>
                  <h2 className="mb-4 text-xl font-medium tracking-tight text-white">
                    Lista rápida
                  </h2>
                  <ul className="space-y-2">
                    {CLIENTES_ACTIVOS.length === 0 ? (
                      <li className="rounded-2xl border border-white/5 bg-white/[0.02] px-4 py-3 text-sm text-white/40">
                        Aún no hay clientes activos.
                      </li>
                    ) : (
                      CLIENTES_ACTIVOS.map((c) => (
                        <li
                          key={c.id}
                          className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.02] p-3 transition-colors hover:bg-white/[0.04]"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5">
                              <User className="h-4 w-4 text-white/40" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-white">
                                {c.nombre}
                              </p>
                              <p className="text-xs text-white/50">{c.plan}</p>
                            </div>
                          </div>
                          <ChevronRight className="h-4 w-4 text-white/40" />
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              </div>

              {/* Botón destacado: mismo estilo que landing / FAB */}
              <div className="flex justify-center">
                <a
                  href="https://strengthlevel.es/calculadora-de-una-repeticion-maxima"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex w-full max-w-lg items-center justify-center gap-4 rounded-full bg-[#00e5ff] px-10 py-5 text-xl font-medium text-black shadow-[0_4px_30px_-5px_rgba(0,229,255,0.4)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_4px_40px_-5px_rgba(0,229,255,0.5)] active:scale-[0.98]"
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

          {tabActivo === "biblioteca" && (
            <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/[0.03] p-8 shadow-2xl shadow-black backdrop-blur-xl">
              <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[#00e5ff]/10 blur-3xl" />
              <div className="relative z-10 text-center">
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-[#00e5ff]">
                  Próximamente
                </p>
                <h2 className="text-xl font-medium tracking-tight text-white">
                  Biblioteca de Ejercicios
                </h2>
                <p className="mt-3 text-lg font-light text-white/50">
                  Aquí podrás gestionar tu catálogo de ejercicios.
                </p>
              </div>
            </div>
          )}

          {tabActivo === "planes" && (
            <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/[0.03] p-8 shadow-2xl shadow-black backdrop-blur-xl">
              <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[#00e5ff]/10 blur-3xl" />
              <div className="relative z-10 text-center">
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-[#00e5ff]">
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

      {/* Link de vuelta: mismo estilo que landing */}
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
