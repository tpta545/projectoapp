import Link from "next/link";
import { crearClienteAdmin } from "@/lib/supabase/admin";
import { crearClienteServidor } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/Badge";
import { Tarjeta } from "@/components/ui/Tarjeta";

function formatearFecha(fecha: string): string {
  return new Date(fecha).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });
}

export default async function PaginaHistorial() {
  const supabaseSesion = await crearClienteServidor();
  const {
    data: { user },
  } = await supabaseSesion.auth.getUser();
  if (!user) return null;

  const supabase = crearClienteAdmin();
  const { data: tests } = await supabase
    .from("tests")
    .select("id, num_preguntas, dificultad, estado, puntuacion, iniciado_en, finalizado_en, documentos(nombre_archivo)")
    .eq("usuario_id", user.id)
    .order("iniciado_en", { ascending: false });

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Historial de tests</h1>

      {tests && tests.length > 0 ? (
        <div className="flex flex-col gap-3">
          {tests.map((t) => {
            const documento = t.documentos as unknown as { nombre_archivo: string } | null;
            return (
              <Link key={t.id} href={t.estado === "finalizado" ? `/test/${t.id}/resultado` : `/test/${t.id}`}>
                <Tarjeta className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{documento?.nombre_archivo ?? "Documento"}</p>
                    <p className="text-xs text-[var(--color-texto-suave)]">
                      {t.num_preguntas} preguntas · {formatearFecha(t.iniciado_en)}
                    </p>
                  </div>
                  {t.estado === "finalizado" ? (
                    <Badge tono={((t.puntuacion ?? 0) >= 5 ? "exito" : "error")}>
                      {t.puntuacion?.toFixed(1)}/10
                    </Badge>
                  ) : (
                    <Badge tono="aviso">En curso</Badge>
                  )}
                </Tarjeta>
              </Link>
            );
          })}
        </div>
      ) : (
        <Tarjeta>
          <p className="text-sm text-[var(--color-texto-suave)]">Todavía no has hecho ningún test.</p>
        </Tarjeta>
      )}
    </div>
  );
}
