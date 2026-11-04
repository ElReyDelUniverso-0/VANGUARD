import type { Metadata } from "next";
import { BotonReintentar } from "./boton-reintentar";

// v210.0 EL REFUGIO — la sala de emergencia. Vive en el service worker:
// si el visitante pierde la conexión (señal lenta, avión, corte del barrio),
// el refugio responde aunque la red no exista, con la verdad por delante
// («no hay conexión») y una salida honesta (REINTENTAR). No es una copia
// guardada de la portada — la ley v125 manda ver SIEMPRE la versión nueva
// del HTML, así que las navegaciones jamás se cachean: este refugio es la
// única página que el worker guarda, y solo para el caso sin red.
// v251.0 EL REFUGIO CON MEMORIA — el refugio deja de ser una sala sin
// memoria: el CENTINELA de /guerra-hoy deja en el aparato (localStorage
// vg-ultimo-parte) la copia del último parte visto, y el refugio la TALLA
// en su muro: «EL ÚLTIMO PARTE QUE TU APARATO VIO» — título · fuente ·
// tiempo transcurrido, con la hora del guardado y la confesión de que es
// memoria del aparato, no la red. El parte viaja en un SCRIPT INLINE del
// propio HTML: los chunks JS de esta ruta quizá nunca se cachean (el
// refugio solo se sirve SIN red — un chunk pedido por primera vez sin red
// no llega), así que el script del HTML es la única memoria que funciona
// SIEMPRE, incluso en la primera visita sin red y sin React hidratado.

export const metadata: Metadata = {
  title: "Sin conexión | VANGUARD",
  robots: { index: false, follow: false },
};

// v251.0 — el tallador del muro: lee la copia del centinela y pinta el
// último parte. Cero dependencias, cero chunks, falla en silencio si no
// hay copia (el refugio queda como siempre: limpio y honesto).
const PARTE_SCRIPT = `(function(){try{var raw=localStorage.getItem("vg-ultimo-parte");if(!raw)return;var d=JSON.parse(raw);if(!d||!Array.isArray(d.items)||!d.items.length)return;var cont=document.getElementById("vg-parte-guardado");if(!cont)return;function hace(iso){var ms=Date.now()-new Date(iso).getTime();if(!isFinite(ms)||ms<0)return"";var m=Math.floor(ms/60000);if(m<1)return"ahora mismo";if(m<60)return"hace "+m+" min";var h=Math.floor(m/60);if(h<24)return"hace "+h+" h";return"hace "+Math.floor(h/24)+" d";}function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c];});}var cuando=new Intl.DateTimeFormat("es",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"}).format(new Date(d.guardado));var filas="";for(var i=0;i<d.items.length&&i<8;i++){var it=d.items[i];if(!it||!it.t)continue;filas+='<li class="vg-parte-item"><span class="vg-parte-t">'+esc(it.t)+'</span><span class="vg-parte-m">'+esc(it.f||"")+(it.f&&it.fecha?" · ":"")+(it.fecha?hace(it.fecha):"")+'</span></li>';}if(!filas)return;cont.innerHTML='<p class="vg-parte-k">◉ EL ÚLTIMO PARTE QUE TU APARATO VIO</p><ul class="vg-parte-lista">'+filas+'</ul><p class="vg-parte-nota">Guardado en tu aparato a las '+esc(cuando)+' — es la memoria del aparato, no la red: puede estar desactualizado. El REINTENTAR de arriba trae la versión nueva en vivo.</p>';}catch(e){}})();`;

const PARTE_ESTILOS = `#vg-parte-guardado:empty{display:none}.vg-parte-k{font-family:ui-monospace,SFMono-Regular,monospace;font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:#fbbf24;margin:0 0 12px}.vg-parte-lista{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:9px}.vg-parte-item{display:flex;flex-direction:column;gap:2px;border-left:2px solid rgba(251,191,36,.45);padding-left:10px}.vg-parte-t{font-size:13px;line-height:1.45;color:#e4e4e7}.vg-parte-m{font-family:ui-monospace,SFMono-Regular,monospace;font-size:10px;text-transform:uppercase;letter-spacing:.08em;color:#a1a1aa}.vg-parte-nota{font-family:ui-monospace,SFMono-Regular,monospace;font-size:10px;color:#71717a;margin:14px 0 0;line-height:1.6}`;

export default function FueraDeLinea() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-200 flex items-center justify-center px-5">
      <div className="max-w-md w-full text-center">
        <p className="font-mono text-[11px] uppercase tracking-widest text-amber-400">
          ◉ VANGUARD · REFUGIO
        </p>
        <h1 className="mt-4 text-2xl font-bold text-zinc-100">
          No hay conexión
        </h1>
        <p className="mt-3 text-sm text-zinc-500 leading-relaxed">
          La Casa no puede llegar hasta aquí: tu aparato no tiene red en este
          momento (o la señal es tan débil que el pedido se perdió). Nada se
          rompió del lado del servidor — cuando la conexión vuelva, la portada
          en vivo aparece al instante con la versión más nueva.
        </p>
        <BotonReintentar />
        {/* v251.0 — EL ÚLTIMO PARTE: el muro lo talla el script inline de
            abajo (corre durante el parseo del HTML, sin esperar a React);
            vacío honesto si el aparato no tiene copia (display:none). */}
        <style dangerouslySetInnerHTML={{ __html: PARTE_ESTILOS }} />
        <div
          id="vg-parte-guardado"
          className="mt-8 max-w-md mx-auto text-left"
          dangerouslySetInnerHTML={{ __html: "" }}
        />
        <script dangerouslySetInnerHTML={{ __html: PARTE_SCRIPT }} />
        <p className="mt-6 font-mono text-[10px] text-zinc-600 uppercase tracking-wider">
          El refugio responde sin red · la Casa espera tu regreso
        </p>
      </div>
    </main>
  );
}
