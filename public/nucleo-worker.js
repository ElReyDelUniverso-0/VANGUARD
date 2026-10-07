// v80.0 — Worker del NÚCLEO EMBEBIDO: la IA neuronal vive fuera del hilo
// principal para que el juego siga a 60 fps mientras el modelo razona.
// Receta oficial de transformers.js: import ESM del CDN + device/dtype por
// capacidades (WebGPU q4f16 → WASM q4; el int8 de este repo genera basura).
// Mensajes:
//   → { type: "activar" }
//   ← { type: "estado", fase, progreso, dispositivo?, error? }
//   → { type: "generar", id, messages, maxTokens }
//   ← { type: "resultado", id, texto }

import { pipeline } from "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1";

const MODELO = "onnx-community/Qwen2.5-0.5B-Instruct";
let gen = null;

self.onmessage = async (e) => {
  const msg = e.data || {};

  if (msg.type === "activar") {
    try {
      const archivos = new Map();
      const cb = (p) => {
        if (p && p.status === "progress" && (p.total ?? 0) > 0 && p.file) {
          archivos.set(p.file, { loaded: p.loaded ?? 0, total: p.total ?? 0 });
          let l = 0;
          let t = 0;
          for (const v of archivos.values()) {
            l += v.loaded;
            t += v.total;
          }
          self.postMessage({ type: "estado", fase: "descargando", progreso: Math.min(99, Math.round((l / Math.max(1, t)) * 100)) });
        }
      };

      // la sonda de WebGPU se hace en el hilo principal (requestAdapter dentro
      // del worker cuelga el gpu-process en headless): aquí solo se obedece.
      const conGPU = msg.conGPU === true;
      const intentos = conGPU
        ? [
            ["webgpu", "q4f16"],
            ["wasm", "q4"],
          ]
        : [["wasm", "q4"]];

      let ultimoError = null;
      for (const [device, dtype] of intentos) {
        try {
          self.postMessage({ type: "estado", fase: "descargando", progreso: 0, dispositivo: device });
          gen = await pipeline("text-generation", MODELO, { device, dtype, progress_callback: cb });
          self.postMessage({ type: "estado", fase: "compilando", progreso: 100, dispositivo: device });
          // calentamiento: compila kernels y valida la generación
          await gen([{ role: "user", content: "Di exactamente: NUCLEO ACTIVO" }], { max_new_tokens: 10, do_sample: false });
          self.postMessage({ type: "estado", fase: "listo", progreso: 100, dispositivo: device });
          return;
        } catch (err) {
          ultimoError = err;
          gen = null;
        }
      }
      throw ultimoError || new Error("sin dispositivo de inferencia");
    } catch (err) {
      self.postMessage({ type: "estado", fase: "error", progreso: 0, dispositivo: null, error: String((err && err.message) || err) });
    }
    return;
  }

  if (msg.type === "generar") {
    if (!gen) {
      self.postMessage({ type: "resultado", id: msg.id, texto: null });
      return;
    }
    try {
      const out = await gen(msg.messages, {
        max_new_tokens: msg.maxTokens ?? 90,
        do_sample: true,
        temperature: 0.7,
        top_p: 0.9,
        top_k: 40,
        repetition_penalty: 1.1,
        continue_final_message: true,
      });
      const arr = out && out[0] ? out[0].generated_text : null;
      const texto = Array.isArray(arr) ? String((arr[arr.length - 1] && arr[arr.length - 1].content) || "") : typeof arr === "string" ? arr : "";
      self.postMessage({ type: "resultado", id: msg.id, texto: texto.trim() || null });
    } catch {
      self.postMessage({ type: "resultado", id: msg.id, texto: null });
    }
  }
};
