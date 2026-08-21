import { crearClienteAdmin } from "@/lib/supabase/admin";
import { crearClienteServidor } from "@/lib/supabase/server";
import { obtenerAjustes } from "@/lib/dominio/ajustes";
import { Tarjeta } from "@/components/ui/Tarjeta";
import { FormularioNuevoTest } from "@/components/test/FormularioNuevoTest";
import Link from "next/link";

export default async function PaginaNuevoTest() {
  const supabaseSesion = await crearClienteServidor();
  const {
    data: { user },
  } = await supabaseSesion.auth.getUser();
  if (!user) return null;

  const supabase = crearClienteAdmin();
  const [{ data: documentos }, ajustes] = await Promise.all([
    supabase
      .from("documentos")
      .select("id, nombre_archivo, oposicion")
      .eq("usuario_id", user.id)
      .eq("estado", "listo")
      .order("creado_en", { ascending: false }),
    obtenerAjustes(),
  ]);

  if (!documentos || documentos.length === 0) {
    return (
      <Tarjeta>
        <p className="text-sm text-[var(--color-texto-suave)]">
          Todavía no tienes ningún documento listo para generar un test.
        </p>
        <Link
          href="/documentos/nuevo"
          className="mt-3 inline-block rounded-xl bg-[var(--color-primario)] px-4 py-2.5 text-sm font-medium text-white"
        >
          Subir un PDF
        </Link>
      </Tarjeta>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Nuevo test</h1>
      <FormularioNuevoTest
        documentos={documentos}
        numPreguntasDefecto={ajustes.num_preguntas_defecto}
        dificultadDefecto={ajustes.dificultad_defecto}
      />
    </div>
  );
}
