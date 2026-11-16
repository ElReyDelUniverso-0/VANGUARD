# redireccion-casa/ — la puerta de los proyectos Vercel retirados (v404.1)
Los proyectos `vanguard` (chi-puce) y `vanguard-u6b9` construían el mismo `main` que `vanguard-kq9r`
(3 despliegues por push, crons ×3, contenido duplicado en 3 dominios para Google).
Su «Root Directory» en Vercel apunta a esta carpeta: solo sirven un 308 a vanguard-kq9r.vercel.app
conservando la ruta. Sin app, sin crons. Deshacer: Root Directory vacío en el proyecto.
NO añadir nada aquí: no es parte de la app (Next no la lee; tsconfig solo incluye src/).
