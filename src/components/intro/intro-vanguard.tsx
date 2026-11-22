// ═══════════════════════════════════════════════════════════════════════════
// v438.0 · LA ENTRADA — el logo de VANGUARD antes que todo lo demás
//
// Lo primero que ve quien entra a la casa, ANTES de que cargue nada:
//   0,0 s  el cielo se enciende y los anillos se dibujan
//   0,45 s el OJO de VANGUARD se abre; los símbolos de la casa entran en órbita
//   1,30 s IMPACTO — destello, onda, sacudida y «VANGUARD» cae con su voz
//   1,75 s el lema y las salas; la línea de carga se llena
//   3,62 s el ojo parpadea · 3,95 s la cámara entra por la pupila a la casa
//
// Es un componente de SERVIDOR: HTML + CSS puros que se pintan con el primer
// byte, sin esperar a React. El único JavaScript es un guion vanilla diminuto
// que (1) decide si toca mostrarla (una vez por sesión, nunca a robots ni en
// iframes ni en /vanguard2), (2) intenta sonar y, si el navegador lo prohíbe
// sin gesto, ofrece «toca para escuchar», y (3) la retira. Si ese guion no
// corre, el CSS la retira solo a los 4,1 s: la entrada JAMÁS se queda puesta.
//
// El sonido (public/sonidos/intro-vanguard.mp3) es diseño 100 % por código:
// dron, subida, latidos, impacto, metal, campanas y la voz «¡VANGUARD!».
// Respeta el sonido apagado del Dueño (vg:interfaz:v1) y la quietud del sistema.
// ═══════════════════════════════════════════════════════════════════════════

import type { ReactNode } from "react";

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
const SIMBOLOS: { id: string; nombre: string; dibujo: ReactNode }[] = [
  {
    id: "globo",
    nombre: "Globo 3D",
    dibujo: (
      <>
        <circle r="13" />
        <ellipse rx="5.5" ry="13" />
        <path d="M-13 0H13M-11 -6.5H11M-11 6.5H11" />
      </>
    ),
  },
  {
    id: "mira",
    nombre: "Guerras en vivo",
    dibujo: (
      <>
        <circle r="10" />
        <path d="M0 -15V-6M0 6V15M-15 0H-6M6 0H15" />
        <circle r="1.8" className="vi-relleno" />
      </>
    ),
  },
  {
    id: "radar",
    nombre: "Radar",
    dibujo: (
      <>
        <circle r="13" />
        <circle r="7" />
        <path d="M0 0L9.2 -9.2A13 13 0 0 1 13 0Z" className="vi-relleno-suave" />
      </>
    ),
  },
  {
    id: "escudo",
    nombre: "Armería",
    dibujo: <path d="M0 -14L12 -9V0C12 7 6.5 12 0 14C-6.5 12 -12 7 -12 0V-9Z M-5 0L-1 4L6 -4" />,
  },
  {
    id: "rayo",
    nombre: "En vivo",
    dibujo: <path d="M3 -14L-8 2H0L-3 14L8 -2H0Z" className="vi-relleno-suave" />,
  },
  {
    id: "lengua",
    nombre: "Lenguas",
    dibujo: (
      <>
        <path d="M-13 -10H13V6H-2L-8 12V6H-13Z" />
        <path d="M-7 -3H7M-7 1.5H3" />
      </>
    ),
  },
  {
    id: "polaris",
    nombre: "Polaris",
    dibujo: <polygon points={estrella(0, 0, 14, 3.6, 4)} className="vi-relleno-suave" />,
  },
  {
    id: "emblema",
    nombre: "Emblema",
    dibujo: (
      <>
        <path d="M0 -14L12 -7V7L0 14L-12 7V-7Z" />
        <path d="M-6 -6H-2.5L0 2L2.5 -6H6L1.5 7H-1.5Z" className="vi-relleno" />
      </>
    ),
  },
];

// Los textos de la entrada en los ocho idiomas de la casa. Se pintan todos y
// el CSS enseña solo el del idioma guardado (html[data-vi-idioma]): así la
// entrada habla el idioma del piloto sin esperar a React y sin desajustes.
type Lang = "es" | "en" | "pt" | "fr" | "de" | "it" | "ru" | "zh";
const IDIOMAS: Lang[] = ["es", "en", "pt", "fr", "de", "it", "ru", "zh"];
const TEXTOS: Record<Lang, { lema: string; toca: string; entrar: string; salas: [string, string, string, string] }> = {
  es: { lema: "El mundo entero · en vivo", toca: "Toca para escuchar", entrar: "Entrar", salas: ["GUERRAS", "GLOBO 3D", "249 PAÍSES", "ZONA CERO"] },
  en: { lema: "The whole world · live", toca: "Tap to listen", entrar: "Enter", salas: ["WARS", "3D GLOBE", "249 COUNTRIES", "GROUND ZERO"] },
  pt: { lema: "O mundo inteiro · ao vivo", toca: "Toque para ouvir", entrar: "Entrar", salas: ["GUERRAS", "GLOBO 3D", "249 PAÍSES", "MARCO ZERO"] },
  fr: { lema: "Le monde entier · en direct", toca: "Touchez pour écouter", entrar: "Entrer", salas: ["GUERRES", "GLOBE 3D", "249 PAYS", "POINT ZÉRO"] },
  de: { lema: "Die ganze Welt · live", toca: "Tippen zum Hören", entrar: "Eintreten", salas: ["KRIEGE", "3D-GLOBUS", "249 LÄNDER", "NULLPUNKT"] },
  it: { lema: "Il mondo intero · in diretta", toca: "Tocca per ascoltare", entrar: "Entra", salas: ["GUERRE", "GLOBO 3D", "249 PAESI", "PUNTO ZERO"] },
  ru: { lema: "Весь мир · в прямом эфире", toca: "Нажмите, чтобы слушать", entrar: "Войти", salas: ["ВОЙНЫ", "3D-ГЛОБУС", "249 СТРАН", "ЗОНА НОЛЬ"] },
  zh: { lema: "整个世界 · 实时", toca: "轻触收听", entrar: "进入", salas: ["战争", "3D 地球", "249 个国家", "零区"] },
};

function T({ k }: { k: (t: (typeof TEXTOS)[Lang]) => string }) {
  return (
    <>
      {IDIOMAS.map((l) => (
        <span key={l} lang={l} className="vi-t">
          {k(TEXTOS[l])}
        </span>
      ))}
    </>
  );
}

// El guion corre ANTES de que exista el marcado: decide, prepara el audio y
// arranca el reloj a la vez que el CSS. Sin backticks ni dependencias.
const GUION = `(function(){
var H=document.documentElement, K='vg-intro:v1', D=4600, IMP=1300;
function no(){H.setAttribute('data-vi','visto');}
try{
  var q=location.search||'', p=location.pathname||'/';
  if(sessionStorage.getItem(K)==='1'||navigator.webdriver||q.indexOf('sin-intro')>=0||p.indexOf('/vanguard2')===0||p.indexOf('/embed')===0||window.top!==window.self||H.getAttribute('data-vg-anim')==='desactivadas'){no();return;}
  sessionStorage.setItem(K,'1');
}catch(e){ if(navigator.webdriver){no();return;} }
var quieto=false; try{quieto=matchMedia('(prefers-reduced-motion: reduce)').matches;}catch(e){}
if(quieto){H.setAttribute('data-vi-quieto','1');D=2300;}
H.setAttribute('data-vi','on');
try{var lg=JSON.parse(localStorage.getItem('vanguard-lang-v1')||'{}'); lg=lg&&lg.state&&lg.state.lang; if(/^(es|en|pt|fr|de|it|ru|zh)$/.test(lg||'')) H.setAttribute('data-vi-idioma',lg);}catch(e){}
var t0=(window.performance&&performance.now)?performance.now():Date.now();
function ahora(){return ((window.performance&&performance.now)?performance.now():Date.now())-t0;}
var finEn=D-500, reloj=null, cerrada=false;
function cerrar(){ if(cerrada) return; cerrada=true; clearTimeout(reloj); H.setAttribute('data-vi','fin');
  setTimeout(function(){H.setAttribute('data-vi','fuera');},760);
  quitar(); }
function programar(ms){ clearTimeout(reloj); reloj=setTimeout(cerrar,Math.max(0,ms)); }
programar(finEn);
setTimeout(cerrar,12000);
var mudo=false; try{var pr=JSON.parse(localStorage.getItem('vg:interfaz:v1')||'{}'); if(pr&&pr.sonido===false) mudo=true;}catch(e){}
var a=null, sono=false;
if(!mudo&&!quieto){ try{ a=new Audio('/sonidos/intro-vanguard.mp3'); a.preload='auto'; a.volume=0.9; }catch(e){a=null;} }
function sonar(gesto){
  if(!a||sono||cerrada) return; var el=ahora();
  try{
    if(el<IMP-150){ a.currentTime=el/1000; }
    else { a.currentTime=1.05; setTimeout(function(){ if(!cerrada){H.setAttribute('data-vi-re', H.getAttribute('data-vi-re')==='1'?'2':'1');} },250); programar(250+(D-1050-500)); }
    var pm=a.play();
    sono=true; H.removeAttribute('data-vi-son');
    if(pm&&pm.catch){ pm.catch(function(){ sono=false; if(!gesto) H.setAttribute('data-vi-son','pide'); }); }
  }catch(e){ sono=false; }
}
function alGesto(e){
  var t=e.target; if(t&&t.closest&&t.closest('#vg-intro-salta')) return;
  if(a&&!sono){ sonar(true); }
}
function alTecla(e){ if(e.key==='Escape') cerrar(); else alGesto(e); }
function quitar(){ document.removeEventListener('pointerdown',alGesto,true); document.removeEventListener('keydown',alTecla,true); }
document.addEventListener('pointerdown',alGesto,true);
document.addEventListener('keydown',alTecla,true);
document.addEventListener('click',function(e){var t=e.target; if(t&&t.closest&&t.closest('#vg-intro-salta')){e.preventDefault();cerrar();}},true);
if(a){
  var listo=false;
  var ir=function(){ if(listo) return; listo=true; sonar(false); };
  a.addEventListener('canplaythrough',ir,{once:true});
  setTimeout(function(){ if(!listo){ listo=true; sonar(false);} },900);
}
})();`;

export function IntroVanguard() {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: GUION }} />
      <div id="vg-intro" aria-label="Bienvenida de VANGUARD" suppressHydrationWarning>
        <div className="vi-cielo" aria-hidden />
        <div className="vi-rejilla" aria-hidden />
        <div className="vi-barrido" aria-hidden />
        <div className="vi-sacude">
          <div className="vi-escena">
            <svg className="vi-logo" viewBox="0 0 520 520" aria-hidden focusable="false">
              <defs>
                <radialGradient id="vi-luz" cx="50%" cy="50%" r="50%">
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

              <circle cx={C} cy={C} r="250" fill="url(#vi-luz)" className="vi-halo" />

              <g className="vi-rayos" stroke="#e8c56a" strokeLinecap="round">
                {RAYOS.map((g) => (
                  <line
                    key={g}
                    x1={C}
                    y1={g % 30 === 0 ? 74 : 94}
                    x2={C}
                    y2={g % 30 === 0 ? 118 : 122}
                    strokeWidth={g % 30 === 0 ? 2.2 : 1}
                    strokeOpacity={g % 30 === 0 ? 0.75 : 0.35}
                    transform={`rotate(${g} ${C} ${C})`}
                  />
                ))}
              </g>

              <polygon points={estrella(C, C, 196, 70, 4)} fill="url(#vi-punta)" className="vi-estrella" />
              <polygon points={estrella(C, C, 152, 62, 4, 45)} fill="url(#vi-punta)" className="vi-estrella b" />

              {/* anillos de instrumento: uno se dibuja, los otros giran */}
              <circle cx={C} cy={C} r="200" pathLength={1} className="vi-trazo" />
              <g className="vi-anillo" fill="none" stroke="url(#vi-oro)">
                <circle cx={C} cy={C} r="228" strokeWidth="1.2" strokeDasharray="2 9" opacity=".7" />
                <circle cx={C} cy={C} r="238" strokeWidth=".8" strokeDasharray="38 14 4 14" opacity=".45" />
              </g>
              <g className="vi-anillo b" fill="none" stroke="#e8c56a">
                <circle cx={C} cy={C} r="214" strokeWidth="1" strokeDasharray="1 5" opacity=".5" />
              </g>

              {/* los símbolos de la casa, en órbita */}
              <g className="vi-orbita">
                {SIMBOLOS.map((s, i) => {
                  const a = (i / SIMBOLOS.length) * Math.PI * 2 - Math.PI / 2;
                  const x = C + 222 * Math.cos(a);
                  const y = C + 222 * Math.sin(a);
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

              {/* la onda del impacto */}
              <circle cx={C} cy={C} r="120" className="vi-onda" />
              <circle cx={C} cy={C} r="120" className="vi-onda b" />

              {/* EL OJO: se abre, mira, parpadea */}
              <g className="vi-abre">
                <g className="vi-parpadeo">
                  <g stroke="#e8c56a" strokeLinecap="round" opacity=".85">
                    {PESTANAS.map((g) => (
                      <line
                        key={g}
                        x1={C}
                        y1="156"
                        x2={C}
                        y2={g === 0 ? 130 : 140}
                        strokeWidth={g === 0 ? 3 : 1.8}
                        transform={`rotate(${g} ${C} 296)`}
                      />
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
                      <g transform={`translate(${C - 32} ${C - 32})`} className="vi-emblema">
                        <path d="M32 3 59 18v28L32 61 5 46V18z" fill="none" stroke="url(#vi-oro)" strokeWidth="2.4" />
                        <path d="M17 20h8l7 18 7-18h8L35 47h-6z" fill="url(#vi-oro)" />
                      </g>
                      <ellipse cx="236" cy="232" rx="13" ry="8" fill="#fff8e1" opacity=".55" transform="rotate(-28 236 232)" />
                      <circle cx="286" cy="286" r="3.5" fill="#fff8e1" opacity=".4" />
                    </g>
                  </g>
                  <path d="M98 260 Q260 118 422 260 Q260 402 98 260Z" fill="none" stroke="url(#vi-oro)" strokeWidth="5" strokeLinejoin="round" />
                  <path d="M84 260 Q260 100 436 260" fill="none" stroke="#e8c56a" strokeOpacity=".35" strokeWidth="1.4" />
                  <path d="M84 260 Q260 420 436 260" fill="none" stroke="#e8c56a" strokeOpacity=".25" strokeWidth="1.2" />
                </g>
              </g>

              {/* destellos en los cuatro vértices */}
              {[
                [C, 64],
                [456, C],
                [C, 456],
                [64, C],
              ].map(([x, y], i) => (
                <polygon key={i} points={estrella(x, y, 13, 3, 4)} fill="#fff6d6" className={`vi-destello d${i}`} />
              ))}
            </svg>

            <p className="vi-titulo" data-texto="VANGUARD">
              VANGUARD
            </p>
            <p className="vi-lema">
              <T k={(t) => t.lema} />
            </p>
            <ul className="vi-salas" aria-hidden>
              {[0, 1, 2, 3].map((i) => (
                <li key={i} style={{ animationDelay: `${1.95 + i * 0.12}s` }}>
                  <T k={(t) => t.salas[i]} />
                </li>
              ))}
            </ul>
            <div className="vi-carga" aria-hidden>
              <i />
            </div>
          </div>
        </div>
        <div className="vi-flash" aria-hidden />
        <p className="vi-sonido" aria-hidden>
          <span className="vi-sonido-ico">🔊</span> <T k={(t) => t.toca} />
        </p>
        <button id="vg-intro-salta" type="button" className="vi-salta">
          <T k={(t) => t.entrar} /> ›
        </button>
      </div>
    </>
  );
}
