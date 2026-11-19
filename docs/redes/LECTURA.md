> Reintegración final sobre `c97ef5a1545b593b4aba813e2617be747e46b5a1`: preserva las entregas Cámara, Lingua y Memory Archive. Versión reservada `v420.2`. Se añadieron enlaces recíprocos con `/memoria`. El primer push fue rechazado por avance concurrente de main; no se forzó ni sobrescribió la rama remota.

> Actualización de publicación: acceso de escritura restablecido por el propietario. Integración sobre `ce83c8c8bba93e551f6d5a791402acc1a1febee0` preservando Cámara de Inteligencia; versión `v419.2` para evitar colisión con v419.1. El estado final de despliegue se registra en la constancia de publicación. Las notas siguientes documentan la entrega local original y sus límites de QA.

# World Networks · implementación candidata v419.1

**Estado: implementado y probado localmente; NO publicado.**
Base oficial `431f0c81655340e36765982ef43179128574664f`; rama `feature/world-networks`.

## Auditoría y decisión
- Se conservan las dieciséis páginas de bloques geopolíticos de `/organizaciones`.
- Los perfiles coincidentes se leen en ejecución del registro Knowledge: no se crea un catálogo institucional independiente que compita con él.
- La red vive en `/organizaciones/redes`; sus 35 fichas institucionales/documentales en `/organizaciones/redes/[id]`. No se crean páginas nacionales adicionales.
- Los países siguen abriendo `/mundos/[iso]`; Kosovo, según designación del BIRF, no recibe una URL nacional inventada.

## Qué funciona
Mapa ego-centrado SVG con zoom, desplazamiento por arrastre del fondo, selección de nodos por ratón/teclado, evidencia de cada arista, fichas laterales y completas. Se priorizan vecinos institucionales y se paginan hasta 40 nodos por vista; la tabla equivalente conserva todos los vínculos del filtro.

Directorio temático, búsqueda sin tildes, biblioteca de siete instrumentos con texto/custodio oficial, cronología de fundación/firma/entrada en vigor y búsqueda BFS de caminos. Los caminos son recorridos bidireccionales por datos explícitos: NO prueban alianza ni causalidad.

**28 instituciones, 7 instrumentos, 250 nodos territoriales, 937 relaciones.** Los 250 nodos territoriales son 249 entradas del registro de Vanguard más Kosovo en la lista BIRF; no son 250 Estados soberanos. Solo aparecen vínculos incorporados documentalmente.

### Censos completos incorporados
|Institución|Membresía plena|Matiz|
|---|---:|---|
|ONU|193|Observadores no contados como miembros|
|BIRF|189|No se hereda a AIF, CFI, OMGI ni CIADI|
|OMC|166|Incluye UE y territorios aduaneros; no 166 países soberanos|
|OCDE|38|UE participante, cinco socios clave y ocho candidaturas separados|
|CERN|25|11 asociados; UE/UNESCO observadores sin voto|
|ESA|23|4 asociados; Canadá coopera, no es miembro|
|UE|27|No confundir con eurozona o Schengen|
|CARICOM|15|Montserrat es territorio miembro; asociados pendientes de segunda revisión|

Donde no se incorporó un censo, se dice expresamente. No se infieren membresías desde la ONU ni cooperación por compartir tema o países.

## Integraciones
- Enlace de ida desde el centro de organizaciones; se preservan su tabla y sus bloques.
- Enlaces desde fichas `/mundos/[iso]` y hojas de datos nacionales; vuelta desde el explorador.
- Centro Knowledge → red, y fichas de red → Knowledge; textos compartidos por ID.
- Biblioteca del cuartel → instrumentos; red → biblioteca existente `/cuartel?sala=biblioteca`.
- Núcleo `mod:redes`, directorio temático, censo/grafo, modelo `dato:red-institucional` y API común.

## API
`GET /api/redes`: envoltorio central `{ok,api,version,datos|error,meta}`.
- `seccion=catalogo|nodos|relaciones|fuentes|camino`.
- `q` hasta 180 caracteres para nodos; filtros `tema`, `clase`.
- `id` para detalle/vecindad; `tipo` para relación.
- `desde=0..10000`, `limite=1..100` (por defecto 50).
- `seccion=camino&origen=pais:do&destino=unesco`.
- Errores 400/404/429, caché pública 300 s y límite compartido de 60 consultas/minuto por cliente. Es memoria de instancia, NO defensa distribuida.

## Pruebas y alcance
- `npx tsx scripts/redes/pruebas.ts`: **36 comprobaciones** de integridad, distinciones semánticas, datos, integración, contrato API, errores y límite.
- `node tools/arquitectura/censar.mjs && node tools/arquitectura/grafo.mjs && node scripts/pruebas-arquitectura.mjs`: **15 pasan / 0 fallan**.
- TypeScript focal: sin diagnósticos. Comprobación sintáctica de 11 archivos de integración existentes: sin errores. No se afirma typecheck de toda la aplicación.
- Build optimizado en arnés aislado: correcto; portada y 35 fichas estáticas. El arnés omite la carcasa global y usa un marco mínimo conservando CSS/páginas del módulo.
- Playwright: **26 pasan / 0 fallan**, incluyendo zoom/pan/teclado, vínculos/fuentes, filtros, paginación, países, tratados, caminos, 404, móvil sin desborde y lectura SSR sin JavaScript. No valida servicios externos ni regresión global.
- QA: `/home/user/vanguard-networks/qa` en la entrega del workspace. El navegador requiere Playwright y Chromium instalados; acepta `BASE_URL`, `QA_DIR` y, en el sandbox, `PLAYWRIGHT_MODULE` para resolver el paquete externo. El arnés aislado no se distribuye como aplicación oficial.

## Problemas encontrados y arreglos
- `npm ci` agotó la RAM (2 GB); proceso detenido, sin instalación concurrente. Se reutilizaron dependencias de la entrega previa, con `package.json` idéntico.
- La utilidad central truncaba consultas largas: la nueva API las rechaza explícitamente con 400.
- Accesibilidad del formulario de caminos: nombres explícitos Origen/Destino.
- El directorio devuelve organización CERN y su convenio: la prueba fue corregida para reconocer ambos, no ocultar datos válidos.
- OMC expone datos mediante recurso JS: se analizaron campos sin ejecutarlo y se incorporaron los 166 MBR, no los observadores.
- UNCTAD clasificada como órgano, no como fondo o agencia autónoma. Cronología distingue antecedentes y vigor jurídico.
- El pie de la página CARICOM consultada contiene enlaces ajenos sospechosos: no se incluyeron esos enlaces, HTML ni asociados sin segunda comprobación. La lista de miembros se transcribió como hechos y conserva su fuente.

## Publicación y continuidad
No se ha subido esta rama ni desplegado el módulo público: no hay credencial Git disponible. El token mencionado en otra parte de la conversación no se encuentra accesible en este contexto. El conector Vercel no sustituye el envío de la rama local; NO desplegar solo el arnés sobre la aplicación oficial.

La entrega Documentary local anterior permanece separada y sin modificar. Esta rama parte del main oficial, no contiene ni revierte aquella entrega pendiente. Para publicar ambas deben integrarse sobre el main vigente y resolver posibles cambios paralelos.

Siguiente ampliación: censos por agencia, organismos regionales adicionales, tratados con reservas/retiradas y vigencia versionada; doble revisión editorial de fuente CARICOM; regresión completa de la carcasa y comprobación anónima de producción antes de dar la misión por publicada.
