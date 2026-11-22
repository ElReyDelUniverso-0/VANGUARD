// ═══════════════════════════════════════════════════════════════════════════
// v439.0 · LA GRAN ENTRADA — el logo de VANGUARD antes que todo lo demás
// (v438.0 la creó; el Dueño: «no he visto nada… mejóralo, púlelo, que diga WOW»)
//
// DOS TIEMPOS
//   A · ARRANQUE (desde el primer byte, sin React): cielo, rejilla, bandas de
//       cine con su HUD, los anillos se dibujan, chispas que el ojo absorbe, el
//       ojo cerrado respira y el sistema cuenta «iniciando…».
//       Si el navegador prohíbe sonar sin gesto aparece LA PUERTA: «ENTRAR A
//       VANGUARD 🔊». El toque arranca el espectáculo con sonido, sincronizado.
//   B · ESPECTÁCULO (5,5 s, en sincronía exacta con el audio)
//       0,40 el ojo se abre · 0,55 los ocho símbolos entran en órbita
//       1,30 IMPACTO: destello, doble onda, rayos de luz, sacudida, las chispas
//            estallan y «VANGUARD» cae letra a letra con la voz «¡VANGUARD!»
//       2,05 la voz: «El mundo entero… en vivo» · cifras que cuentan solas
//       4,05 el ojo parpadea · 4,30 la cámara se acerca a la pupila
//       4,75 SEGUNDO GOLPE: el iris se abre en círculo y descubre la casa
//
// CUÁNDO: la primera carga de cada sesión, y la portada cada vez que se llega
// de fuera o se recarga. `?intro` la fuerza. Nunca a robots, iframes ni
// pruebas automáticas; respeta el sonido apagado del Dueño y la quietud.
// Sin JavaScript se retira sola a los 2,5 s: la entrada JAMÁS se queda puesta.
// ═══════════════════════════════════════════════════════════════════════════
import type { ReactNode } from "react";
import { APP_VERSION } from "@/lib/version";

const RAYOS = Array.from({ length: 36 }, (_, i) => i * 10);
const PESTANAS = Array.from({ length: 11 }, (_, i) => -50 + i * 10);
const C = 260; // centro del lienzo 520×520

function estrella(cx: number, cy: number, largo: number, corto: number, puntas: number, giro = 0): string {
  const pts: string[] = [];
  for (let i = 0; i < puntas * 2; i++) {
    const r = i % 2 === 0 ? largo : corto;
    const a = ((Math.PI * 2) / (puntas * 2)) * i + (giro * Math.PI) / 180 - Math.PI / 2;
    pts.push(`${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`);
  }
  return pts.join(" ");
}

// Los símbolos de la casa, dibujados centrados en (0,0) dentro de ±15
const SIMBOLOS: { id: string; dibujo: ReactNode }[] = [
  { id: "globo", dibujo: (<><circle r="13" /><ellipse rx="5.5" ry="13" /><path d="M-13 0H13M-11 -6.5H11M-11 6.5H11" /></>) },
  { id: "mira", dibujo: (<><circle r="10" /><path d="M0 -15V-6M0 6V15M-15 0H-6M6 0H15" /><circle r="1.8" className="vi-relleno" /></>) },
  { id: "radar", dibujo: (<><circle r="13" /><circle r="7" /><path d="M0 0L9.2 -9.2A13 13 0 0 1 13 0Z" className="vi-relleno-suave" /></>) },
  { id: "escudo", dibujo: <path d="M0 -14L12 -9V0C12 7 6.5 12 0 14C-6.5 12 -12 7 -12 0V-9Z M-5 0L-1 4L6 -4" /> },
  { id: "rayo", dibujo: <path d="M3 -14L-8 2H0L-3 14L8 -2H0Z" className="vi-relleno-suave" /> },
  { id: "lengua", dibujo: (<><path d="M-13 -10H13V6H-2L-8 12V6H-13Z" /><path d="M-7 -3H7M-7 1.5H3" /></>) },
  { id: "polaris", dibujo: <polygon points={estrella(0, 0, 14, 3.6, 4)} className="vi-relleno-suave" /> },
  { id: "emblema", dibujo: (<><path d="M0 -14L12 -7V7L0 14L-12 7V-7Z" /><path d="M-6 -6H-2.5L0 2L2.5 -6H6L1.5 7H-1.5Z" className="vi-relleno" /></>) },
];

// Chispas: posiciones fijas (deterministas: el HTML del servidor no cambia)
const CHISPAS = Array.from({ length: 28 }, (_, i) => {
  const a = (i * 137.5) % 360;
  const d = 150 + ((i * 53) % 130);
  return { a, d, r: 1.2 + (i % 3) * 0.7, t: ((i * 0.173) % 1.6).toFixed(2) };
});

// Los textos en los ocho idiomas de la casa. Se pintan todos y el CSS enseña
// solo el del idioma guardado (html[data-vi-idioma]): sin desajustes con React.
type Lang = "es" | "en" | "pt" | "fr" | "de" | "it" | "ru" | "zh";
const IDIOMAS: Lang[] = ["es", "en", "pt", "fr", "de", "it", "ru", "zh"];
interface Textos {
  lema1: string; lema2: string; entrar: string; sonido: string; mudo: string; saltar: string;
  iniciando: string; listo: string; sistema: string; vivo: string; paises: string; lenguas: string; horas: string;
}
const TEXTOS: Record<Lang, Textos> = {
  es: { lema1: "El mundo entero", lema2: "en vivo", entrar: "Entrar a Vanguard", sonido: "con sonido", mudo: "Entrar sin sonido", saltar: "Saltar", iniciando: "Iniciando sistema", listo: "Acceso autorizado", sistema: "Sistema global", vivo: "En vivo", paises: "países", lenguas: "lenguas", horas: "h en vivo" },
  en: { lema1: "The whole world", lema2: "live", entrar: "Enter Vanguard", sonido: "with sound", mudo: "Enter without sound", saltar: "Skip", iniciando: "Starting system", listo: "Access granted", sistema: "Global system", vivo: "Live", paises: "countries", lenguas: "languages", horas: "h live" },
  pt: { lema1: "O mundo inteiro", lema2: "ao vivo", entrar: "Entrar no Vanguard", sonido: "com som", mudo: "Entrar sem som", saltar: "Pular", iniciando: "Iniciando sistema", listo: "Acesso autorizado", sistema: "Sistema global", vivo: "Ao vivo", paises: "países", lenguas: "línguas", horas: "h ao vivo" },
  fr: { lema1: "Le monde entier", lema2: "en direct", entrar: "Entrer dans Vanguard", sonido: "avec le son", mudo: "Entrer sans le son", saltar: "Passer", iniciando: "Démarrage du système", listo: "Accès autorisé", sistema: "Système global", vivo: "En direct", paises: "pays", lenguas: "langues", horas: "h en direct" },
  de: { lema1: "Die ganze Welt", lema2: "live", entrar: "Vanguard betreten", sonido: "mit Ton", mudo: "Ohne Ton eintreten", saltar: "Überspringen", iniciando: "System startet", listo: "Zugang gewährt", sistema: "Globales System", vivo: "Live", paises: "Länder", lenguas: "Sprachen", horas: "h live" },
  it: { lema1: "Il mondo intero", lema2: "in diretta", entrar: "Entra in Vanguard", sonido: "con audio", mudo: "Entra senza audio", saltar: "Salta", iniciando: "Avvio del sistema", listo: "Accesso autorizzato", sistema: "Sistema globale", vivo: "In diretta", paises: "paesi", lenguas: "lingue", horas: "h in diretta" },
  ru: { lema1: "Весь мир", lema2: "в прямом эфире", entrar: "Войти в Vanguard", sonido: "со звуком", mudo: "Войти без звука", saltar: "Пропустить", iniciando: "Запуск системы", listo: "Доступ разрешён", sistema: "Глобальная система", vivo: "В эфире", paises: "стран", lenguas: "языков", horas: "ч в эфире" },
  zh: { lema1: "整个世界", lema2: "实时", entrar: "进入 Vanguard", sonido: "开启声音", mudo: "静音进入", saltar: "跳过", iniciando: "系统启动中", listo: "授权通过", sistema: "全球系统", vivo: "直播", paises: "个国家", lenguas: "种语言", horas: "小时直播" },
};

function T({ k }: { k: keyof Textos }) {
  return (
    <>
      {IDIOMAS.map((l) => (
        <span key={l} lang={l} className="vi-t">
          {TEXTOS[l][k]}
        </span>
      ))}
    </>
  );
}

// El guion corre ANTES de que exista el marcado. Sin backticks ni dependencias.
const GUION = `(function(){
var H=document.documentElement, K='vg-intro:v2';
function no(){H.setAttribute('data-vi','visto');}
var q=location.search||'', p=location.pathname||'/', ua=navigator.userAgent||'';
var forzar=/[?&]intro(=|&|$)/.test(q);
try{
  if(!forzar){
    if(navigator.webdriver||/bot|crawl|spider|slurp|lighthouse|headless|bingpreview|facebookexternalhit|whatsapp|telegrambot|embedly|pagespeed|preview/i.test(ua)||q.indexOf('sin-intro')>=0||p.indexOf('/embed')===0||window.top!==window.self||H.getAttribute('data-vg-anim')==='desactivadas'){no();return;}
    var visto=sessionStorage.getItem(K)==='1';
    var nv=(window.performance&&performance.getEntriesByType&&performance.getEntriesByType('navigation')[0])||{};
    var recarga=nv.type==='reload';
    var deFuera=!document.referrer||document.referrer.indexOf(location.origin)!==0;
    if(visto&&!(p==='/'&&(recarga||deFuera))){no();return;}
  }
  sessionStorage.setItem(K,'1');
}catch(e){ if(navigator.webdriver){no();return;} }
var quieto=false; try{quieto=matchMedia('(prefers-reduced-motion: reduce)').matches;}catch(e){}
if(quieto) H.setAttribute('data-vi-quieto','1');
try{var lg=JSON.parse(localStorage.getItem('vanguard-lang-v1')||'{}'); lg=lg&&lg.state&&lg.state.lang; if(/^(es|en|pt|fr|de|it|ru|zh)$/.test(lg||'')) H.setAttribute('data-vi-idioma',lg);}catch(e){}
H.setAttribute('data-vi','a');
function ya(){return (window.performance&&performance.now)?performance.now():Date.now();}
var t0=ya(), fase='a', cerrada=false, tGo=0, relojes=[];
function T(f,ms){relojes.push(setTimeout(f,ms));}
var mudo=false; try{var pr=JSON.parse(localStorage.getItem('vg:interfaz:v1')||'{}'); if(pr&&pr.sonido===false) mudo=true;}catch(e){}
var a=null, suena=false;
if(!mudo){ try{ a=new Audio('/sonidos/intro-vanguard.mp3'); a.preload='auto'; a.volume=1; a.load(); }catch(e){a=null;} }
function go(){
  if(cerrada||(fase!=='a'&&fase!=='puerta')) return;
  fase='go'; tGo=ya(); H.removeAttribute('data-vi-puerta'); H.setAttribute('data-vi','go');
  T(function(){ if(!cerrada){ cerrada=true; quitar(); H.setAttribute('data-vi','fuera'); } },5600);
}
function cerrar(){
  if(cerrada) return; cerrada=true; relojes.forEach(clearTimeout); quitar();
  H.removeAttribute('data-vi-puerta'); H.setAttribute('data-vi','fin');
  try{ if(a&&suena){ var v=a.volume, i=setInterval(function(){ v-=0.1; if(v<=0){clearInterval(i); a.pause();} else a.volume=v; },40); } }catch(e){}
  setTimeout(function(){H.setAttribute('data-vi','fuera');},620);
}
function sonarDesde(s){ if(!a) return false; try{ a.currentTime=s; var pm=a.play(); suena=true; if(pm&&pm.catch) pm.catch(function(){suena=false;}); return true; }catch(e){ return false; } }
function puerta(){ if(cerrada||fase!=='a') return; fase='puerta'; H.setAttribute('data-vi-puerta','1'); T(function(){ if(fase==='puerta') go(); },9000); }
function intentar(){
  if(cerrada||fase!=='a') return;
  var espera=Math.max(0,1000-(ya()-t0));
  setTimeout(function(){
    if(cerrada||fase!=='a') return;
    if(!a){ go(); return; }
    var pm; try{ a.currentTime=0; pm=a.play(); }catch(e){ pm=null; }
    if(pm&&pm.then){ pm.then(function(){ suena=true; go(); },function(){ puerta(); }); }
    else { suena=true; go(); }
  },espera);
}
function entrarConSonido(){ if(fase==='puerta'){ sonarDesde(0); go(); } }
function alClic(e){
  var t=e.target, c=function(s){return t&&t.closest&&t.closest(s);};
  if(c('#vg-intro-salta')){ e.preventDefault(); cerrar(); return; }
  if(c('#vi-mudo')){ e.preventDefault(); if(fase==='puerta'){ fase='a'; go(); } return; }
  if(fase==='puerta'){ e.preventDefault(); entrarConSonido(); return; }
  if(fase==='go'&&a&&!suena){ var s=(ya()-tGo)/1000; if(s<4.4) sonarDesde(s); }
}
function alTecla(e){
  if(e.key==='Escape'){ cerrar(); return; }
  if(fase==='puerta'&&(e.key==='Enter'||e.key===' ')){ e.preventDefault(); entrarConSonido(); }
}
function quitar(){ document.removeEventListener('click',alClic,true); document.removeEventListener('keydown',alTecla,true); }
document.addEventListener('click',alClic,true);
document.addEventListener('keydown',alTecla,true);
if(a){
  var listo=false, ir=function(){ if(!listo){ listo=true; intentar(); } };
  a.addEventListener('canplaythrough',ir,{once:true});
  a.addEventListener('error',function(){ a=null; ir(); },{once:true});
  setTimeout(ir,2600);
} else { setTimeout(intentar,0); }
setTimeout(cerrar,22000);
})();`;

export function IntroVanguard() {
  const letras = "VANGUARD".split("");
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: GUION }} />
      <div id="vg-intro" aria-label="Bienvenida de VANGUARD" suppressHydrationWarning>
        <div className="vi-cielo" aria-hidden />
        <div className="vi-rejilla" aria-hidden />
        <div className="vi-luz" aria-hidden />
        <div className="vi-barrido" aria-hidden />

        <div className="vi-sacude">
          <div className="vi-escena">
            <div className="vi-lienzo">
              <div className="vi-chispas entra" aria-hidden>
                {CHISPAS.map((c, i) => (
                  <i key={i} style={{ ["--a" as string]: `${c.a}deg`, ["--d" as string]: `${c.d}px`, ["--r" as string]: `${c.r}px`, animationDelay: `-${c.t}s` }} />
                ))}
              </div>
              <div className="vi-chispas sale" aria-hidden>
                {CHISPAS.map((c, i) => (
                  <i key={i} style={{ ["--a" as string]: `${c.a + 7}deg`, ["--d" as string]: `${c.d * 1.6}px`, ["--r" as string]: `${c.r + 0.6}px` }} />
                ))}
              </div>

              <svg className="vi-logo" viewBox="0 0 520 520" aria-hidden focusable="false">
                <defs>
                  <radialGradient id="vi-luzg" cx="50%" cy="50%" r="50%">
                    <stop offset="0" stopColor="#fff6d6" stopOpacity=".9" />
                    <stop offset=".3" stopColor="#e8c56a" stopOpacity=".42" />
                    <stop offset="1" stopColor="#e8c56a" stopOpacity="0" />
                  </radialGradient>
                  <linearGradient id="vi-oro" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#fff3c4" />
                    <stop offset=".45" stopColor="#e8c56a" />
                    <stop offset="1" stopColor="#9a6a12" />
                  </linearGradient>
                  <linearGradient id="vi-punta" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#fff3c4" stopOpacity=".95" />
                    <stop offset="1" stopColor="#b8862b" stopOpacity=".12" />
                  </linearGradient>
                  <radialGradient id="vi-iris" cx="50%" cy="50%" r="50%">
                    <stop offset="0" stopColor="#1a1206" />
                    <stop offset=".42" stopColor="#5a3b08" />
                    <stop offset=".7" stopColor="#c8901f" />
                    <stop offset=".9" stopColor="#f2d27e" />
                    <stop offset="1" stopColor="#7a520c" />
                  </radialGradient>
                  <radialGradient id="vi-blanco" cx="50%" cy="45%" r="60%">
                    <stop offset="0" stopColor="#17120a" />
                    <stop offset="1" stopColor="#050507" />
                  </radialGradient>
                  <clipPath id="vi-almendra">
                    <path d="M98 260 Q260 118 422 260 Q260 402 98 260Z" />
                  </clipPath>
                </defs>

                <circle cx={C} cy={C} r="250" fill="url(#vi-luzg)" className="vi-halo" />
                <g className="vi-rayos" stroke="#e8c56a" strokeLinecap="round">
                  {RAYOS.map((g) => (
                    <line key={g} x1={C} y1={g % 30 === 0 ? 74 : 94} x2={C} y2={g % 30 === 0 ? 118 : 122}
                      strokeWidth={g % 30 === 0 ? 2.2 : 1} strokeOpacity={g % 30 === 0 ? 0.75 : 0.35}
                      transform={`rotate(${g} ${C} ${C})`} />
                  ))}
                </g>
                <polygon points={estrella(C, C, 196, 70, 4)} fill="url(#vi-punta)" className="vi-estrella" />
                <polygon points={estrella(C, C, 152, 62, 4, 45)} fill="url(#vi-punta)" className="vi-estrella b" />

                <circle cx={C} cy={C} r="200" pathLength={1} className="vi-trazo" />
                <circle cx={C} cy={C} r="186" pathLength={1} className="vi-trazo b" />
                <g className="vi-anillo" fill="none" stroke="url(#vi-oro)">
                  <circle cx={C} cy={C} r="228" strokeWidth="1.2" strokeDasharray="2 9" opacity=".7" />
                  <circle cx={C} cy={C} r="238" strokeWidth=".8" strokeDasharray="38 14 4 14" opacity=".45" />
                </g>
                <g className="vi-anillo b" fill="none" stroke="#e8c56a">
                  <circle cx={C} cy={C} r="214" strokeWidth="1" strokeDasharray="1 5" opacity=".5" />
                </g>

                <g className="vi-orbita">
                  {SIMBOLOS.map((s, i) => {
                    const ang = (i / SIMBOLOS.length) * Math.PI * 2 - Math.PI / 2;
                    const x = C + 222 * Math.cos(ang);
                    const y = C + 222 * Math.sin(ang);
                    return (
                      <g key={s.id} transform={`translate(${x.toFixed(1)} ${y.toFixed(1)})`}>
                        <g className="vi-sim-giro">
                          <g className="vi-sim" style={{ animationDelay: `${0.55 + i * 0.08}s` }}>
                            <circle r="21" className="vi-sim-fondo" />
                            <g className="vi-sim-trazo">{s.dibujo}</g>
                          </g>
                        </g>
                      </g>
                    );
                  })}
                </g>

                <circle cx={C} cy={C} r="120" className="vi-onda" />
                <circle cx={C} cy={C} r="120" className="vi-onda b" />

                <g className="vi-abre">
                  <g className="vi-parpadeo">
                    <g className="vi-pestanas" stroke="#e8c56a" strokeLinecap="round" opacity=".85">
                      {PESTANAS.map((g) => (
                        <line key={g} x1={C} y1="156" x2={C} y2={g === 0 ? 130 : 140} strokeWidth={g === 0 ? 3 : 1.8}
                          transform={`rotate(${g} ${C} 296)`} />
                      ))}
                    </g>
                    <path d="M98 260 Q260 118 422 260 Q260 402 98 260Z" fill="url(#vi-blanco)" />
                    <g clipPath="url(#vi-almendra)">
                      <g className="vi-iris">
                        <circle cx={C} cy={C} r="84" fill="url(#vi-iris)" />
                        <g stroke="#f2d27e" strokeOpacity=".24" strokeWidth="1">
                          {RAYOS.map((g) => (
                            <line key={g} x1={C} y1="188" x2={C} y2="220" transform={`rotate(${g + 5} ${C} ${C})`} />
                          ))}
                        </g>
                        <circle cx={C} cy={C} r="84" fill="none" stroke="#2a1c05" strokeWidth="3" />
                        <circle cx={C} cy={C} r="44" fill="#050507" className="vi-pupila" />
                        <g transform={`translate(${C - 32} ${C - 32})`}>
                          <g className="vi-emblema">
                            <path d="M32 3 59 18v28L32 61 5 46V18z" fill="none" stroke="url(#vi-oro)" strokeWidth="2.4" />
                            <path d="M17 20h8l7 18 7-18h8L35 47h-6z" fill="url(#vi-oro)" />
                          </g>
                        </g>
                        <ellipse cx="236" cy="232" rx="13" ry="8" fill="#fff8e1" opacity=".55" transform="rotate(-28 236 232)" />
                        <circle cx="286" cy="286" r="3.5" fill="#fff8e1" opacity=".4" />
                      </g>
                    </g>
                    <path d="M98 260 Q260 118 422 260 Q260 402 98 260Z" fill="none" stroke="url(#vi-oro)" strokeWidth="5" strokeLinejoin="round" className="vi-borde" />
                    <path d="M84 260 Q260 100 436 260" fill="none" stroke="#e8c56a" strokeOpacity=".35" strokeWidth="1.4" />
                    <path d="M84 260 Q260 420 436 260" fill="none" stroke="#e8c56a" strokeOpacity=".25" strokeWidth="1.2" />
                  </g>
                </g>
                {/* el ojo cerrado que respira durante el arranque */}
                <path d="M98 260 Q260 272 422 260 Q260 248 98 260Z" className="vi-cerrado" />

                {[[C, 64], [456, C], [C, 456], [64, C]].map(([x, y], i) => (
                  <polygon key={i} points={estrella(x, y, 13, 3, 4)} fill="#fff6d6" className={`vi-destello d${i}`} />
                ))}
              </svg>
            </div>

            <p className="vi-titulo" data-texto="VANGUARD" aria-label="VANGUARD">
              {letras.map((l, i) => (
                <span key={i} className="vi-letra" style={{ ["--i" as string]: i }} aria-hidden>
                  {l}
                </span>
              ))}
            </p>
            <p className="vi-lema">
              <span className="vi-lema-1"><T k="lema1" /></span>
              <span className="vi-lema-sep"> · </span>
              <span className="vi-lema-2"><T k="lema2" /></span>
            </p>
            <ul className="vi-cifras" aria-hidden>
              <li style={{ ["--vi-meta" as string]: 249 }}><b className="vi-num" /><T k="paises" /></li>
              <li style={{ ["--vi-meta" as string]: 8000 }}><b className="vi-num mas" /><T k="lenguas" /></li>
              <li style={{ ["--vi-meta" as string]: 24 }}><b className="vi-num" /><T k="horas" /></li>
            </ul>
            <div className="vi-estado" aria-hidden>
              <span className="vi-estado-a"><T k="iniciando" /> <b className="vi-pct" /></span>
              <span className="vi-estado-b"><T k="listo" /></span>
            </div>
            <div className="vi-carga" aria-hidden><i /></div>
          </div>
        </div>

        {/* bandas de cine con su HUD */}
        <div className="vi-banda arriba" aria-hidden>
          <span>VANGUARD <em>//</em> <T k="sistema" /></span>
        </div>
        <div className="vi-banda abajo" aria-hidden>
          <span>18.48°N · 69.93°W</span>
          <span className="vi-vivo"><i /> <T k="vivo" /></span>
          <span>{APP_VERSION}</span>
        </div>

        <div className="vi-flash" aria-hidden />
        <div className="vi-aro" aria-hidden />

        {/* LA PUERTA: solo si el navegador no deja sonar sin un toque */}
        <div className="vi-puerta">
          <button id="vi-entrar" type="button" className="vi-entrar">
            <span className="vi-entrar-ico" aria-hidden>▶</span>
            <span className="vi-entrar-txt"><T k="entrar" /></span>
            <span className="vi-entrar-son" aria-hidden>🔊 <T k="sonido" /></span>
          </button>
          <button id="vi-mudo" type="button" className="vi-mudo"><T k="mudo" /></button>
        </div>

        <button id="vg-intro-salta" type="button" className="vi-salta">
          <T k="saltar" /> ›
        </button>
      </div>
    </>
  );
}
