-- TESTARIO · Fase 1 — esquema inicial
-- Aplicar con: supabase db push  (o pegar en el SQL editor del proyecto Supabase)

create extension if not exists vector;

-- ─────────────────────────────────────────────────────────────────────────
-- PERFILES (extiende auth.users)
-- ─────────────────────────────────────────────────────────────────────────
create table perfiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  plan text not null default 'gratis' check (plan in ('gratis', 'premium')),
  creado_en timestamptz not null default now()
);

-- Crea automáticamente el perfil al registrarse un usuario en auth.users
create function public.gestionar_nuevo_usuario()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.perfiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.gestionar_nuevo_usuario();

-- Administradores del panel /admin (allowlist manual, sin rol especial en Supabase)
create table admins (
  usuario_id uuid primary key references perfiles (id) on delete cascade,
  creado_en timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────────────────
-- DOCUMENTOS
-- ─────────────────────────────────────────────────────────────────────────
create table documentos (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references perfiles (id) on delete cascade,
  oposicion text not null check (oposicion in ('guardia_civil', 'policia_nacional')),
  nombre_archivo text not null,
  storage_path text not null,
  tamano_bytes integer not null,
  num_paginas integer,
  estado text not null default 'subido' check (estado in ('subido', 'procesando', 'listo', 'error')),
  error_mensaje text,
  declaracion_derechos boolean not null,
  creado_en timestamptz not null default now(),
  procesado_en timestamptz
);

create index documentos_usuario_id_idx on documentos (usuario_id);

-- ─────────────────────────────────────────────────────────────────────────
-- TEMAS (agrupación del usuario dentro de un documento)
-- ─────────────────────────────────────────────────────────────────────────
create table temas (
  id uuid primary key default gen_random_uuid(),
  documento_id uuid not null references documentos (id) on delete cascade,
  nombre text not null,
  bloque text,
  orden integer not null default 0,
  creado_en timestamptz not null default now()
);

create index temas_documento_id_idx on temas (documento_id);

-- ─────────────────────────────────────────────────────────────────────────
-- FRAGMENTOS (troceado del PDF con solapamiento + embedding)
-- ─────────────────────────────────────────────────────────────────────────
create table fragmentos (
  id uuid primary key default gen_random_uuid(),
  documento_id uuid not null references documentos (id) on delete cascade,
  tema_id uuid references temas (id) on delete set null,
  contenido text not null,
  pagina_inicio integer,
  pagina_fin integer,
  orden integer not null,
  embedding vector(1536),
  creado_en timestamptz not null default now()
);

create index fragmentos_documento_id_idx on fragmentos (documento_id);
create index fragmentos_tema_id_idx on fragmentos (tema_id);
-- ivfflat requiere datos representativos; con pocos fragmentos Postgres usa scan secuencial igualmente.
create index fragmentos_embedding_idx on fragmentos using ivfflat (embedding vector_cosine_ops) with (lists = 100);

-- ─────────────────────────────────────────────────────────────────────────
-- PREGUNTAS
-- ─────────────────────────────────────────────────────────────────────────
create table preguntas (
  id uuid primary key default gen_random_uuid(),
  documento_id uuid not null references documentos (id) on delete cascade,
  fragmento_id uuid not null references fragmentos (id) on delete cascade,
  tema_id uuid references temas (id) on delete set null,
  oposicion text not null check (oposicion in ('guardia_civil', 'policia_nacional')),
  enunciado text not null,
  opciones jsonb not null,
  respuesta_correcta text not null check (respuesta_correcta in ('A', 'B', 'C', 'D')),
  explicacion text not null,
  dificultad text not null check (dificultad in ('facil', 'media', 'dificil')),
  estado text not null default 'borrador' check (estado in ('borrador', 'validada', 'publicada', 'impugnada', 'retirada')),
  embedding vector(1536),
  veces_servida integer not null default 0,
  veces_impugnada integer not null default 0,
  creado_en timestamptz not null default now()
);

create index preguntas_documento_id_idx on preguntas (documento_id);
create index preguntas_tema_id_idx on preguntas (tema_id);
create index preguntas_estado_idx on preguntas (estado);
create index preguntas_embedding_idx on preguntas using ivfflat (embedding vector_cosine_ops) with (lists = 100);

-- ─────────────────────────────────────────────────────────────────────────
-- VALIDACIONES (trazabilidad completa del pipeline)
-- ─────────────────────────────────────────────────────────────────────────
create table validaciones (
  id uuid primary key default gen_random_uuid(),
  pregunta_id uuid not null references preguntas (id) on delete cascade,
  capa integer not null check (capa in (0, 1, 2, 3)),
  veredicto text not null check (veredicto in ('aprobada', 'descartada')),
  motivo_descarte text,
  frase_citada text,
  puntuacion integer check (puntuacion between 1 and 5),
  creado_en timestamptz not null default now()
);

create index validaciones_pregunta_id_idx on validaciones (pregunta_id);
create index validaciones_capa_idx on validaciones (capa);

-- ─────────────────────────────────────────────────────────────────────────
-- IMPUGNACIONES (Capa 3 — retirada automática a las 3)
-- ─────────────────────────────────────────────────────────────────────────
create table impugnaciones (
  id uuid primary key default gen_random_uuid(),
  pregunta_id uuid not null references preguntas (id) on delete cascade,
  usuario_id uuid not null references perfiles (id) on delete cascade,
  motivo text not null,
  creado_en timestamptz not null default now(),
  unique (pregunta_id, usuario_id)
);

-- ─────────────────────────────────────────────────────────────────────────
-- TESTS (intentos) y TEST_PREGUNTAS (snapshot por intento)
-- ─────────────────────────────────────────────────────────────────────────
create table tests (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references perfiles (id) on delete cascade,
  documento_id uuid not null references documentos (id) on delete cascade,
  tema_id uuid references temas (id) on delete set null,
  oposicion text not null,
  num_preguntas integer not null check (num_preguntas in (10, 25, 50)),
  dificultad text not null check (dificultad in ('facil', 'media', 'dificil', 'mixta')),
  tiempo_limite_segundos integer,
  penalizacion_fraccion numeric not null default 0,
  estado text not null default 'en_curso' check (estado in ('en_curso', 'finalizado')),
  puntuacion numeric,
  iniciado_en timestamptz not null default now(),
  finalizado_en timestamptz
);

create index tests_usuario_id_idx on tests (usuario_id);

create table test_preguntas (
  id uuid primary key default gen_random_uuid(),
  test_id uuid not null references tests (id) on delete cascade,
  pregunta_id uuid not null references preguntas (id) on delete cascade,
  orden integer not null,
  opciones_mostradas jsonb not null,
  respuesta_usuario text check (respuesta_usuario in ('A', 'B', 'C', 'D')),
  es_correcta boolean,
  tiempo_respuesta_segundos integer
);

create index test_preguntas_test_id_idx on test_preguntas (test_id);
create index test_preguntas_pregunta_id_idx on test_preguntas (pregunta_id);

-- ─────────────────────────────────────────────────────────────────────────
-- TRABAJOS (cola simple de background jobs: procesar documento, colchón)
-- ─────────────────────────────────────────────────────────────────────────
create table trabajos (
  id uuid primary key default gen_random_uuid(),
  tipo text not null check (tipo in ('procesar_documento', 'pregenerar_colchon')),
  payload jsonb not null,
  estado text not null default 'pendiente' check (estado in ('pendiente', 'en_curso', 'completado', 'error')),
  intentos integer not null default 0,
  error_mensaje text,
  creado_en timestamptz not null default now(),
  procesado_en timestamptz
);

-- ─────────────────────────────────────────────────────────────────────────
-- AJUSTES_ADMIN (valores por defecto configurables, nunca hardcodeados)
-- ─────────────────────────────────────────────────────────────────────────
create table ajustes_admin (
  clave text primary key,
  valor jsonb not null,
  actualizado_en timestamptz not null default now()
);

insert into ajustes_admin (clave, valor) values
  ('num_preguntas_defecto', '25'),
  ('dificultad_defecto', '"media"'),
  ('tiempo_por_pregunta_segundos_defecto', '60'),
  ('penalizacion_fraccion_defecto', '0.33'),
  ('colchon_min_por_tema', '15'),
  ('factor_sobregeneracion', '1.6'),
  ('umbral_similitud_opciones', '0.90'),
  ('umbral_similitud_semantica_preguntas', '0.92'),
  ('puntuacion_minima_auditor', '4');

-- ─────────────────────────────────────────────────────────────────────────
-- LIMITES_PLAN (preparado para Fase 3, chequeo siempre en servidor)
-- ─────────────────────────────────────────────────────────────────────────
create table limites_plan (
  plan text primary key,
  documentos_max integer,
  preguntas_dia_max integer
);

insert into limites_plan (plan, documentos_max, preguntas_dia_max) values
  ('gratis', 1, 20),
  ('premium', null, null);

-- ─────────────────────────────────────────────────────────────────────────
-- RLS
-- ─────────────────────────────────────────────────────────────────────────
alter table perfiles enable row level security;
alter table documentos enable row level security;
alter table temas enable row level security;
alter table fragmentos enable row level security;
alter table preguntas enable row level security;
alter table validaciones enable row level security;
alter table impugnaciones enable row level security;
alter table tests enable row level security;
alter table test_preguntas enable row level security;
alter table admins enable row level security;

-- Tablas de uso exclusivo del servidor (sin políticas): con RLS activada y sin
-- ninguna policy, solo la service role key (que ignora RLS) puede leerlas o
-- escribirlas. anon/authenticated nunca deben acceder a ellas directamente.
alter table trabajos enable row level security;
alter table ajustes_admin enable row level security;
alter table limites_plan enable row level security;

create policy "perfiles: ver el propio" on perfiles for select using (auth.uid() = id);
create policy "perfiles: actualizar el propio" on perfiles for update using (auth.uid() = id);

create policy "documentos: solo el dueño" on documentos for all
  using (auth.uid() = usuario_id) with check (auth.uid() = usuario_id);

create policy "temas: solo el dueño del documento" on temas for all
  using (exists (select 1 from documentos d where d.id = temas.documento_id and d.usuario_id = auth.uid()))
  with check (exists (select 1 from documentos d where d.id = temas.documento_id and d.usuario_id = auth.uid()));

create policy "fragmentos: solo el dueño del documento" on fragmentos for all
  using (exists (select 1 from documentos d where d.id = fragmentos.documento_id and d.usuario_id = auth.uid()))
  with check (exists (select 1 from documentos d where d.id = fragmentos.documento_id and d.usuario_id = auth.uid()));

create policy "preguntas: solo el dueño del documento" on preguntas for all
  using (exists (select 1 from documentos d where d.id = preguntas.documento_id and d.usuario_id = auth.uid()))
  with check (exists (select 1 from documentos d where d.id = preguntas.documento_id and d.usuario_id = auth.uid()));

create policy "validaciones: solo el dueño de la pregunta" on validaciones for select
  using (exists (
    select 1 from preguntas p join documentos d on d.id = p.documento_id
    where p.id = validaciones.pregunta_id and d.usuario_id = auth.uid()
  ));

create policy "impugnaciones: el propio usuario" on impugnaciones for all
  using (auth.uid() = usuario_id) with check (auth.uid() = usuario_id);

create policy "tests: solo el dueño" on tests for all
  using (auth.uid() = usuario_id) with check (auth.uid() = usuario_id);

create policy "test_preguntas: solo vía el test propio" on test_preguntas for all
  using (exists (select 1 from tests t where t.id = test_preguntas.test_id and t.usuario_id = auth.uid()))
  with check (exists (select 1 from tests t where t.id = test_preguntas.test_id and t.usuario_id = auth.uid()));

create policy "admins: solo lectura de si mismo" on admins for select using (auth.uid() = usuario_id);

-- ─────────────────────────────────────────────────────────────────────────
-- FUNCIONES RPC
-- ─────────────────────────────────────────────────────────────────────────

-- Recuperación semántica de fragmentos para generar preguntas
create function match_fragmentos(
  p_documento_id uuid,
  p_embedding vector(1536),
  p_match_count int,
  p_tema_id uuid default null
)
returns table (
  id uuid,
  contenido text,
  pagina_inicio int,
  pagina_fin int,
  tema_id uuid,
  similitud float
)
language sql stable as $$
  select f.id, f.contenido, f.pagina_inicio, f.pagina_fin, f.tema_id,
         1 - (f.embedding <=> p_embedding) as similitud
  from fragmentos f
  where f.documento_id = p_documento_id
    and (p_tema_id is null or f.tema_id = p_tema_id)
  order by f.embedding <=> p_embedding
  limit p_match_count;
$$;

-- Detección de preguntas semánticamente duplicadas ya servidas (Capa 0)
create function preguntas_similares_embedding(
  p_documento_id uuid,
  p_embedding vector(1536),
  p_umbral float
)
returns table (id uuid, enunciado text, similitud float)
language sql stable as $$
  select p.id, p.enunciado, 1 - (p.embedding <=> p_embedding) as similitud
  from preguntas p
  where p.documento_id = p_documento_id
    and p.estado in ('validada', 'publicada')
    and 1 - (p.embedding <=> p_embedding) > p_umbral;
$$;

-- Métricas del panel /admin: tasa de descarte por capa y por documento (solo admins)
create function admin_metricas()
returns jsonb
language plpgsql
security definer set search_path = public
as $$
declare
  resultado jsonb;
begin
  if not exists (select 1 from admins where usuario_id = auth.uid()) then
    raise exception 'no autorizado';
  end if;

  select jsonb_build_object(
    'por_capa', (
      select coalesce(jsonb_agg(fila), '[]'::jsonb) from (
        select capa,
               count(*) filter (where veredicto = 'descartada') as descartadas,
               count(*) as total,
               round(
                 (count(*) filter (where veredicto = 'descartada'))::numeric
                 / greatest(count(*), 1) * 100, 1
               ) as tasa_descarte
        from validaciones
        group by capa
        order by capa
      ) fila
    ),
    'por_documento', (
      select coalesce(jsonb_agg(fila), '[]'::jsonb) from (
        select d.id as documento_id, d.nombre_archivo,
               count(v.*) filter (where v.veredicto = 'descartada') as descartadas,
               count(v.*) as total,
               round(
                 (count(v.*) filter (where v.veredicto = 'descartada'))::numeric
                 / greatest(count(v.*), 1) * 100, 1
               ) as tasa_descarte
        from documentos d
        join preguntas p on p.documento_id = d.id
        join validaciones v on v.pregunta_id = p.id
        group by d.id, d.nombre_archivo
        order by tasa_descarte desc
      ) fila
    ),
    'preguntas_por_estado', (
      select coalesce(jsonb_object_agg(estado, total), '{}'::jsonb) from (
        select estado, count(*) as total from preguntas group by estado
      ) fila
    )
  ) into resultado;

  return resultado;
end;
$$;

-- admin_metricas se llama con la sesión del usuario (no con la service role) para
-- que auth.uid() resuelva correctamente dentro de la función SECURITY DEFINER.
grant execute on function admin_metricas() to authenticated;
