export function categoriaASlug(categoria: string): string {
  return categoria
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/\s+/g, '-');
}
