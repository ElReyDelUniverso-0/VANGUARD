# VANGUARD — UN SOLO UNIVERSO (misión de transformación continua)

> IA de diseño · ciclo 1 (2026-11-14) y v404.1 (2026-11-16). Solo hechos medidos.

## 1. ¿Cuántas «versiones» de Vanguard existen?
No hay códigos distintos: **3 proyectos Vercel despliegan el mismo repo y la misma rama `main`**, más una copia antigua
en GitHub Pages (`elreydeluniverso-0.github.io/VANGUARD`, rama `gh-pages`, páginas sueltas de 2026-09).

| Proyecto | Dirección | Variables | Papel desde v404.1 |
|---|---|---|---|
| vanguard-kq9r | vanguard-kq9r.vercel.app | DATABASE_URL, NEXT_PUBLIC_REALTIME_URL | **LA CASA** |
| vanguard | vanguard-chi-puce.vercel.app | DATABASE_URL | 308 → kq9r (`redireccion-casa/`) |
| vanguard-u6b9 | vanguard-u6b9.vercel.app | ninguna | 308 → kq9r (`redireccion-casa/`) |

Pendiente del Dueño: Vercel → esos dos proyectos → Settings → Git → Disconnect (el conector no expone esa acción;
`ignoreCommand` no ahorra cuota: un build cancelado también cuenta).

## 2. Por qué Google no indexaba (medido 2026-11-16, como Googlebot)
- `kq9r/sitemap.xml`: 2.087 URL, **las 2.087 en u6b9**. robots.txt (estático) apuntaba a kq9r.
- Canonical: portada, `/modulo/*` y `/noticia/*` → u6b9; 41 salas (`/historia`, `/armeria`, `/atlas`…) → kq9r.
- Los tres hosts servían 200 con el mismo HTML ⇒ contenido triplicado y señales cruzadas.
- El contenido NO es el problema: las salas sirven 1.300–4.100 palabras en el HTML, `index, follow`.
- Búsqueda web del dominio: solo aparecen issues de GitHub que lo mencionan.
**v404.1:** un host en todo + 308 de los otros dos + robots dinámico + IndexNow.
**Falta (Dueño):** Google Search Console (propiedad de prefijo URL `https://vanguard-kq9r.vercel.app/`, verificación
por etiqueta HTML → pasar el código a la IA para `metadata.verification.google`) y enviar el sitemap.

## 3. Registros de rutas
ia3 v403.8 unificó salas/buscador en `mapa-salas.ts` (generado de `tab-nav.tsx`). Siguen a mano: `catalogo-real`,
`nucleo/registro`, `agente/maestro`, `mundos`. → B-35.

## 4. Próximos pasos
1. Search Console (Dueño) · 2. Desconectar Git de los 2 proyectos (Dueño) · 3. Decidir qué hacer con GitHub Pages
(redirigir a la casa) · 4. Enlazado interno entre salas relacionadas · 5. B-10 /en-vivo ligero.
