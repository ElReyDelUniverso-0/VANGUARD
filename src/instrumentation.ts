// v27 ESTABILIDAD — VANGUARD no se cae más en silencio.
// El trabajo de Node real vive en instrumentation-node.ts (import dinámico)
// para que este archivo compile limpio también en el runtime Edge.
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { registerNode } = await import("./instrumentation-node");
  registerNode();
}
