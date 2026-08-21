"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Boton } from "@/components/ui/Boton";
import { Input, Select } from "@/components/ui/Input";
import { Tarjeta } from "@/components/ui/Tarjeta";
import { BLOQUES_POR_OPOSICION, NOMBRE_OPOSICION } from "@/lib/dominio/oposiciones";
import { crearClienteNavegador } from "@/lib/supabase/client";
import type { Oposicion } from "@/types/db";

const TAMANO_MAXIMO_BYTES = 30 * 1024 * 1024;

export default function PaginaNuevoDocumento() {
  const router = useRouter();
  const [oposicion, setOposicion] = useState<Oposicion>("guardia_civil");
  const [bloque, setBloque] = useState("");
  const [nombreTema, setNombreTema] = useState("");
  const [archivo, setArchivo] = useState<File | null>(null);
  const [declaracion, setDeclaracion] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);
  const [progreso, setProgreso] = useState<string | null>(null);

  async function alEnviar(evento: FormEvent) {
    evento.preventDefault();
    setError(null);

    if (!archivo) {
      setError("Selecciona un archivo PDF.");
      return;
    }
    if (archivo.type !== "application/pdf") {
      setError("El archivo debe ser un PDF.");
      return;
    }
    if (archivo.size > TAMANO_MAXIMO_BYTES) {
      setError("El PDF supera el límite de 30 MB.");
      return;
    }
    if (!declaracion) {
      setError("Debes declarar que tienes derecho a usar este material.");
      return;
    }

    setCargando(true);
    setProgreso("Subiendo tu PDF…");

    const supabase = crearClienteNavegador();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError("Tu sesión ha caducado. Vuelve a iniciar sesión.");
      setCargando(false);
      return;
    }

    const documentoId = crypto.randomUUID();
    const rutaAlmacenamiento = `${user.id}/${documentoId}.pdf`;

    const { error: errorSubida } = await supabase.storage
      .from("documentos")
      .upload(rutaAlmacenamiento, archivo, { contentType: "application/pdf", upsert: false });

    if (errorSubida) {
      setError("No se pudo subir el archivo. Inténtalo de nuevo.");
      setCargando(false);
      setProgreso(null);
      return;
    }

    setProgreso("Registrando el documento…");

    const respuesta = await fetch("/api/documentos/subir", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        documentoId,
        nombreArchivo: archivo.name,
        tamanoBytes: archivo.size,
        oposicion,
        nombreTema,
        bloque,
        declaracionDerechos: true,
      }),
    });
    const datos = await respuesta.json();
    setCargando(false);
    setProgreso(null);

    if (!respuesta.ok) {
      await supabase.storage.from("documentos").remove([rutaAlmacenamiento]);
      setError(datos.error ?? "No se pudo registrar el documento.");
      return;
    }

    router.push(`/documentos/${datos.documentoId}`);
  }

  return (
    <Tarjeta>
      <h1 className="text-xl font-semibold">Subir temario</h1>
      <p className="mt-1.5 text-sm text-[var(--color-texto-suave)]">PDF, máximo 30 MB.</p>

      <form className="mt-5 flex flex-col gap-4" onSubmit={alEnviar}>
        <Select
          id="oposicion"
          etiqueta="Oposición"
          value={oposicion}
          onChange={(e) => {
            setOposicion(e.target.value as Oposicion);
            setBloque("");
          }}
        >
          {Object.entries(NOMBRE_OPOSICION).map(([clave, nombre]) => (
            <option key={clave} value={clave}>
              {nombre}
            </option>
          ))}
        </Select>

        <Select
          id="bloque"
          etiqueta="Bloque del temario"
          value={bloque}
          onChange={(e) => setBloque(e.target.value)}
        >
          <option value="">Sin especificar</option>
          {BLOQUES_POR_OPOSICION[oposicion].map((b) => (
            <option key={b.clave} value={b.clave}>
              {b.nombre}
            </option>
          ))}
        </Select>

        <Input
          id="nombreTema"
          etiqueta="Nombre del tema"
          placeholder='Ej. "Tema 3 · La Constitución Española"'
          required
          value={nombreTema}
          onChange={(e) => setNombreTema(e.target.value)}
        />

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium">Archivo PDF</span>
          <input
            type="file"
            accept="application/pdf"
            required
            onChange={(e) => setArchivo(e.target.files?.[0] ?? null)}
            className="rounded-xl border border-[var(--color-borde)] bg-[var(--color-superficie)] px-3 py-3 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-[var(--color-primario-suave)] file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-[var(--color-primario)]"
          />
        </label>

        <label className="flex items-start gap-2.5 text-sm">
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4"
            checked={declaracion}
            onChange={(e) => setDeclaracion(e.target.checked)}
          />
          <span>
            Declaro que tengo derecho a usar este material (apuntes propios, material de mi academia o
            textos de dominio público).
          </span>
        </label>

        {error && <p className="text-sm text-[var(--color-error)]">{error}</p>}
        {progreso && <p className="text-sm text-[var(--color-texto-suave)]">{progreso}</p>}

        <Boton type="submit" cargando={cargando} className="w-full">
          Subir y procesar
        </Boton>
      </form>
    </Tarjeta>
  );
}
