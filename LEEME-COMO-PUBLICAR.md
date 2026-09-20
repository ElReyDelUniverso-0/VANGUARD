# 🚀 CÓMO PUBLICAR VANGUARD — GUÍA PASO A PASO
### v29.0 · LISTO PARA EL MUNDO — explicada para alguien que nunca ha publicado una web

No necesitas saber nada de programación: sigue los pasos **en orden**, copia y pega lo que te indico exactamente como está. Tarda entre 30 y 60 minutos.

---

## ¿QUÉ CAMINO ELEGIR? (léelo primero, 30 segundos)

| | 🅰️ CAMINO A — VERCEL | 🅱️ CAMINO B — SERVIDOR (VPS) |
|---|---|---|
| Costo | **Gratis, sin tarjeta** | Gratis (Oracle) o ~5 USD/mes |
| Dificultad | Muy fácil (clics) | Fácil (copiar 2 líneas) |
| Tiempo | ~15 min | ~30 min |
| Qué obtienes | La página completa en línea | TODO al 100% (incluido multijugador en vivo) |
| Limitación | Lo que guarda datos (cuentas, publicar, salas) queda para el "Paso PRO" | Ninguna |

**Mi recomendación:** empieza HOY con el Camino A para que el mundo vea tu página. Cuando quieras activar cuentas y multijugador, haces el Camino B (o me pides el "Paso PRO" y te preparo la versión Vercel completa con Supabase + Render gratis).

---

## ANTES DE EMPEZAR — lo que necesitas

- ✅ Una **computadora** (Windows o Mac). ⚠️ En el celular NO se puede subir el código (sí puedes crear las cuentas).
- ✅ Internet y 30-60 minutos.
- ✅ (Opcional) una tarjeta para comprar tu dominio propio (~5-12 USD al año). Sin dominio también puedes publicar: te dan una dirección gratis.

---

## PASO 0 — Descarga y descomprime tu página (2 min)

1. Descarga el archivo **`vanguard-v29-publicar.zip`** desde la carpeta de descargas de este chat a tu computadora.
2. Clic derecho sobre el ZIP → **"Extraer todo…"** → te crea una carpeta `vanguard` (recuerda dónde quedó, la necesitarás en el Paso 3).
3. Dentro encontrarás el archivo `LEEME-COMO-PUBLICAR.md` (esta misma guía) por si la necesitas sin conexión.

> Ya incluye la base de datos con contenido de demostración (noticias, encuestas, agentes votando…), así que tu página se verá viva desde el primer día.

---

## PASO 1 — Instala 2 programas en tu PC (5 min)

1. **Git** (necesario para subir el código): entra a `https://git-scm.com/downloads` → elige Windows o Mac → descarga → instala dando "Siguiente" a TODO.
2. **Node.js** (para probar la página en tu PC si algún día quieres): entra a `https://nodejs.org` → botón verde **LTS** → instala con "Siguiente" a todo.

**Comprueba que quedó bien:** pulsa la tecla Windows, escribe `cmd`, abre "Símbolo del sistema" y escribe:
```
git --version
```
Si muestra un número (ej. `git version 2.45…`) ✅ perfecto. Si dice "no se reconoce", reinicia la PC y prueba de nuevo.

---

## PASO 2 — Crea tu cuenta de GitHub (gratis, 3 min)

GitHub es la "bóveda" donde vivirá tu código. Todos los servicios de publicación se conectan a ella.

1. Entra a `https://github.com` → **Sign up**.
2. Pon tu correo, una contraseña, elige tu nombre de usuario (⚠️ este nombre aparecerá en tus enlaces).
3. Abre tu correo y confirma la cuenta.

---

## PASO 3 — Sube VANGUARD a GitHub (10 min)

### 3.1 Crea el repositorio (la carpeta remota)
1. Ya dentro de GitHub, arriba a la derecha pulsa el **+** → **New repository**.
2. Repository name: `vanguard`
3. Marca **Public** (así tu instalador de servidor podrá descargarlo).
4. NO marques "Add a README". Pulsa **Create repository**.
5. Déjala abierta: te mostrará un enlace como `https://github.com/TUUSUARIO/vanguard.git` — lo usarás ya abajo (TUUSUARIO = tu nombre de usuario).

### 3.2 Sube el código (copiar y pegar)
1. Ve a la carpeta `vanguard` que descomprimiste y crea tu archivo de configuración local: dentro de la carpeta, copia el archivo `.env.example` y renómbralo a exactamente `.env` (Windows puede ocultar los archivos que empiezan con punto: en el explorador → pestaña Vista → marca "Extensiones de nombre de archivo").
2. Abre el Símbolo del sistema (`cmd`) y escribe estas líneas **una por una** (cambia la ruta de la primera y TUUSUARIO en la quinta):

```
cd "%USERPROFILE%\Downloads\vanguard"

git init
git add .
git commit -m "VANGUARD v29 - primer lanzamiento"
git branch -M main
git remote add origin https://github.com/TUUSUARIO/vanguard.git
git push -u origin main
```

- La primera vez se abrirá una ventana del navegador pidiendo entrar a GitHub → **autoriza**.
- Si te pregunta algo en la terminal, dale **Enter**.
- ✅ Comprueba: recarga la página de tu repositorio en GitHub → deben aparecer las carpetas `src`, `public`, `scripts`… y unos cientos de archivos.

> En Mac la primera línea es: `cd ~/Downloads/vanguard`

---

## PASO 4 — 🅰️ CAMINO A: publica en VERCEL (gratis, 15 min)

Vercel es la empresa de los creadores de Next.js (la tecnología de tu página). Lo hacen casi automático.

1. Entra a `https://vercel.com` → **Sign Up** → **Continue with GitHub** → autoriza.
2. Pulsa **Add New… → Project**.
3. Busca tu repositorio `vanguard` → pulsa **Import**.
4. Framework Preset: dice **Next.js** (ya detectado). **No toques nada** (ni Build Command ni nada).
5. Pulsa **Deploy** y espera 3-5 minutos. Verás fueguitos artificiales 🎉
6. Tu página ya está en línea en una dirección tipo:
   `https://vanguard-tuusuario.vercel.app` ← esa es la dirección que puedes compartir.

### 4.1 ¿Qué funciona en Vercel gratis y qué no? (siendo honesto)

**✅ Funciona desde el minuto uno:**
- Toda la portada, hero, tensión mundial, feed PARA TI (estilo TikTok), EN VIVO (los 5 canales de YouTube), enciclopedia, mapas, radar, armería, memoriales, mercados en modo demo, juegos del navegador, música, memes…

**⏳ Queda pendiente (lo llamo "Paso PRO", también gratis):**
- Crear cuentas de jugadores, publicar noticias/fotos/videos, comentarios, salas multijugador en tiempo real. Necesitan una base de datos en la nube (Supabase, gratis) y un servidor de salas (Render, gratis). Cuando quieras, dime **"activa el Paso PRO para Vercel"** y lo dejo configurado.

### 4.2 Para actualizar tu página en el futuro
Cambias cualquier cosa en tu PC → abres `cmd` en la carpeta →
```
git add .
git commit -m "mis cambios"
git push
```
→ Vercel publica los cambios solo, en ~2 minutos. **Publicar para siempre es gratis.**

---

## PASO 4-BIS — 🅱️ CAMINO B: servidor completo (TODO al 100%)

Con este camino TODO funciona desde el día 1: cuentas, publicar, multijugador, directos, la base de datos completa.

### 4B.1 Consigue tu servidor (elige UNA)
- **Oracle Cloud — gratis para siempre** (`https://cloud.oracle.com`): crea cuenta (pide tarjeta solo para verificar identidad, no cobra) → "Create a VM" → imagen **Ubuntu 22.04** → forma **A1.Flex** con 4 OCPU y 24 GB (el nivel gratuito lo permite) → guarda el archivo de **clave SSH** que te deja descargar y apunta la **IP pública**.
  - ⚠️ Extra Oracle: en la consola web, entra a tu VCN → Security Lists → Add Ingress Rule y abre los puertos **80 y 443** (TCP, origen 0.0.0.0/0). Sin este paso el navegador no podrá entrar.
- **Hetzner — desde ~4,50 USD/mes** (`https://hetzner.cloud`): New server → Ubuntu 22.04 → CX22 → te da IP + contraseña/root.
- **DigitalOcean / Vultr**: igual de válidos (~5-6 USD/mes).

### 4B.2 Conéctate al servidor (una sola línea)
En Windows: pulsa la tecla Windows, escribe **PowerShell**, ábrelo y escribe (cambia la IP y el nombre de tu archivo de clave):
```
ssh ubuntu@LA-IP-DE-TU-SERVIDOR -i C:\Users\TU-USUARIO\Downloads\claveSSH.key
```
En Hetzner (te da root): `ssh root@LA-IP`
La primera vez pregunta "are you sure?" → escribe `yes` → Enter.

### 4B.3 Instala VANGUARD completo (copiar UNA línea)
Ya dentro del servidor, pega esta línea **completa** (cambia TUUSUARIO dos veces; lo del final es tu dominio, quítalo si aún no tienes):
```
bash <(curl -fsSL https://raw.githubusercontent.com/TUUSUARIO/vanguard/main/scripts/vps-bootstrap.sh) https://github.com/TUUSUARIO/vanguard.git tudominio.com
```
Ese instalador hace TODO solo: instala las herramientas, descarga tu código, lo compila, deja la web y el multijugador corriendo con **auto-reinicio**, y activa el **candado HTTPS automático**. Tarda 5-10 minutos y termina con el cartel **"VANGUARD ESTÁ EN LÍNEA"**.

### 4B.4 Actualizar la página en el futuro
```
ssh a tu servidor
cd ~/vanguard
git pull
bun run build
sudo systemctl restart vanguard-web
```

---

## PASO 5 — Tu dominio propio vanguard.world (opcional, ~5-12 USD/año)

1. **Cómpralo** en Namecheap, Porkbun o Cloudflare (busca `vanguard.world`; el precio depende de la extensión: `.world` suele costar 5-10 USD el primer año). Crea cuenta → compra → listo.
2. **Conéctalo a tu publicación:**
   - **Si usaste VERCEL:** vercel.com → tu proyecto → **Settings → Domains → Add** → escribe tu dominio. Vercel te mostrará los datos que debes poner en tu vendedor de dominio: entra a tu cuenta del vendedor → gestiona el dominio → **Advanced DNS** → agrega:
     - Registro **A** con nombre `@` y valor `76.76.21.21`
     - Registro **CNAME** con nombre `www` y valor `cname.vercel-dns.com`
     → Espera de minutos a 24 h. El candado SSL es automático y gratis.
   - **Si usaste SERVIDOR (Camino B):** en tu vendedor de dominio → Advanced DNS → agrega un registro **A** con nombre `@` y valor = **la IP de tu servidor**. El instalador ya configuró el HTTPS solo.
3. **Dile a tu página cuál es su dirección final** (para Google y las tarjetas al compartir en redes):
   - Vercel: Settings → Environment Variables → agrega `NEXT_PUBLIC_SITE_URL` = `https://tudominio.com` → pestaña Deployments → Redeploy.
   - Servidor: edita `~/vanguard/.env`, agrega la línea `NEXT_PUBLIC_SITE_URL=https://tudominio.com` y reinicia (`sudo systemctl restart vanguard-web`).

---

## PASO 6 — Checklist de lanzamiento (5 min)

- [ ] Abre tu dirección en el **móvil**: la portada carga, la barra de secciones se queda fija al bajar y nada tapa los textos.
- [ ] Prueba **EMISORA → PARA TI** y **EN VIVO** (los canales de YouTube tardan unos segundos).
- [ ] Pon tu página en Google: entra a `https://search.google.com/search-console` → agrega tu dominio → pega tu sitemap: `tudominio.com/sitemap.xml` (ya existe).
- [ ] Comparte el enlace en tus redes con la tarjeta de imagen (ya incluida: `og-image.png`).
- [ ] Cuando quieras cuentas + multijugador en Vercel: pídeme el **Paso PRO**.

---

## PROBLEMAS TÍPICOS Y SOLUCIÓN RÁPIDA

| Problema | Solución |
|---|---|
| `git no se reconoce como comando` | Reinstala Git y **cierra y vuelve a abrir** el cmd |
| Al hacer `git push` pide contraseña y falla | Vuelve a ejecutar `git push`; en la ventana del navegador autoriza a GitHub |
| Vercel: el build falla | Mira la última línea roja del log; lo más común: el repo quedó incompleto. Borra el proyecto en Vercel, repite el Paso 3.2 y vuelve a importar |
| Vercel: algún panel dice error al guardar | Es la limitación del Camino A; activa el Paso PRO o usa el Camino B |
| Un canal de EN VIVO dice "video unavailable" | Es YouTube (ese canal cortó la emisión), no tu página; cambia de canal |
| La página no abre con mi dominio tras 24 h | Revisa que los registros DNS sean exactamente los del Paso 5 (un espacio o mayúscula de más los rompe) |
| ¿Puedo hacer todo desde el celular? | Crear cuentas sí; subir el código y el servidor necesitan una PC |

---

## APÉNDICE — Probar VANGUARD en tu PC (opcional)

Si quieres verla funcionando en tu computadora antes de publicar:
```
cd carpeta-de-vanguard
npm install
npx prisma generate
npm run build
npm run serve:prod
```
→ Abre `http://localhost:3000`. El supervisor (`serve.mjs`) reinicia el servidor solo si algo falla y limita la memoria (la versión de producción usa ~10 veces menos memoria que la de desarrollo).

---

## RESUMEN DE UNA LÍNEA

**ZIP → descomprimir → Git + GitHub → Vercel (gratis, hoy) → dominio propio (opcional) → cuando quieras, servidor completo o Paso PRO.**
