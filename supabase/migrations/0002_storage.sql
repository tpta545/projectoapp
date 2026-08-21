-- TESTARIO · Storage privado de PDFs
-- Convención de ruta: {usuario_id}/{documento_id}.pdf

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('documentos', 'documentos', false, 31457280, array['application/pdf']) -- 30 MB
on conflict (id) do nothing;

create policy "documentos storage: solo el dueño puede subir"
  on storage.objects for insert
  with check (
    bucket_id = 'documentos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "documentos storage: solo el dueño puede leer"
  on storage.objects for select
  using (
    bucket_id = 'documentos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "documentos storage: solo el dueño puede borrar"
  on storage.objects for delete
  using (
    bucket_id = 'documentos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
