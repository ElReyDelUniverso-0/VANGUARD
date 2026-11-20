
### Despliegue Vercel · MISIÓN 03 (2026-11-19)
- Producción: proyecto `vanguard-kq9r` (`prj_uJKJQvYBrY8wRtsS82Jl73cmj1lB`), build `dpl_9hVywytUiym82gqQNLw1Haz7xyMM` — READY y PROMOTED, commit `922e365` de `main` (descendiente de los commits del Atlas).
- URL: https://vanguard-kq9r.vercel.app — las cuatro puertas, la ficha Golden Gate y `/mundos/us` responden 200; cabecera muestra **v420.3**.
- Sitemap en producción dividido por bloques: el Atlas vive en `/sitemaps/mapas/sitemap.xml` con 179 URLs (puertas + fichas); fichas contradas devuelven 200.
- Build limpio (prisma generate + tsc --noEmit + next build --webpack), cache de build restaurado (hit de rama), lambdas listas en iad1.
