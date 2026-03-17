"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Plus, X, Edit2, Trash2, Upload, Link2,
  Folder, Dumbbell, AlertCircle, ChevronDown, ChevronRight,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { FIELD_LIMITS, trimToLimit } from "@/lib/field-limits";

// ─── Tipos ───────────────────────────────────────────────────────────────────

type Grupo = { id: string; nombre: string };

type Ejercicio = {
  id: string;
  nombre: string;
  group_id: string | null;
  video_url: string | null;
  videos: string[] | null;
  descripcion: string | null;
  fotos: string[] | null;
};

type FormEj = {
  nombre: string;
  group_id: string;
  descripcion: string;
  videos: string[];
  fotos: string[];
};

const FORM_VACIO: FormEj = {
  nombre: "",
  group_id: "",
  descripcion: "",
  videos: [],
  fotos: [],
};

const MAX_VIDEOS = 3;
const MAX_FOTOS = 5;
const MAX_VIDEO_MB = 250;
const MAX_FOTO_MB = 100;

type ConfirmState = {
  titulo: string;
  descripcion: string;
  onConfirm: () => void;
} | null;

// ─── Componente ──────────────────────────────────────────────────────────────

export function BibliotecaTab() {
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [ejercicios, setEjercicios] = useState<Ejercicio[]>([]);
  const [filtroGrupo, setFiltroGrupo] = useState<string | null>(null);
  const [grupoExpandido, setGrupoExpandido] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Modal ejercicio
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editando, setEditando] = useState<Ejercicio | null>(null);
  const [form, setForm] = useState<FormEj>(FORM_VACIO);
  const [videoUrlInput, setVideoUrlInput] = useState("");
  const [fotoUrlInput, setFotoUrlInput] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [errorForm, setErrorForm] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<ConfirmState>(null);

  // Grupos inline
  const [grupoEditandoId, setGrupoEditandoId] = useState<string | null>(null);
  const [grupoEditNombre, setGrupoEditNombre] = useState("");
  const [creandoGrupo, setCreandoGrupo] = useState(false);
  const [nuevoGrupoNombre, setNuevoGrupoNombre] = useState("");

  // Uploads (null = inactivo, 0-100 = progreso %)
  const [videoProgress, setVideoProgress] = useState<number | null>(null);
  const [fotoProgress, setFotoProgress] = useState<number | null>(null);
  const videoRef = useRef<HTMLInputElement>(null);
  const fotoRef = useRef<HTMLInputElement>(null);
  const videoXhrRef = useRef<XMLHttpRequest | null>(null);
  const fotoXhrRef = useRef<XMLHttpRequest | null>(null);

  // ─── Carga inicial ─────────────────────────────────────────────────────────

  useEffect(() => {
    let mounted = true;
    async function cargar() {
      const sb = createClient();
      const [{ data: gData }, { data: eData }] = await Promise.all([
        sb.from("exercise_groups").select("id, nombre").order("created_at"),
        sb
          .from("exercises")
          .select("id, nombre, group_id, video_url, videos, descripcion, fotos")
          .order("nombre"),
      ]);
      if (!mounted) return;
      if (gData) setGrupos(gData);
      if (eData) setEjercicios(eData);
      setLoading(false);
    }
    cargar();
    return () => { mounted = false; };
  }, []);

  // ─── Helpers ───────────────────────────────────────────────────────────────

  const ejerciciosFiltrados = filtroGrupo
    ? ejercicios.filter((e) => e.group_id === filtroGrupo)
    : ejercicios;

  function setF<K extends keyof FormEj>(key: K, val: FormEj[K]) {
    setForm((p) => ({ ...p, [key]: val }));
  }

  function pedirConfirm(titulo: string, descripcion: string, onConfirm: () => void) {
    setConfirmModal({ titulo, descripcion, onConfirm });
  }

  // ─── GRUPOS: crear / editar / eliminar ────────────────────────────────────

  async function crearGrupo() {
    const nombre = trimToLimit(nuevoGrupoNombre.trim(), FIELD_LIMITS.grupo_nombre);
    if (!nombre) return;
    const sb = createClient();
    const { data } = await (sb.from("exercise_groups") as any).insert({ nombre }).select("id, nombre").single();
    if (data) {
      setGrupos((p) => [...p, data]);
      setNuevoGrupoNombre("");
      setCreandoGrupo(false);
    }
  }

  async function guardarGrupo(id: string) {
    const nombre = trimToLimit(grupoEditNombre.trim(), FIELD_LIMITS.grupo_nombre);
    if (!nombre) return;
    const sb = createClient();
    await (sb.from("exercise_groups") as any).update({ nombre }).eq("id", id);
    setGrupos((p) => p.map((g) => (g.id === id ? { ...g, nombre } : g)));
    setGrupoEditandoId(null);
  }

  function eliminarGrupo(id: string) {
    const g = grupos.find((x) => x.id === id);
    pedirConfirm(
      "¿Eliminar grupo?",
      `Se eliminará "${g?.nombre ?? "este grupo"}". Los ejercicios quedarán sin grupo asignado.`,
      async () => {
        const sb = createClient();
        await sb.from("exercise_groups").delete().eq("id", id);
        setGrupos((p) => p.filter((g) => g.id !== id));
        if (filtroGrupo === id) setFiltroGrupo(null);
      }
    );
  }

  // ─── EJERCICIOS: abrir modal ───────────────────────────────────────────────

  function abrirCrear(groupId?: string) {
    setEditando(null);
    setForm({ ...FORM_VACIO, group_id: groupId ?? filtroGrupo ?? "" });
    setVideoUrlInput("");
    setFotoUrlInput("");
    setErrorForm(null);
    setModalAbierto(true);
  }

  function abrirEditar(ej: Ejercicio) {
    setEditando(ej);
    // Migra video_url legacy al array de videos si no hay datos nuevos
    const videos = ej.videos ?? (ej.video_url ? [ej.video_url] : []);
    setForm({
      nombre: ej.nombre,
      group_id: ej.group_id ?? "",
      descripcion: ej.descripcion ?? "",
      videos,
      fotos: ej.fotos ?? [],
    });
    setVideoUrlInput("");
    setFotoUrlInput("");
    setErrorForm(null);
    setModalAbierto(true);
  }

  function cerrarModal() {
    setModalAbierto(false);
    setEditando(null);
  }

  // ─── EJERCICIOS: guardar ──────────────────────────────────────────────────

  async function guardarEjercicio() {
    if (!form.nombre.trim()) { setErrorForm("El nombre es obligatorio."); return; }
    const nombre = trimToLimit(form.nombre.trim(), FIELD_LIMITS.ejercicio_nombre);
    const descripcion = trimToLimit(form.descripcion.trim(), FIELD_LIMITS.ejercicio_descripcion) || null;
    setGuardando(true);
    setErrorForm(null);
    try {
      const sb = createClient();
      const payload = {
        nombre,
        group_id: form.group_id || null,
        descripcion: descripcion || null,
        video_url: form.videos[0] ?? null,
        videos: form.videos.length > 0 ? form.videos : null,
        fotos: form.fotos.length > 0 ? form.fotos : null,
      };

      const campos =
        "id, nombre, group_id, video_url, videos, descripcion, fotos";

      if (editando) {
        const { data, error } = await (sb.from("exercises") as any).update(payload).eq("id", editando.id).select(campos).single();
        if (error) { setErrorForm(error.message); }
        else if (data) {
          setEjercicios((p) =>
            p.map((e) => (e.id === data.id ? (data as Ejercicio) : e))
          );
          cerrarModal();
        }
      } else {
        const { data, error } = await (sb.from("exercises") as any).insert(payload).select(campos).single();
        if (error) { setErrorForm(error.message); }
        else if (data) {
          setEjercicios((p) =>
            [...p, data as Ejercicio].sort((a, b) => a.nombre.localeCompare(b.nombre))
          );
          cerrarModal();
        }
      }
    } catch (err) {
      setErrorForm(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setGuardando(false);
    }
  }

  function eliminarEjercicio(id: string) {
    const ej = ejercicios.find((x) => x.id === id);
    pedirConfirm(
      "¿Eliminar ejercicio?",
      `Se eliminará "${ej?.nombre ?? "este ejercicio"}" de forma permanente.`,
      async () => {
        const sb = createClient();
        await sb.from("exercises").delete().eq("id", id);
        setEjercicios((p) => p.filter((e) => e.id !== id));
      }
    );
  }

  // ─── UPLOADS ──────────────────────────────────────────────────────────────

  async function subirConProgreso(
    file: File,
    path: string,
    onProgress: (pct: number) => void,
    xhrRef: React.MutableRefObject<XMLHttpRequest | null>,
  ): Promise<string | null> {
    const sb = createClient();
    const { data: { session } } = await sb.auth.getSession();
    const token = session?.access_token;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhrRef.current = xhr;
      xhr.open("POST", `${supabaseUrl}/storage/v1/object/exercise-media/${path}`);
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);
      xhr.setRequestHeader("cache-control", "max-age=3600");
      xhr.setRequestHeader("content-type", file.type || "application/octet-stream");
      xhr.setRequestHeader("x-upsert", "false");

      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
      });

      xhr.addEventListener("load", () => {
        xhrRef.current = null;
        if (xhr.status >= 200 && xhr.status < 300) {
          const { data: u } = sb.storage.from("exercise-media").getPublicUrl(path);
          resolve(u.publicUrl);
        } else {
          reject(new Error(`Error ${xhr.status}: ${xhr.responseText}`));
        }
      });

      xhr.addEventListener("abort", () => { xhrRef.current = null; reject(new Error("__cancelado__")); });
      xhr.addEventListener("error", () => { xhrRef.current = null; reject(new Error("Error de red al subir")); });
      xhr.send(file);
    });
  }

  async function subirVideo(file: File) {
    if (form.videos.length >= MAX_VIDEOS) {
      setErrorForm(`Máximo ${MAX_VIDEOS} videos por ejercicio`);
      return;
    }
    if (file.size > MAX_VIDEO_MB * 1024 * 1024) {
      setErrorForm(`El video no puede superar los ${MAX_VIDEO_MB} MB`);
      return;
    }
    setVideoProgress(0);
    setErrorForm(null);
    const ext = file.name.split(".").pop();
    const path = `videos/${Date.now()}.${ext}`;
    try {
      const url = await subirConProgreso(file, path, setVideoProgress, videoXhrRef);
      if (url) setForm((p) => ({ ...p, videos: [...p.videos, url] }));
    } catch (err) {
      if (err instanceof Error && err.message !== "__cancelado__")
        setErrorForm(err.message);
    } finally {
      setVideoProgress(null);
      if (videoRef.current) videoRef.current.value = "";
    }
  }

  async function subirFoto(file: File) {
    if (form.fotos.length >= MAX_FOTOS) {
      setErrorForm(`Máximo ${MAX_FOTOS} fotos por ejercicio`);
      return;
    }
    if (file.size > MAX_FOTO_MB * 1024 * 1024) {
      setErrorForm(`La foto no puede superar los ${MAX_FOTO_MB} MB`);
      return;
    }
    setFotoProgress(0);
    setErrorForm(null);
    const ext = file.name.split(".").pop();
    const path = `fotos/${Date.now()}.${ext}`;
    try {
      const url = await subirConProgreso(file, path, setFotoProgress, fotoXhrRef);
      if (url) setForm((p) => ({ ...p, fotos: [...p.fotos, url] }));
    } catch (err) {
      if (err instanceof Error && err.message !== "__cancelado__")
        setErrorForm(err.message);
    } finally {
      setFotoProgress(null);
      if (fotoRef.current) fotoRef.current.value = "";
    }
  }

  function agregarVideoUrl() {
    const url = trimToLimit(videoUrlInput.trim(), FIELD_LIMITS.url_length);
    if (!url) return;
    if (form.videos.length >= MAX_VIDEOS) { setErrorForm(`Máximo ${MAX_VIDEOS} videos`); return; }
    setForm((p) => ({ ...p, videos: [...p.videos, url] }));
    setVideoUrlInput("");
  }

  function agregarFotoUrl() {
    const url = trimToLimit(fotoUrlInput.trim(), FIELD_LIMITS.url_length);
    if (!url) return;
    if (form.fotos.length >= MAX_FOTOS) { setErrorForm(`Máximo ${MAX_FOTOS} fotos`); return; }
    setForm((p) => ({ ...p, fotos: [...p.fotos, url] }));
    setFotoUrlInput("");
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="rounded-[2.5rem] border border-white/5 bg-white/2 p-8 text-center">
        <p className="text-white/40">Cargando biblioteca...</p>
      </div>
    );
  }

  return (
    <>
      {/* ── GRUPOS ─────────────────────────────────────────────────────────── */}
      <div className="reveal spotlight-card min-w-0 overflow-hidden rounded-2xl sm:rounded-[2.5rem] border border-white/10 p-4 sm:p-6">
        <div className="spotlight-content">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-white/60">
                Categorías
              </p>
              <h2 className="text-xl font-medium tracking-tight text-white">
                Grupos de ejercicios
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setCreandoGrupo(true)}
              className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/60 transition-colors hover:bg-white/10 hover:text-white"
            >
              <Plus className="h-4 w-4" /> Nuevo grupo
            </button>
          </div>

          <ul className="space-y-2">
            {grupos.map((g) => {
              const ejsGrupo = ejercicios.filter((e) => e.group_id === g.id);
              const expandido = grupoExpandido === g.id;
              return (
                <li key={g.id} className="rounded-2xl border border-white/5 bg-white/2 overflow-hidden">
                  {/* Fila del grupo */}
                  {grupoEditandoId === g.id ? (
                    <div className="flex items-center gap-2 px-4 py-3">
                      <input
                        value={grupoEditNombre}
                        onChange={(e) => setGrupoEditNombre(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && guardarGrupo(g.id)}
                        autoFocus
                        maxLength={FIELD_LIMITS.grupo_nombre}
                        className="flex-1 rounded-xl border border-white/20 bg-white/5 px-3 py-1.5 text-sm text-white outline-none focus:border-white/40"
                      />
                      <button
                        onClick={() => guardarGrupo(g.id)}
                        className="rounded-xl bg-white px-3 py-1.5 text-xs font-medium text-black"
                      >
                        Guardar
                      </button>
                      <button
                        onClick={() => setGrupoEditandoId(null)}
                        className="rounded-xl border border-white/10 px-3 py-1.5 text-xs text-white/50"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between px-4 py-3">
                      {/* Clickeable para expandir */}
                      <button
                        type="button"
                        onClick={() => setGrupoExpandido(expandido ? null : g.id)}
                        className="flex flex-1 items-center gap-3 text-left"
                      >
                        <ChevronRight className={`h-4 w-4 text-white/30 transition-transform duration-300 ease-out ${expandido ? "rotate-90" : ""}`} />
                        <Folder className="h-4 w-4 text-white/30" />
                        <span className="text-sm font-medium text-white">{g.nombre}</span>
                        <span className="text-xs text-white/30">
                          {ejsGrupo.length} ejerc.
                        </span>
                      </button>
                      {/* Acciones */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setGrupoEditandoId(g.id);
                            setGrupoEditNombre(g.nombre);
                          }}
                          className="rounded-xl p-2 text-white/30 transition-colors hover:bg-white/5 hover:text-white/70"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => eliminarGrupo(g.id)}
                          className="rounded-xl p-2 text-white/30 transition-colors hover:bg-red-500/10 hover:text-red-400"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Acordeón: ejercicios del grupo */}
                  <div className={`grid transition-all duration-300 ease-out ${expandido ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                    <div className="overflow-hidden">
                      <div className="border-t border-white/5 px-4 pb-3 pt-2">
                        {ejsGrupo.length === 0 ? (
                          <p className="py-2 text-xs text-white/30">
                            No hay ejercicios en este grupo.{" "}
                            <button
                              onClick={() => abrirCrear(g.id)}
                              className="underline text-white/50 hover:text-white"
                            >
                              Agregar uno
                            </button>
                          </p>
                        ) : (
                          <ul className="space-y-1.5 pt-1">
                            {ejsGrupo.map((ej) => (
                              <li
                                key={ej.id}
                                className="flex items-center justify-between rounded-xl border border-white/5 bg-white/2 px-3 py-2"
                              >
                                <div className="flex items-center gap-2.5">
                                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5">
                                    {ej.fotos?.[0] ? (
                                      <img
                                        src={ej.fotos[0]}
                                        alt={ej.nombre}
                                        className="h-full w-full rounded-lg object-cover"
                                      />
                                    ) : (
                                      <Dumbbell className="h-3.5 w-3.5 text-white/30" />
                                    )}
                                  </div>
                                  <div>
                                    <p className="text-xs font-medium text-white">{ej.nombre}</p>
                                  </div>
                                </div>
                                <button
                                  onClick={() => abrirEditar(ej)}
                                  className="rounded-xl p-1.5 text-white/30 transition-colors hover:bg-white/5 hover:text-white/70"
                                >
                                  <Edit2 className="h-3.5 w-3.5" />
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}

            {creandoGrupo && (
              <li className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/3 px-4 py-3">
                <input
                  value={nuevoGrupoNombre}
                  onChange={(e) => setNuevoGrupoNombre(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && crearGrupo()}
                  autoFocus
                  placeholder="Nombre del grupo..."
                  maxLength={FIELD_LIMITS.grupo_nombre}
                  className="flex-1 rounded-xl border border-white/20 bg-white/5 px-3 py-1.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-white/40"
                />
                <button
                  onClick={crearGrupo}
                  className="rounded-xl bg-white px-3 py-1.5 text-xs font-medium text-black"
                >
                  Crear
                </button>
                <button
                  onClick={() => { setCreandoGrupo(false); setNuevoGrupoNombre(""); }}
                  className="rounded-xl border border-white/10 px-3 py-1.5 text-xs text-white/50"
                >
                  Cancelar
                </button>
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* ── EJERCICIOS ─────────────────────────────────────────────────────── */}
      <div className="reveal delay-100 min-w-0 overflow-x-hidden">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-white/60">
              Catálogo
            </p>
            <h2 className="text-xl font-medium tracking-tight text-white">Ejercicios</h2>
          </div>
          <button
            type="button"
            onClick={() => abrirCrear()}
            className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/60 transition-colors hover:bg-white/10 hover:text-white"
          >
            <Plus className="h-4 w-4" /> Nuevo ejercicio
          </button>
        </div>

        {/* Filtro por grupo: no ensanchar la pantalla; wrap + ancho limitado */}
        <div className="mb-4 flex min-w-0 max-w-full flex-wrap gap-2">
          <button
            onClick={() => setFiltroGrupo(null)}
            className={`rounded-full border px-4 py-1.5 text-xs font-medium transition-colors ${
              filtroGrupo === null
                ? "border-white/50 bg-white text-black"
                : "border-white/10 text-white/50 hover:border-white/20 hover:text-white/70"
            }`}
          >
            Todos
          </button>
          {grupos.map((g) => (
            <button
              key={g.id}
              onClick={() => setFiltroGrupo(filtroGrupo === g.id ? null : g.id)}
              className={`max-w-[12rem] truncate rounded-full border px-4 py-1.5 text-xs font-medium transition-colors ${
                filtroGrupo === g.id
                  ? "border-white/50 bg-white text-black"
                  : "border-white/10 text-white/50 hover:border-white/20 hover:text-white/70"
              }`}
              title={g.nombre}
            >
              {g.nombre}
            </button>
          ))}
        </div>

        {ejerciciosFiltrados.length === 0 ? (
          <div className="rounded-2xl border border-white/5 bg-white/2 p-6 text-center">
            <p className="text-white/40">
              {ejercicios.length === 0
                ? "No hay ejercicios todavía."
                : "No hay ejercicios en este grupo."}
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {ejerciciosFiltrados.map((ej) => {
              const grupo = grupos.find((g) => g.id === ej.group_id);
              return (
                <li
                  key={ej.id}
                  className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/2 p-3 transition-colors hover:bg-white/4"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                      {ej.fotos?.[0] ? (
                        <img
                          src={ej.fotos[0]}
                          alt={ej.nombre}
                          className="h-full w-full rounded-xl object-cover"
                        />
                      ) : (
                        <Dumbbell className="h-4 w-4 text-white/30" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{ej.nombre}</p>
                      <p className="text-xs text-white/40">
                        {grupo?.nombre ?? "Sin grupo"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => abrirEditar(ej)}
                      className="rounded-xl p-2 text-white/30 transition-colors hover:bg-white/5 hover:text-white/70"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => eliminarEjercicio(ej.id)}
                      className="rounded-xl p-2 text-white/30 transition-colors hover:bg-red-500/10 hover:text-red-400"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* ── MODAL EJERCICIO ────────────────────────────────────────────────── */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4 md:items-center">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={cerrarModal}
          />
          <div className="relative z-10 max-h-[85vh] sm:max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl sm:rounded-[2.5rem] border border-white/10 bg-[#0c0c0c] p-4 sm:p-6 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.15)_transparent] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/15 [&::-webkit-scrollbar-thumb:hover]:bg-white/30">
            {/* Header modal */}
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-lg font-medium text-white">
                {editando ? "Editar ejercicio" : "Nuevo ejercicio"}
              </h3>
              <button
                onClick={cerrarModal}
                className="rounded-xl p-2 text-white/40 transition-colors hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              {errorForm && (
                <div className="flex items-center gap-2 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {errorForm}
                </div>
              )}

              {/* Nombre */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-white/60">
                  Nombre *
                </label>
                <input
                  value={form.nombre}
                  onChange={(e) => setF("nombre", e.target.value)}
                  placeholder="Ej: Press de banca"
                  maxLength={FIELD_LIMITS.ejercicio_nombre}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-white/30"
                />
              </div>

              {/* Grupo */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-white/60">
                  Grupo
                </label>
                <select
                  value={form.group_id}
                  onChange={(e) => setF("group_id", e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-[#0c0c0c] px-4 py-3 text-sm text-white outline-none focus:border-white/30"
                >
                  <option value="">Sin grupo</option>
                  {grupos.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Descripción */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-white/60">
                  Descripción / Explicación
                </label>
                <textarea
                  value={form.descripcion}
                  onChange={(e) => setF("descripcion", e.target.value)}
                  placeholder="Técnica, ejecución, consideraciones..."
                  rows={3}
                  maxLength={FIELD_LIMITS.ejercicio_descripcion}
                  className="w-full resize-none rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-white/30"
                />
              </div>

              {/* Videos */}
              <div>
                <label className="mb-1.5 flex items-center justify-between text-xs font-medium text-white/60">
                  Videos
                  <span className="text-white/30">{form.videos.length}/{MAX_VIDEOS} · máx {MAX_VIDEO_MB} MB c/u</span>
                </label>
                <div className="space-y-2">
                  {/* Lista de videos agregados */}
                  {form.videos.length > 0 && (
                    <ul className="space-y-1.5">
                      {form.videos.map((url, idx) => {
                        const isDirect = /\.(mp4|mov|webm|ogg)(\?|$)/i.test(url) || url.includes("/storage/");
                        return (
                          <li key={idx} className="group overflow-hidden rounded-2xl border border-white/10 bg-white/3">
                            {isDirect ? (
                              <video src={url} controls className="w-full bg-black" style={{ maxHeight: 180 }} />
                            ) : (
                              <a
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-4 py-2.5 text-xs text-white/50 hover:text-white"
                              >
                                <Link2 className="h-3.5 w-3.5 shrink-0" />
                                <span className="truncate">{url}</span>
                              </a>
                            )}
                            <div className="flex justify-end px-3 py-1.5">
                              <button
                                onClick={() => pedirConfirm("¿Quitar video?", "Se quitará este video del ejercicio.", () => setForm((p) => ({ ...p, videos: p.videos.filter((_, i) => i !== idx) })))}
                                className="text-xs text-white/30 hover:text-red-400"
                              >
                                Eliminar
                              </button>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}

                  {form.videos.length < MAX_VIDEOS && (
                    <>
                      {/* URL input */}
                      <div className="flex gap-2">
                        <input
                          value={videoUrlInput}
                          onChange={(e) => setVideoUrlInput(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && agregarVideoUrl()}
                          placeholder="URL de YouTube u otro video... (Enter)"
                          maxLength={FIELD_LIMITS.url_length}
                          className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-white/30"
                        />
                        <button
                          type="button"
                          onClick={agregarVideoUrl}
                          className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs text-white/50 transition-colors hover:bg-white/10"
                        >
                          Agregar
                        </button>
                      </div>
                      {/* Upload */}
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => videoRef.current?.click()}
                          disabled={videoProgress !== null}
                          className="relative flex flex-1 items-center justify-center gap-2 overflow-hidden rounded-2xl border border-dashed border-white/15 py-2.5 text-xs text-white/40 transition-colors hover:border-white/30 hover:text-white/60 disabled:opacity-100"
                        >
                          {videoProgress !== null && (
                            <span className="absolute inset-y-0 left-0 bg-white/8 transition-all duration-150" style={{ width: `${videoProgress}%` }} />
                          )}
                          <Upload className="relative h-3.5 w-3.5" />
                          <span className="relative">
                            {videoProgress !== null ? `Subiendo... ${videoProgress}%` : "Subir archivo de video"}
                          </span>
                        </button>
                        {videoProgress !== null && (
                          <button
                            type="button"
                            onClick={() => videoXhrRef.current?.abort()}
                            className="flex items-center justify-center rounded-2xl border border-red-500/30 bg-red-500/10 px-3 text-red-400 transition-colors hover:bg-red-500/20"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </>
                  )}
                  <input ref={videoRef} type="file" accept="video/*" className="hidden"
                    onChange={(e) => e.target.files?.[0] && subirVideo(e.target.files[0])} />
                </div>
              </div>

              {/* Fotos */}
              <div>
                <label className="mb-1.5 flex items-center justify-between text-xs font-medium text-white/60">
                  Fotos
                  <span className="text-white/30">{form.fotos.length}/{MAX_FOTOS} · máx {MAX_FOTO_MB} MB c/u</span>
                </label>
                <div className="space-y-2">
                  {form.fotos.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {form.fotos.map((url, idx) => (
                        <div key={idx} className="group relative">
                          <img src={url} alt="" className="h-16 w-16 rounded-xl border border-white/10 object-cover" />
                          <button
                            onClick={() => pedirConfirm("¿Quitar foto?", "Se quitará esta foto del ejercicio.", () => setForm((p) => ({ ...p, fotos: p.fotos.filter((_, i) => i !== idx) })))}
                            className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white opacity-0 transition-opacity group-hover:opacity-100"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {form.fotos.length < MAX_FOTOS && (
                    <>
                      <div className="flex gap-2">
                        <input
                          value={fotoUrlInput}
                          onChange={(e) => setFotoUrlInput(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && agregarFotoUrl()}
                          placeholder="URL de imagen... (Enter para agregar)"
                          maxLength={FIELD_LIMITS.url_length}
                          className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-white/30"
                        />
                        <button
                          type="button"
                          onClick={agregarFotoUrl}
                          className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs text-white/50 transition-colors hover:bg-white/10"
                        >
                          Agregar
                        </button>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => fotoRef.current?.click()}
                          disabled={fotoProgress !== null}
                          className="relative flex flex-1 items-center justify-center gap-2 overflow-hidden rounded-2xl border border-dashed border-white/15 py-2.5 text-xs text-white/40 transition-colors hover:border-white/30 hover:text-white/60 disabled:opacity-100"
                        >
                          {fotoProgress !== null && (
                            <span className="absolute inset-y-0 left-0 bg-white/8 transition-all duration-150" style={{ width: `${fotoProgress}%` }} />
                          )}
                          <Upload className="relative h-3.5 w-3.5" />
                          <span className="relative">
                            {fotoProgress !== null ? `Subiendo... ${fotoProgress}%` : "Subir foto"}
                          </span>
                        </button>
                        {fotoProgress !== null && (
                          <button
                            type="button"
                            onClick={() => fotoXhrRef.current?.abort()}
                            className="flex items-center justify-center rounded-2xl border border-red-500/30 bg-red-500/10 px-3 text-red-400 transition-colors hover:bg-red-500/20"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </>
                  )}
                  <input ref={fotoRef} type="file" accept="image/*" className="hidden"
                    onChange={(e) => e.target.files?.[0] && subirFoto(e.target.files[0])} />
                </div>
              </div>

            </div>

            {/* Botones */}
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={cerrarModal}
                className="flex-1 rounded-2xl border border-white/10 py-3.5 text-sm font-medium text-white/50 transition-colors hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={guardarEjercicio}
                disabled={guardando}
                className="flex-1 rounded-2xl bg-white py-3.5 text-sm font-medium text-black transition-opacity disabled:opacity-50"
              >
                {guardando ? "Guardando..." : editando ? "Guardar cambios" : "Crear ejercicio"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL CONFIRMACIÓN ─────────────────────────────────────────────── */}
      {confirmModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setConfirmModal(null)}
          />
          <div className="relative z-10 w-full max-w-sm rounded-[2rem] border border-white/10 bg-[#0c0c0c] p-6 shadow-2xl">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10">
              <Trash2 className="h-5 w-5 text-red-400" />
            </div>
            <h3 className="mb-1.5 text-base font-medium text-white">
              {confirmModal.titulo}
            </h3>
            <p className="mb-6 text-sm leading-relaxed text-white/50">
              {confirmModal.descripcion}
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmModal(null)}
                className="flex-1 rounded-2xl border border-white/10 py-3 text-sm font-medium text-white/50 transition-colors hover:border-white/20 hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  confirmModal.onConfirm();
                  setConfirmModal(null);
                }}
                className="flex-1 rounded-2xl bg-red-500 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
