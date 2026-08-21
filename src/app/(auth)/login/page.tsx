"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, type FormEvent } from "react";
import { Boton } from "@/components/ui/Boton";
import { Input } from "@/components/ui/Input";
import { Tarjeta } from "@/components/ui/Tarjeta";
import { crearClienteNavegador } from "@/lib/supabase/client";

function FormularioLogin() {
  const router = useRouter();
  const parametros = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  async function alEnviar(evento: FormEvent) {
    evento.preventDefault();
    setError(null);
    setCargando(true);

    const supabase = crearClienteNavegador();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setCargando(false);
    if (error) {
      setError(
        error.message.includes("Invalid login")
          ? "Correo o contraseña incorrectos."
          : "No se pudo iniciar sesión. Inténtalo de nuevo."
      );
      return;
    }

    router.push(parametros.get("redirigir") || "/panel");
    router.refresh();
  }

  return (
    <Tarjeta>
      <h1 className="text-xl font-semibold">Entrar</h1>
      <form className="mt-5 flex flex-col gap-4" onSubmit={alEnviar}>
        <Input
          id="email"
          type="email"
          etiqueta="Correo electrónico"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          id="password"
          type="password"
          etiqueta="Contraseña"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="text-sm text-[var(--color-error)]">{error}</p>}
        <Boton type="submit" cargando={cargando} className="w-full">
          Entrar
        </Boton>
      </form>
      <p className="mt-5 text-center text-sm text-[var(--color-texto-suave)]">
        ¿Todavía no tienes cuenta?{" "}
        <Link href="/registro" className="font-medium text-[var(--color-primario)]">
          Regístrate gratis
        </Link>
      </p>
    </Tarjeta>
  );
}

export default function PaginaLogin() {
  return (
    <Suspense>
      <FormularioLogin />
    </Suspense>
  );
}
