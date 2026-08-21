import { redirect } from "next/navigation";
import { crearClienteServidor } from "@/lib/supabase/server";
import { esAdmin } from "@/lib/auth/esAdmin";
import { obtenerAjustes } from "@/lib/dominio/ajustes";
import { Tarjeta } from "@/components/ui/Tarjeta";
import { Badge } from "@/components/ui/Badge";
import { FormularioAjustes } from "@/components/admin/FormularioAjustes";

export default async function PaginaAdmin() {
  const supabase = await crearClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  if (!(await esAdmin(user.id))) redirect("/panel");

  const [{ data: metricas }, ajustes] = await Promise.all([
    supabase.rpc("admin_metricas", {}),
    obtenerAjustes(),
  ]);

  const porCapa = metricas?.por_capa ?? [];
  const porDocumento = metricas?.por_documento ?? [];
  const porEstado = metricas?.preguntas_por_estado ?? {};

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-8">
      <h1 className="text-xl font-semibold">Panel de administración</h1>

      <section>
        <h2 className="mb-2 text-sm font-semibold text-[var(--color-texto-suave)]">
          Preguntas por estado
        </h2>
        <div className="flex flex-wrap gap-2">
          {Object.entries(porEstado).map(([estado, total]) => (
            <Badge key={estado} tono="neutro">
              {estado}: {total as number}
            </Badge>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold text-[var(--color-texto-suave)]">
          Tasa de descarte por capa
        </h2>
        <Tarjeta className="overflow-x-auto p-0">
          <table className="w-full min-w-[420px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--color-borde)] text-[var(--color-texto-suave)]">
                <th className="px-4 py-2.5 font-medium">Capa</th>
                <th className="px-4 py-2.5 font-medium">Descartadas</th>
                <th className="px-4 py-2.5 font-medium">Total</th>
                <th className="px-4 py-2.5 font-medium">Tasa de descarte</th>
              </tr>
            </thead>
            <tbody>
              {porCapa.map((fila: { capa: number; descartadas: number; total: number; tasa_descarte: number }) => (
                <tr key={fila.capa} className="border-b border-[var(--color-borde)] last:border-0">
                  <td className="px-4 py-2.5">{fila.capa === 0 ? "0 · determinista" : fila.capa === 1 ? "1 · verificador ciego" : fila.capa === 2 ? "2 · auditor" : "3 · impugnación"}</td>
                  <td className="px-4 py-2.5">{fila.descartadas}</td>
                  <td className="px-4 py-2.5">{fila.total}</td>
                  <td className="px-4 py-2.5">{fila.tasa_descarte}%</td>
                </tr>
              ))}
              {porCapa.length === 0 && (
                <tr>
                  <td className="px-4 py-3 text-[var(--color-texto-suave)]" colSpan={4}>
                    Todavía no hay validaciones registradas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Tarjeta>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold text-[var(--color-texto-suave)]">
          Tasa de descarte por documento
        </h2>
        <Tarjeta className="overflow-x-auto p-0">
          <table className="w-full min-w-[420px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--color-borde)] text-[var(--color-texto-suave)]">
                <th className="px-4 py-2.5 font-medium">Documento</th>
                <th className="px-4 py-2.5 font-medium">Descartadas</th>
                <th className="px-4 py-2.5 font-medium">Total</th>
                <th className="px-4 py-2.5 font-medium">Tasa</th>
              </tr>
            </thead>
            <tbody>
              {porDocumento.map(
                (fila: {
                  documento_id: string;
                  nombre_archivo: string;
                  descartadas: number;
                  total: number;
                  tasa_descarte: number;
                }) => (
                  <tr key={fila.documento_id} className="border-b border-[var(--color-borde)] last:border-0">
                    <td className="max-w-[160px] truncate px-4 py-2.5">{fila.nombre_archivo}</td>
                    <td className="px-4 py-2.5">{fila.descartadas}</td>
                    <td className="px-4 py-2.5">{fila.total}</td>
                    <td className="px-4 py-2.5">{fila.tasa_descarte}%</td>
                  </tr>
                )
              )}
              {porDocumento.length === 0 && (
                <tr>
                  <td className="px-4 py-3 text-[var(--color-texto-suave)]" colSpan={4}>
                    Todavía no hay documentos con preguntas generadas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Tarjeta>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold text-[var(--color-texto-suave)]">
          Ajustes por defecto
        </h2>
        <FormularioAjustes ajustes={ajustes} />
      </section>
    </div>
  );
}
