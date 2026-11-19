
### Despliegue Vercel · MISIÓN 03 (2026-11-19)
- Producción: proyecto `vanguard-kq9r` (`prj_uJKJQvYBrY8wRtsS82Jl73cmj1lB`), build `dpl_9hVywytUiym82gqQNLw1Haz7xyMM` — READY y PROMOTED, commit `922e365` de `main` (descendiente de los commits del Atlas).
- URL: https://vanguard-kq9r.vercel.app — las cuatro puertas, la ficha Golden Gate y `/mundos/us` responden 200; cabecera muestra **v420.3**.
- Sitemap en producción dividido por bloques: el Atlas vive en `/sitemaps/mapas/sitemap.xml` con 179 URLs (puertas + fichas); fichas contradas devuelven 200.
- Build limpio (prisma generate + tsc --noEmit + next build --webpack), cache de build restaurado (hit de rama), lambdas listas en iad1.

### v421.9 · MISIÓN 06 — SCIENCE FRONTIER (2026-11-20)
- El departamento científico publicado: 45 registros con DOI/arXiv, 22 citas verificadas, tipo editorial y nivel de evidencia separados, 13 rutas + `/api/ciencia`, 1.237 comprobaciones propias y el informe completo en `docs/SCIENCE-FRONTIER.md`.
