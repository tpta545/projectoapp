"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Boton } from "@/components/ui/Boton";
import { Input } from "@/components/ui/Input";
import { Tarjeta } from "@/components/ui/Tarjeta";
import { crearClienteNavegador } from "@/lib/supabase/client";

export default function PaginaRegistro() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  async function alEnviar(evento: FormEvent) {
    evento.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    setCargando(true);
    const supabase = crearClienteNavegador();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setCargando(false);

    if (error) {
      setError(
        error.message.includes("already registered")
          ? "Ya existe una cuenta con ese correo."
          : "No se pudo completar el registro. Inténtalo de nuevo."
      );
      return;
    }

    setEnviado(true);
  }

  if (enviado) {
    return (
      <Tarjeta>
        <h1 className="text-xl font-semibold">Revisa tu correo</h1>
        <p className="mt-3 text-sm text-[var(--color-texto-suave)]">
          Te hemos enviado un enlace de confirmación a <strong>{email}</strong>. Ábrelo para activar tu
          cuenta y empezar a subir tu temario.
        </p>
      </Tarjeta>
    );
  }

  return (
    <Tarjeta>
      <h1 className="text-xl font-semibold">Crea tu cuenta</h1>
      <p className="mt-1.5 text-sm text-[var(--color-texto-suave)]">
        Gratis: 1 documento y 20 preguntas al día. Sin tarjeta.
      </p>
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
          autoComplete="new-password"
          minLength={8}
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="text-sm text-[var(--color-error)]">{error}</p>}
        <Boton type="submit" cargando={cargando} className="w-full">
          Crear cuenta
        </Boton>
      </form>
      <p className="mt-5 text-center text-sm text-[var(--color-texto-suave)]">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="font-medium text-[var(--color-primario)]">
          Entra
        </Link>
      </p>
    </Tarjeta>
  );
}
