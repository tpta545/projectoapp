import Link from "next/link";
import { crearClienteAdmin } from "@/lib/supabase/admin";
import { crearClienteServidor } from "@/lib/supabase/server";
import { Tarjeta } from "@/components/ui/Tarjeta";
import { Badge } from "@/components/ui/Badge";
import { NOMBRE_OPOSICION } from "@/lib/dominio/oposiciones";

const ETIQUETA_ESTADO: Record<string, { texto: string; tono: "exito" | "error" | "aviso" }> = {
  listo: { texto: "Listo", tono: "exito" },
  error: { texto: "Error", tono: "error" },
  procesando: { texto: "Procesando…", tono: "aviso" },
  subido: { texto: "En cola…", tono: "aviso" },
};

export default async function PaginaDocumentos() {
  const supabaseSesion = await crearClienteServidor();
  const {
    data: { user },
  } = await supabaseSesion.auth.getUser();
  if (!user) return null;

  const supabase = crearClienteAdmin();
  const { data: documentos } = await supabase
    .from("documentos")
    .select("id, nombre_archivo, oposicion, estado, num_paginas, creado_en")
    .eq("usuario_id", user.id)
    .order("creado_en", { ascending: false });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Tu temario</h1>
        <Link href="/documentos/nuevo" className="text-sm font-medium text-[var(--color-primario)]">
          + Subir PDF
        </Link>
      </div>

      {documentos && documentos.length > 0 ? (
        <div className="flex flex-col gap-3">
          {documentos.map((d) => {
            const estado = ETIQUETA_ESTADO[d.estado] ?? ETIQUETA_ESTADO.subido!;
            return (
              <Link key={d.id} href={`/documentos/${d.id}`}>
                <Tarjeta className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{d.nombre_archivo}</p>
                    <p className="text-xs text-[var(--color-texto-suave)]">
                      {NOMBRE_OPOSICION[d.oposicion]}
                      {d.num_paginas ? ` · ${d.num_paginas} pág.` : ""}
                    </p>
                  </div>
                  <Badge tono={estado.tono}>{estado.texto}</Badge>
                </Tarjeta>
              </Link>
            );
          })}
        </div>
      ) : (
        <Tarjeta>
          <p className="text-sm text-[var(--color-texto-suave)]">
            Todavía no has subido ningún documento. Sube tu primer PDF para empezar a generar tests.
          </p>
          <Link
            href="/documentos/nuevo"
            className="mt-3 inline-block rounded-xl bg-[var(--color-primario)] px-4 py-2.5 text-sm font-medium text-white"
          >
            Subir mi primer PDF
          </Link>
        </Tarjeta>
      )}
    </div>
  );
}
