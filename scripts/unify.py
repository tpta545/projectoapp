"""
Une las 44 páginas del build estático en un único archivo HTML autocontenido:
un solo <style> (CSS + fuentes en base64), un solo bloque de datos
estructurados Organization, y cada página como <section> navegable por ancla,
con sus propios JSON-LD (Breadcrumbs, FAQPage, Article, ItemList) intactos.
Es un documento de revisión, no un sustituto del sitio multipágina real.
"""
import base64
import glob
import html
import mimetypes
import os
import re

ROOT = "dist/client"
OUT = "trade-web-unificada.html"

# ---------------------------------------------------------------------------
# 1. Descubrir páginas y construir la tabla de rutas -> ancla
# ---------------------------------------------------------------------------


def ruta_de(path):
    rel = os.path.relpath(path, ROOT)
    if rel == "404.html":
        return "/404"
    rel_dir = os.path.dirname(rel)
    return "/" + (rel_dir + "/" if rel_dir else "")


def ancla_de(ruta):
    if ruta == "/":
        return "inicio"
    if ruta == "/404":
        return "404"
    return ruta.strip("/").replace("/", "-")


archivos = sorted(glob.glob(f"{ROOT}/**/*.html", recursive=True))
paginas = []
for path in archivos:
    ruta = ruta_de(path)
    paginas.append({"path": path, "ruta": ruta, "ancla": ancla_de(ruta)})

ruta_a_ancla = {p["ruta"]: f"pagina-{p['ancla']}" for p in paginas}

# ---------------------------------------------------------------------------
# 2. Categorías para el índice general
# ---------------------------------------------------------------------------


def categoria_de(ruta):
    primero = ruta.strip("/").split("/")[0] if ruta != "/" else "inicio"
    return {
        "inicio": "Inicio",
        "empresa": "Empresa",
        "productos": "Productos",
        "marcas": "Marcas",
        "servicios": "Servicios",
        "zonas": "Zonas",
        "blog": "Blog",
        "presupuesto": "Conversión",
        "contacto": "Conversión",
        "aviso-legal": "Legal",
        "politica-privacidad": "Legal",
        "politica-cookies": "Legal",
        "404": "Otras",
    }.get(primero, "Otras")


ORDEN_CATEGORIAS = ["Inicio", "Empresa", "Productos", "Marcas", "Servicios", "Zonas", "Blog", "Conversión", "Legal", "Otras"]

# ---------------------------------------------------------------------------
# 3. Utilidades de inlining
# ---------------------------------------------------------------------------

_cache_datauri = {}


def a_data_uri(path_relativo_a_root):
    if path_relativo_a_root in _cache_datauri:
        return _cache_datauri[path_relativo_a_root]
    disco = os.path.join(ROOT, path_relativo_a_root.lstrip("/"))
    if not os.path.exists(disco):
        return None
    mime, _ = mimetypes.guess_type(disco)
    mime = mime or "application/octet-stream"
    data = base64.b64encode(open(disco, "rb").read()).decode("ascii")
    uri = f"data:{mime};base64,{data}"
    _cache_datauri[path_relativo_a_root] = uri
    return uri


# ---------------------------------------------------------------------------
# 4. CSS combinado (una sola vez) con fuentes embebidas
# ---------------------------------------------------------------------------

css_path = glob.glob(f"{ROOT}/_astro/*.css")[0]
css = open(css_path, encoding="utf-8").read()


def inline_font(m):
    url = m.group(1)
    uri = a_data_uri(url)
    return f"url({uri})" if uri else m.group(0)


css = re.sub(r"url\((/_astro/[^)]+\.woff2?)\)", inline_font, css)

# ---------------------------------------------------------------------------
# 5. Extraer del homepage el <header> y el <footer>/whatsapp/cookies (chrome
#    compartido), y de cada página el contenido de <main id="contenido">.
# ---------------------------------------------------------------------------

home_html = open(f"{ROOT}/index.html", encoding="utf-8").read()

m_header = re.search(r"(<header class=\"sticky.*?</header>)", home_html, re.S)
header_html = m_header.group(1)

m_menu_script = re.search(r'(<script type="module">const e=document\.getElementById\("menu-toggle"\).*?</script>)', home_html, re.S)
menu_script = m_menu_script.group(1) if m_menu_script else ""

m_footer = re.search(r"(<footer class=\"border-t.*?</footer>)", home_html, re.S)
footer_html = m_footer.group(1)

m_whatsapp = re.search(r'(<a\s+href="https://wa\.me/.*?</a>)', home_html, re.S)
whatsapp_html = m_whatsapp.group(1) if m_whatsapp else ""

m_cookie_banner = re.search(r'(<div\s+id="cookie-banner".*?</div>\s*</div>\s*</div>)', home_html, re.S)
cookie_html = m_cookie_banner.group(1) if m_cookie_banner else ""

m_cookie_script = re.search(r'(<script type="module">const c="trade-consentimiento-cookies".*?</script>)', home_html, re.S)
cookie_script = m_cookie_script.group(1) if m_cookie_script else ""

m_org = re.search(r'(<script type="application/ld\+json"[^>]*>\{"@context":"https://schema\.org","@type":"LocalBusiness".*?</script>)', home_html, re.S)
org_jsonld = m_org.group(1) if m_org else ""

print("header:", bool(header_html), "footer:", bool(footer_html), "whatsapp:", bool(whatsapp_html))
print("cookie banner:", bool(cookie_html), "cookie script:", bool(cookie_script), "org jsonld:", bool(org_jsonld))
print("menu script:", bool(menu_script))


# ---------------------------------------------------------------------------
# 6. Reescritura de enlaces internos "/ruta/" -> "#ancla" en un fragmento dado
# ---------------------------------------------------------------------------

HREF_SRC_RE = re.compile(r'(href|src)="(/[^"#]*)"')


def reescribir_enlaces(fragmento):
    def repl(m):
        attr, val = m.group(1), m.group(2)
        ruta_sin_query = val.split("?")[0]
        if ruta_sin_query in ruta_a_ancla:
            # Se pierde la query (p. ej. ?familia=rodamientos) al no haber
            # navegación real entre documentos; el ancla sigue siendo útil.
            return f'{attr}="#{ruta_a_ancla[ruta_sin_query]}"'
        if val.startswith("/api/"):
            return m.group(0)  # Los formularios necesitan el servidor real.
        if val.startswith("/imagenes/") or val == "/favicon.svg":
            uri = a_data_uri(val)
            return f'{attr}="{uri}"' if uri else m.group(0)
        return m.group(0)  # /sitemap-index.xml, og-image, etc.: no aplica aquí.

    return HREF_SRC_RE.sub(repl, fragmento)


# ---------------------------------------------------------------------------
# 7. Extraer <main id="contenido">…</main> de cada página, renombrar sus ids
#    para que no colisionen entre páginas y envolverlas en <section>.
# ---------------------------------------------------------------------------

ID_RE = re.compile(r'\bid="([^"]+)"')
HASHREF_RE = re.compile(r'href="#([^"]+)"')
MAIN_RE = re.compile(r'<main id="contenido" class="flex-1">(.*?)</main>', re.S)
TITLE_RE = re.compile(r"<title>(.*?)</title>", re.S)

secciones = []
indice_por_categoria = {c: [] for c in ORDEN_CATEGORIAS}
ids_vistos = set()
colisiones = 0

for pagina in paginas:
    texto = open(pagina["path"], encoding="utf-8").read()
    m_title = TITLE_RE.search(texto)
    titulo = html.unescape(m_title.group(1)) if m_title else pagina["ruta"]

    m_main = MAIN_RE.search(texto)
    contenido = m_main.group(1) if m_main else "<p>(sin contenido extraído)</p>"

    ancla = pagina["ancla"]
    prefijo = f"{ancla}--"

    # Renombra ids locales (TOC de blog, etc.) para evitar colisiones.
    def repl_id(m, prefijo=prefijo):
        return f'id="{prefijo}{m.group(1)}"'

    contenido = ID_RE.sub(repl_id, contenido)

    # Los href="#algo" que apuntaban a un id local de la propia página deben
    # seguir el mismo renombrado; los que ya son rutas absolutas se tratan
    # aparte en reescribir_enlaces.
    def repl_hash(m, prefijo=prefijo):
        return f'href="#{prefijo}{m.group(1)}"'

    contenido = HASHREF_RE.sub(repl_hash, contenido)

    # Enlaces cruzados a otras páginas -> anclas; imágenes -> data URI.
    contenido = reescribir_enlaces(contenido)

    seccion_id = f"pagina-{ancla}"
    if seccion_id in ids_vistos:
        colisiones += 1
    ids_vistos.add(seccion_id)

    secciones.append(
        f'<section id="{seccion_id}" class="doc-seccion" data-ruta="{pagina["ruta"]}">'
        f'<div class="doc-barra"><code>{pagina["ruta"]}</code>'
        f'<a href="#indice-general" class="doc-volver">↑ Índice</a></div>'
        f"{contenido}"
        f"</section>"
    )

    indice_por_categoria[categoria_de(pagina["ruta"])].append(
        {"ruta": pagina["ruta"], "titulo": titulo, "id": seccion_id}
    )

print("Colisiones de id de sección:", colisiones)

# ---------------------------------------------------------------------------
# 8. Cabecera y pie compartidos: reescribir sus enlaces igual que el resto.
# ---------------------------------------------------------------------------

header_html = reescribir_enlaces(header_html)
footer_html = reescribir_enlaces(footer_html)
cookie_html = reescribir_enlaces(cookie_html)

favicon_uri = a_data_uri("/favicon.svg")

# ---------------------------------------------------------------------------
# 9. Índice general agrupado por sección de la arquitectura de información
# ---------------------------------------------------------------------------

bloques_indice = []
for cat in ORDEN_CATEGORIAS:
    items = indice_por_categoria[cat]
    if not items:
        continue
    lis = "".join(f'<li><a href="#{i["id"]}">{html.escape(i["titulo"])}</a> <code>{i["ruta"]}</code></li>' for i in items)
    bloques_indice.append(f"<div class='doc-indice-bloque'><h3>{cat}</h3><ul>{lis}</ul></div>")

indice_html = "".join(bloques_indice)

# ---------------------------------------------------------------------------
# 10. CSS extra solo para la maquetación del documento unificado (no toca
#     las clases Tailwind del sitio real).
# ---------------------------------------------------------------------------

css_documento = """
.doc-indice { background:#f4f3ef; border-bottom:3px solid #c81e1e; padding:2rem 1.5rem; }
.doc-indice h2 { font-family:'Big Shoulders',sans-serif; font-size:2rem; margin:0 0 1rem; }
.doc-indice-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(220px,1fr)); gap:1.5rem; }
.doc-indice-bloque h3 { font-family:'Big Shoulders',sans-serif; font-size:1.1rem; color:#c81e1e; margin:0 0 .5rem; text-transform:uppercase; letter-spacing:.03em; }
.doc-indice-bloque ul { list-style:none; margin:0; padding:0; font-size:.85rem; }
.doc-indice-bloque li { margin-bottom:.35rem; }
.doc-indice-bloque a { color:#14140f; text-decoration:none; font-weight:600; }
.doc-indice-bloque a:hover { color:#c81e1e; text-decoration:underline; }
.doc-indice-bloque code { display:block; color:#4a4a46; font-size:.7rem; }
.doc-seccion { border-bottom:8px solid #14140f; scroll-margin-top:1rem; }
.doc-barra { display:flex; justify-content:space-between; align-items:center; background:#14140f; color:#fff; padding:.5rem 1rem; font-family:'IBM Plex Mono',monospace; font-size:.75rem; }
.doc-barra code { color:#f4f3ef; }
.doc-volver { color:#fff; text-decoration:underline; }
"""

# ---------------------------------------------------------------------------
# 11. Ensamblado final
# ---------------------------------------------------------------------------

doc = f"""<!doctype html>
<html lang="es-ES">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>TRADE — Sitio completo unificado (documento de revisión)</title>
<meta name="robots" content="noindex,nofollow">
<link rel="icon" type="image/svg+xml" href="{favicon_uri}">
<style>{css}{css_documento}</style>
{org_jsonld}
</head>
<body class="flex min-h-screen flex-col font-sans text-negro">
{header_html}
<nav id="indice-general" class="doc-indice" aria-label="Índice de todas las páginas">
<h2>Índice — {len(paginas)} páginas unificadas en este documento</h2>
<div class="doc-indice-grid">{indice_html}</div>
</nav>
<main id="contenido" class="flex-1">
{''.join(secciones)}
</main>
{footer_html}
{whatsapp_html}
{cookie_html}
{menu_script}
{cookie_script}
</body>
</html>
"""

open(OUT, "w", encoding="utf-8").write(doc)
print("Escrito:", OUT, "-", os.path.getsize(OUT) / 1024 / 1024, "MB")
print("Páginas incluidas:", len(paginas))

