"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Boton } from "@/components/ui/Boton";
import { Badge } from "@/components/ui/Badge";
import { Tarjeta } from "@/components/ui/Tarjeta";
import { Spinner } from "@/components/ui/Spinner";

interface EstadoRespuesta {
  estado: "subido" | "procesando" | "listo" | "error";
  errorMensaje: string | null;
  numPaginas: number | null;
  numFragmentos: number;
  numPreguntasValidadas: number;
}

export function EstadoDocumento({ documentoId, estadoInicial }: { documentoId: string; estadoInicial: EstadoRespuesta }) {
  const router = useRouter();
  const [estado, setEstado] = useState<EstadoRespuesta>(estadoInicial);
  const [reintentando, setReintentando] = useState(false);
  const [borrando, setBorrando] = useState(false);

  useEffect(() => {
    if (estado.estado === "listo" || estado.estado === "error") return;

    const intervalo = setInterval(async () => {
      const respuesta = await fetch(`/api/documentos/${documentoId}/estado`);
      if (respuesta.ok) {
        const datos = await respuesta.json();
        setEstado(datos);
        if (datos.estado === "listo" || datos.estado === "error") router.refresh();
      }
    }, 2500);

    return () => clearInterval(intervalo);
  }, [estado.estado, documentoId, router]);

  async function reintentar() {
    setReintentando(true);
    await fetch(`/api/documentos/${documentoId}/procesar`, { method: "POST" });
    setEstado((prev) => ({ ...prev, estado: "procesando", errorMensaje: null }));
    setReintentando(false);
  }

  async function borrar() {
    if (!confirm("¿Seguro que quieres borrar este documento y todas sus preguntas y tests?")) return;
    setBorrando(true);
    await fetch(`/api/documentos/${documentoId}`, { method: "DELETE" });
    router.push("/documentos");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4">
      <Tarjeta>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Estado del procesado</span>
          <BadgeEstado estado={estado.estado} />
        </div>

        {(estado.estado === "subido" || estado.estado === "procesando") && (
          <div className="mt-4 flex items-center gap-3 text-sm text-[var(--color-texto-suave)]">
            <Spinner className="h-5 w-5 text-[var(--color-primario)]" />
            <span>
              Extrayendo texto y preparando preguntas
              {estado.numFragmentos > 0 ? ` · ${estado.numFragmentos} fragmentos` : "…"}
              {estado.numPreguntasValidadas > 0 ? ` · ${estado.numPreguntasValidadas} preguntas listas` : ""}
            </span>
          </div>
        )}

        {estado.estado === "error" && (
          <div className="mt-4">
            <p className="text-sm text-[var(--color-error)]">{estado.errorMensaje}</p>
            <Boton variante="secundario" cargando={reintentando} onClick={reintentar} className="mt-3">
              Reintentar
            </Boton>
          </div>
        )}

        {estado.estado === "listo" && (
          <div className="mt-4 flex flex-col gap-3">
            <p className="text-sm text-[var(--color-texto-suave)]">
              {estado.numPaginas} páginas · {estado.numFragmentos} fragmentos · {estado.numPreguntasValidadas}{" "}
              preguntas ya validadas y listas para servirse al instante.
            </p>
            <Link
              href="/test/nuevo"
              className="rounded-xl bg-[var(--color-primario)] px-4 py-3 text-center text-sm font-medium text-white"
            >
              Generar test de este documento
            </Link>
          </div>
        )}
      </Tarjeta>

      <Boton variante="peligro" cargando={borrando} onClick={borrar}>
        Borrar documento
      </Boton>
    </div>
  );
}

function BadgeEstado({ estado }: { estado: EstadoRespuesta["estado"] }) {
  if (estado === "listo") return <Badge tono="exito">Listo</Badge>;
  if (estado === "error") return <Badge tono="error">Error</Badge>;
  return <Badge tono="aviso">Procesando</Badge>;
}
