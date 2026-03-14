"use client";

import { useState } from "react";
import Link from "next/link";
import { Users, Library, FileEdit, User } from "lucide-react";
import { AuraPageWrapper } from "@/components/aura-page-wrapper";
import { ClientesTab } from "@/components/admin/clientes-tab";
import { BibliotecaTab } from "@/components/admin/biblioteca-tab";
import { PlanesTab } from "@/components/admin/planes-tab";

const TAB_IDS = ["clientes", "biblioteca", "planes"] as const;
const TAB_LABELS: Record<(typeof TAB_IDS)[number], string> = {
  clientes: "Mis Clientes",
  biblioteca: "Biblioteca de Ejercicios",
  planes: "Creador de Planes",
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
  const [preselectedClientId, setPreselectedClientId] = useState<string | null>(null);
  const fechaHoy = formatFechaHoy();

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
            <ClientesTab
              onNavigateToPlanes={(clientId) => {
                setPreselectedClientId(clientId);
                setTabActivo("planes");
              }}
            />
          )}

          {tabActivo === "biblioteca" && <BibliotecaTab />}

          {tabActivo === "planes" && (
            <PlanesTab preselectedClient={preselectedClientId} />
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
