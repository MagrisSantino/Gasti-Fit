"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  User,
  Plus,
  X,
  Mail,
  IdCard,
  Calendar,
  ChevronRight,
  Eye,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { createClientAccount } from "@/app/actions/clients";

type Cliente = {
  id: string;
  nombre: string;
  email: string;
  created_at?: string;
};

type PlanCliente = {
  id: string;
  user_id: string;
  titulo_plan: string;
  fecha_creacion?: string;
};

type ProfileTab = "datos" | "planes";

const inputBase =
  "w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-white/30 transition-colors";

function formatFecha(fecha: string | undefined): string {
  if (!fecha) return "—";
  try {
    return new Date(fecha).toLocaleDateString("es-AR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

type ClientesTabProps = {
  /** Se llama al hacer clic en "+ Crear Plan" con el ID del alumno; navega al Creador de Planes y preselecciona al alumno. */
  onNavigateToPlanes: (clientId: string) => void;
};

export function ClientesTab({ onNavigateToPlanes }: ClientesTabProps) {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loadingLista, setLoadingLista] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [mensaje, setMensaje] = useState<{
    tipo: "success" | "error";
    texto: string;
  } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [selectedClient, setSelectedClient] = useState<Cliente | null>(null);
  const [profileTab, setProfileTab] = useState<ProfileTab>("datos");
  const [clientPlans, setClientPlans] = useState<PlanCliente[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(false);

  const cargarClientes = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("users")
      .select("id, nombre, email, created_at")
      .eq("rol", "client")
      .order("created_at", { ascending: false });
    setClientes(data ?? []);
    setLoadingLista(false);
  }, []);

  useEffect(() => {
    cargarClientes();
  }, [cargarClientes]);

  const cargarPlanesDelCliente = useCallback(async (userId: string) => {
    setLoadingPlans(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("plans")
      .select("id, user_id, titulo_plan, fecha_creacion")
      .eq("user_id", userId)
      .order("fecha_creacion", { ascending: false });
    setClientPlans(data ?? []);
    setLoadingPlans(false);
  }, []);

  useEffect(() => {
    if (selectedClient) {
      setProfileTab("datos");
      cargarPlanesDelCliente(selectedClient.id);
    } else {
      setClientPlans([]);
    }
  }, [selectedClient, cargarPlanesDelCliente]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    setLoadingSubmit(true);
    setMensaje(null);

    const result = await createClientAccount(formData);

    setLoadingSubmit(false);
    if (result?.error) {
      setMensaje({ tipo: "error", texto: result.error });
    } else if (result?.success) {
      setMensaje({ tipo: "success", texto: "Alumno dado de alta correctamente." });
      form.reset();
      cargarClientes();
      setIsModalOpen(false);
    }
  }

  function cerrarModalCrear() {
    setIsModalOpen(false);
    setMensaje(null);
  }

  function abrirPerfil(cliente: Cliente) {
    setSelectedClient(cliente);
  }

  function cerrarPerfil() {
    setSelectedClient(null);
  }

  function handleCrearPlanClick() {
    if (selectedClient) {
      onNavigateToPlanes(selectedClient.id);
      setSelectedClient(null);
    }
  }

  return (
    <>
      {/* Vista principal: lista de alumnos */}
      <div className="reveal mx-auto max-w-4xl">
        <header className="mb-4 sm:mb-6 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-between gap-3">
          <h2 className="text-lg sm:text-xl font-medium tracking-tight text-white">
            Mis Alumnos
          </h2>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-medium text-black shadow-[0_4px_20px_-5px_rgba(255,255,255,0.2)] transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_4px_28px_-5px_rgba(255,255,255,0.25)] active:scale-[0.98] touch-manipulation"
          >
            <Plus className="h-4 w-4" /> Crear Alumno
          </button>
        </header>

        <div className="spotlight-card overflow-hidden rounded-2xl sm:rounded-[2.5rem] border border-white/10 p-4 sm:p-6">
          <div className="spotlight-content">
            {loadingLista ? (
              <p className="rounded-2xl border border-white/5 bg-white/2 px-4 py-3 text-sm text-white/40">
                Cargando alumnos...
              </p>
            ) : clientes.length === 0 ? (
              <p className="rounded-2xl border border-white/5 bg-white/2 px-4 py-8 text-center text-sm text-white/40">
                Aún no hay alumnos. Haz clic en &quot;+ Crear Alumno&quot; para dar de alta el primero.
              </p>
            ) : (
              <ul className="space-y-2">
                {clientes.map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => abrirPerfil(c)}
                      className="flex w-full cursor-pointer items-center gap-3 rounded-full border border-white/5 bg-white/2 px-4 py-3 text-left transition-transform hover:scale-[1.01] hover:bg-white/4"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5">
                        <User className="h-5 w-5 text-white/50" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-white">
                          {c.nombre || "Sin nombre"}
                        </p>
                        <p className="truncate text-xs text-white/50">{c.email}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 shrink-0 text-white/40" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Modal: formulario dar de alta */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <button
            type="button"
            onClick={cerrarModalCrear}
            className="absolute inset-0 cursor-default"
            aria-label="Cerrar"
          />
          <div className="relative z-10 w-full max-w-md mx-2 sm:mx-0">
            <div className="spotlight-card overflow-hidden rounded-2xl sm:rounded-[2.5rem] border border-white/10 p-4 sm:p-6">
              <div className="spotlight-content">
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="text-xl font-medium tracking-tight text-white">
                    Dar de alta un alumno
                  </h3>
                  <button
                    type="button"
                    onClick={cerrarModalCrear}
                    className="rounded-xl p-2 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
                    aria-label="Cerrar"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-white/60">
                      Nombre completo
                    </label>
                    <input
                      type="text"
                      name="nombre"
                      placeholder="Ej: María García"
                      className={inputBase}
                      disabled={loadingSubmit}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-white/60">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      placeholder="alumno@email.com"
                      className={inputBase}
                      required
                      disabled={loadingSubmit}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-white/60">
                      Contraseña temporal
                    </label>
                    <input
                      type="password"
                      name="password"
                      placeholder="Mínimo 6 caracteres"
                      className={inputBase}
                      required
                      minLength={6}
                      disabled={loadingSubmit}
                    />
                  </div>

                  {mensaje && (
                    <div
                      className={`rounded-2xl border px-4 py-3 text-sm ${
                        mensaje.tipo === "success"
                          ? "border-white/20 bg-white/10 text-white"
                          : "border-red-500/30 bg-red-500/10 text-red-200"
                      }`}
                    >
                      {mensaje.texto}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loadingSubmit}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-4 text-sm font-medium text-black shadow-[0_4px_20px_-5px_rgba(255,255,255,0.2)] transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_4px_28px_-5px_rgba(255,255,255,0.25)] active:scale-[0.98] disabled:scale-100 disabled:opacity-50 disabled:pointer-events-none"
                  >
                    {loadingSubmit ? "Creando..." : "Dar de alta"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Ficha del cliente (perfil) */}
      {selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <button
            type="button"
            onClick={cerrarPerfil}
            className="absolute inset-0 cursor-default"
            aria-label="Cerrar"
          />
          <div className="relative z-10 w-full max-w-lg max-h-[85vh] sm:max-h-[90vh] overflow-y-auto rounded-2xl sm:rounded-[2.5rem] border border-white/10 bg-white/2 shadow-2xl [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.15)_transparent] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/15 mx-2 sm:mx-0">
            <div className="spotlight-card p-4 sm:p-6">
              <div className="spotlight-content">
                {/* Header del modal */}
                <div className="mb-6 flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-2xl font-medium tracking-tight text-white">
                      {selectedClient.nombre || "Sin nombre"}
                    </h3>
                    <p className="mt-1 text-sm text-white/50">{selectedClient.email}</p>
                  </div>
                  <button
                    type="button"
                    onClick={cerrarPerfil}
                    className="shrink-0 rounded-xl p-2 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
                    aria-label="Cerrar"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Tabs Datos | Planes */}
                <div className="mb-6 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setProfileTab("datos")}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                      profileTab === "datos"
                        ? "bg-white text-black"
                        : "text-white/50 hover:text-white/70"
                    }`}
                  >
                    Datos
                  </button>
                  <button
                    type="button"
                    onClick={() => setProfileTab("planes")}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                      profileTab === "planes"
                        ? "bg-white text-black"
                        : "text-white/50 hover:text-white/70"
                    }`}
                  >
                    Planes
                  </button>
                </div>

                {/* Contenido pestaña Datos */}
                {profileTab === "datos" && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/2 px-4 py-3">
                      <Mail className="h-5 w-5 shrink-0 text-white/40" />
                      <div>
                        <p className="text-xs text-white/50">Email</p>
                        <p className="text-sm font-medium text-white">{selectedClient.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/2 px-4 py-3">
                      <IdCard className="h-5 w-5 shrink-0 text-white/40" />
                      <div className="min-w-0">
                        <p className="text-xs text-white/50">ID de usuario</p>
                        <p className="truncate text-sm font-medium text-white">{selectedClient.id}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/2 px-4 py-3">
                      <Calendar className="h-5 w-5 shrink-0 text-white/40" />
                      <div>
                        <p className="text-xs text-white/50">Fecha de registro</p>
                        <p className="text-sm font-medium text-white">
                          {formatFecha(selectedClient.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Contenido pestaña Planes */}
                {profileTab === "planes" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-end">
                      <button
                        type="button"
                        onClick={handleCrearPlanClick}
                        className="flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-medium text-black transition-all hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <Plus className="h-4 w-4" /> Crear Plan
                      </button>
                    </div>

                    {loadingPlans ? (
                      <p className="rounded-2xl border border-white/5 bg-white/2 px-4 py-6 text-center text-sm text-white/40">
                        Cargando planes...
                      </p>
                    ) : clientPlans.length === 0 ? (
                      <p className="rounded-2xl border border-white/5 bg-white/2 px-4 py-8 text-center text-sm text-white/40">
                        Este alumno aún no tiene planes asignados.
                      </p>
                    ) : (
                      <ul className="space-y-2">
                        {clientPlans.map((plan, index) => (
                          <li
                            key={plan.id}
                            className="flex items-center justify-between gap-3 rounded-2xl border border-white/5 bg-white/2 p-4 transition-colors hover:bg-white/4"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-white">{plan.titulo_plan}</p>
                                {index === 0 && (
                                  <span className="shrink-0 rounded-full bg-emerald-400/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
                                    Activo
                                  </span>
                                )}
                              </div>
                              <p className="mt-0.5 text-xs text-white/50">
                                {formatFecha(plan.fecha_creacion)}
                              </p>
                            </div>
                            <button
                              type="button"
                              className="flex shrink-0 items-center gap-1.5 rounded-xl border border-white/10 px-3 py-2 text-xs font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                            >
                              <Eye className="h-3.5 w-3.5" /> Ver detalle
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
