# VANGUARD — PRUEBAS

> Lo mínimo antes de publicar en `main` (que despliega a producción). Si algo falla: investigar, arreglar,
> repetir; si no se puede arreglar con seguridad, revertir.

## 1. Tipos (tsc)

El build de Vercel corre `prisma generate && tsc --noEmit && next build --webpack`.
Un `tsc` completo necesita más de 2 GB de RAM; en entornos pequeños usa un **tsc acotado**:

```bash
# archivos cambiados desde el último commit publicado + quienes los importan
python3 - <<'EOF'
import json,subprocess,os,re
base="origin/main"
ch=subprocess.check_output(f"git diff --name-only --diff-filter=AM {base} | grep -E '\\.(ts|tsx)$'",shell=True,text=True).split()
mods={'@/'+re.sub(r'\.(ts|tsx)$','',f[4:]) for f in ch if f.startswith('src/')}
dep={os.path.join(r,x) for r,_,fs in os.walk('src') for x in fs if x.endswith(('.ts','.tsx'))
     and any(f'"{m}"' in open(os.path.join(r,x),errors='ignore').read() for m in mods)}
todo=sorted(set(ch)|dep|{"src/lib/bitacora.ts","src/lib/version.ts"})   # ¡siempre estos dos!
json.dump({"extends":"./tsconfig.json","compilerOptions":{"noEmit":True,"incremental":False},
           "include":["next-env.d.ts"]+todo},open("tsconfig.sub.json","w"))
EOF
NODE_OPTIONS=--max-old-space-size=1600 npx tsc -p tsconfig.sub.json
```
`tsconfig.sub.json` **no se versiona**.

## 2. Lint

```bash
npx eslint <archivos cambiados>
```
Hay 3 errores previos conocidos (`set-state-in-effect` en hace.tsx, historias.tsx, reloj.tsx; backlog B-02).
No añadir nuevos.

## 3. Servidor local

```bash
NODE_OPTIONS=--max-old-space-size=1300 npx next dev -H 0.0.0.0 -p 3000
```
Comprobar con `curl` el código HTTP de las rutas tocadas. `/cuartel` es demasiado pesado para compilar con 2 GB:
pruébalo en producción.

## 4. Visual móvil

Capturas Playwright a 390×844 (`device_scale_factor=2, is_mobile=True`) de cada pantalla tocada, y escritorio
a 1440×900. Para la cabecera: medir `scrollWidth` vs `clientWidth` de `.vx-nav` a 1024/1280/1440/1920.
**No borres `#vg-cortina` del DOM antes de hidratar**: provoca un falso error de hidratación.

## 5. Tras publicar

```bash
# estado del despliegue en Vercel (vía GitHub)
curl -s -H "Authorization: token $TOKEN" https://api.github.com/repos/ElReyDelUniverso-0/VANGUARD/commits/<sha>/status
# versión servida
curl -s https://vanguard-kq9r.vercel.app/api/health | grep -o '"version":"[^"]*"'
# auditoría completa de producción
python scripts/qa/auditoria-movil.py https://vanguard-kq9r.vercel.app auditoria.json
```
Un build fallido NO tumba producción (Vercel sirve el último bueno), pero deja los cambios sin publicar: revisar siempre.

## 6. Casos de prueba de `/lectura` (v402.7)

| Caso | Esperado |
|---|---|
| Nota en el cable vivo | 200 con lo esencial, foto, línea de tiempo |
| Nota fuera del cable de un medio que responde (BBC, El Mundo…) | 200 con título/fecha/foto del propio medio |
| Nota fuera del cable de un medio que bloquea (El País, 403) | 200 «Esta nota ya salió del cable vivo», `noindex` |
| Clave de un dominio ajeno a la casa | 404 |

## Componentes de cliente sin `next dev` (v403.1)
Cuando `next dev` no cabe en memoria: empaquetar el componente REAL con esbuild (alias `@/*` → `src/*`,
`next/navigation` → simulacro con `history.pushState`) y servirlo con un servidor estático; probar con Playwright.
La Puerta no sale a navegadores automatizados: en la prueba, `navigator.webdriver=false` y un user-agent sin «Headless».
Casos de la Puerta: primera visita abre; elegir Juego → `/cuartel`; el Cruce aparece al cambiar de mundo y se va;
mismo mundo sin Cruce; segunda visita no abre; botón la reabre; Esc salta intro y luego cierra; Tab+Enter elige;
robot no la ve; movimiento reducido = fase «eleccion» directa; `/entrar` sin botón de saltar.

## SEO y descubrimiento (v403.2)
- `python3 scripts/qa/seo-sitemap.py [URL-del-sitemap]`: recorre todas las URLs del sitemap (menos /noticia) y 25 noticias al
  azar con UA Google-InspectionTool. Marca estado ≠ 200, redirecciones, canónica ausente/múltiple/ajena, `noindex`
  (meta o `X-Robots-Tag`) y canónica fuera del `<head>`. Objetivo: `con_problema: 0`.
- `scripts/qa/seo-conflictos.py <carpeta>`: lee `p_<tag>.html` descargados con UA Googlebot y da title, h1, canónica,
  robots, palabras visibles y enlaces `<a>` a otras fichas.
- Posición de los metadatos para Googlebot: `curl -A "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"`
  y comprobar que `rel="canonical"` está antes de `</head>`.
- Soft 404: `/conflicto/atlantida` debe dar **404**.
- Comportamiento de Next (streaming, htmlLimitedBots, 404 tras loading.tsx): reproducible en una app mínima que use los
  `node_modules` del repo (`next build --webpack && next start`, ~20 s y < 900 MB), sin el `next dev` completo.
- Sitemap sin desplegar: empaquetar `src/app/sitemap.ts` con esbuild y serializar con
  `next/dist/build/webpack/loaders/metadata/resolve-route-data` → `resolveSitemap`. Ojo: abrir la base la marca como
  modificada; hacer `git checkout -- db/custom.db` después.
