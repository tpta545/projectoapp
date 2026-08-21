import Link from "next/link";
import { crearClienteAdmin } from "@/lib/supabase/admin";
import { crearClienteServidor } from "@/lib/supabase/server";
import { Tarjeta } from "@/components/ui/Tarjeta";
import { Badge } from "@/components/ui/Badge";
import { NOMBRE_OPOSICION } from "@/lib/dominio/oposiciones";

export default async function PaginaPanel() {
  const supabaseSesion = await crearClienteServidor();
  const {
    data: { user },
  } = await supabaseSesion.auth.getUser();
  if (!user) return null;

  const supabase = crearClienteAdmin();

  const [{ data: perfil }, { data: documentos }, { data: ultimosTests }] = await Promise.all([
    supabase.from("perfiles").select("plan").eq("id", user.id).single(),
    supabase
      .from("documentos")
      .select("id, nombre_archivo, oposicion, estado, creado_en")
      .eq("usuario_id", user.id)
      .order("creado_en", { ascending: false }),
    supabase
      .from("tests")
      .select("id, puntuacion, num_preguntas, estado, finalizado_en, documento_id")
      .eq("usuario_id", user.id)
      .order("iniciado_en", { ascending: false })
      .limit(3),
  ]);

  const documentosListos = (documentos ?? []).filter((d) => d.estado === "listo");

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-semibold">Hola de nuevo</h1>
        <p className="mt-1 text-sm text-[var(--color-texto-suave)]">
          Plan{" "}
          <Badge tono={perfil?.plan === "premium" ? "primario" : "neutro"}>
            {perfil?.plan === "premium" ? "Premium" : "Gratis"}
          </Badge>
        </p>
      </div>

      {documentosListos.length > 0 ? (
        <Link
          href="/test/nuevo"
          className="rounded-2xl bg-[var(--color-primario)] px-4 py-4 text-center font-medium text-white"
        >
          Generar un test nuevo
        </Link>
      ) : (
        <Link
          href="/documentos/nuevo"
          className="rounded-2xl bg-[var(--color-primario)] px-4 py-4 text-center font-medium text-white"
        >
          Sube tu primer temario
        </Link>
      )}

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[var(--color-texto-suave)]">Tu temario</h2>
          <Link href="/documentos" className="text-sm font-medium text-[var(--color-primario)]">
            Ver todo
          </Link>
        </div>
        {documentos && documentos.length > 0 ? (
          <div className="flex flex-col gap-2">
            {documentos.slice(0, 3).map((d) => (
              <Tarjeta key={d.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{d.nombre_archivo}</p>
                  <p className="text-xs text-[var(--color-texto-suave)]">{NOMBRE_OPOSICION[d.oposicion]}</p>
                </div>
                <EstadoDocumentoBadge estado={d.estado} />
              </Tarjeta>
            ))}
          </div>
        ) : (
          <Tarjeta>
            <p className="text-sm text-[var(--color-texto-suave)]">Todavía no has subido ningún documento.</p>
          </Tarjeta>
        )}
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold text-[var(--color-texto-suave)]">Últimos tests</h2>
        {ultimosTests && ultimosTests.length > 0 ? (
          <div className="flex flex-col gap-2">
            {ultimosTests.map((t) => (
              <Tarjeta key={t.id} className="flex items-center justify-between">
                <span className="text-sm">{t.num_preguntas} preguntas</span>
                {t.estado === "finalizado" ? (
                  <Link
                    href={`/test/${t.id}/resultado`}
                    className="text-sm font-medium text-[var(--color-primario)]"
                  >
                    {t.puntuacion?.toFixed(1)}/10 · ver
                  </Link>
                ) : (
                  <Link href={`/test/${t.id}`} className="text-sm font-medium text-[var(--color-primario)]">
                    Continuar
                  </Link>
                )}
              </Tarjeta>
            ))}
          </div>
        ) : (
          <Tarjeta>
            <p className="text-sm text-[var(--color-texto-suave)]">Todavía no has hecho ningún test.</p>
          </Tarjeta>
        )}
      </section>
    </div>
  );
}

function EstadoDocumentoBadge({ estado }: { estado: string }) {
  if (estado === "listo") return <Badge tono="exito">Listo</Badge>;
  if (estado === "error") return <Badge tono="error">Error</Badge>;
  return <Badge tono="aviso">Procesando</Badge>;
}
