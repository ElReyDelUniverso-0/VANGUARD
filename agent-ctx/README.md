# VANGUARD · agent-ctx — Agentes automatizados del proyecto

## 📡 Agente de Mejora Continua (protocolo oficial)

**Qué es:** un agente con LLM (z-ai-web-dev-sdk) que se ejecuta cada vez que se
completa una tarea del proyecto. Analiza el estado real de la página (salud de
servicios, versión, módulos, worklog reciente) y **envía un mensaje al agente
principal con 3-5 ideas concretas para mejorar la página web** (cualquier ámbito:
funciones, gamificación, viralidad, UX, SEO, rendimiento, comunidad…).

**Cuándo ejecutarlo:** OBLIGATORIAMENTE al final de cada Task ID, antes de
cerrar el trabajo. Es el último paso de la rutina (después de lint + E2E).

**Cómo ejecutarlo:**

```bash
# Forma estándar (después de terminar una tarea)
node scripts/improvement-agent.mjs --task <ID> --notes "qué se hizo"

# Atajo con bun
bun run improve --task <ID> --notes "qué se hizo"

# Con foco en un área concreta (opcional)
bun run improve --task <ID> --focus "rendimiento del mapa 3D"
```

**Cómo leer el mensaje:**
- El mensaje sale por **stdout** (los logs van a stderr) → el agente principal
  lo lee inmediatamente y lo retransmite al usuario en su resumen.
- Queda archivado en `agent-ctx/improvement-inbox.md` (historial numerado).

**Qué hacer con el mensaje:**
1. Retransmitirlo al usuario en el resumen final de la sesión.
2. Si la **⭐ IDEA ESTRELLA** es de esfuerzo S → implementarla en la misma
   sesión si es viable (cierra el ciclo: tarea → agente → mejora → agente).
3. Las ideas M/L se registran como candidatos para la siguiente versión.

**Reglas del mensaje del agente:** 3-5 ideas priorizadas por impacto/esfuerzo,
cada una con qué cambiar exactamente, por qué y esfuerzo S/M/L; no propone nada
que ya exista; termina con su IDEA ESTRELLA.

**Dependencias:** `z-ai-web-dev-sdk` (ya instalado) · Node o Bun desde la raíz
del proyecto.
