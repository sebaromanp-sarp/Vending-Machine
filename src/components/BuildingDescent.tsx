import { CSSProperties, memo, ReactNode, RefObject, useMemo, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { easeInOut, easeOut, lerp, seeded, span, useScrollProgress } from '../lib/scroll';

// ---------------------------------------------------------------------------
// Medidas del mundo 3D (px antes de escalar). Origen: esquina superior del frente
// de la torre, centrada en x. +y baja, +z viene hacia la cámara.
// ---------------------------------------------------------------------------
const W = 440; // ancho del frente
const DZ = 300; // fondo de la torre
const FLOORS = 16;
const FH = 120;
const LOBBY = 280;
const H = FLOORS * FH + LOBBY;
const LOBBY_Y = H - LOBBY;
const BAYS = [30, 112, 258, 340];
const SIDE_BAYS = [26, 115, 204];
const WW = 70;
const WH = 68;
const CABIN_H = 58;
const CAB_TOP = FH - CABIN_H - 4;
const CAB_END = H - 16 - CABIN_H;

type WinKind = 'dark' | 'warm' | 'dim' | 'cool' | 'tv' | 'story';
type Win = { x: number; y: number; kind: WinKind; person: boolean; plant: boolean };

const STEPS: { from: number; eyebrow: string; title: string; text: string; more?: string }[] = [
  { from: 0, eyebrow: '23:47 · Piso 16', title: '¿Te dio hambre de algo dulce en la noche?', text: '' },
  {
    from: 0.26,
    eyebrow: 'Sin salir del edificio',
    title: 'Lo que se te antoja está más cerca de lo que crees.',
    text: 'Sin abrigarse, sin buscar un local abierto.',
  },
  { from: 0.5, eyebrow: 'A pasos del ascensor', title: 'Snacks, bebidas y abarrotes esenciales, las 24 horas.', text: '' },
  {
    from: 0.74,
    eyebrow: 'Lobby',
    title: 'Hola, somos PuntoMatica y nos gustaría ser tu nuevo vecino.',
    text: 'Instalamos mini-markets automáticos en edificios residenciales del Gran Concepción.',
    // En pantallas chicas se muestra solo la primera frase, para no tapar la escena
    more: ' Nos encargamos de la instalación, el abastecimiento y el mantenimiento del servicio.',
  },
];

// ---------------------------------------------------------------------------
// Utilidades 3D
// ---------------------------------------------------------------------------
const abs = (s: CSSProperties): CSSProperties => ({ position: 'absolute', ...s });

/** Caja con frente, costado derecho y techo. (x, y, z) es la esquina frontal superior izquierda. */
function Box({
  x,
  y,
  z,
  w,
  h,
  d,
  front,
  side,
  top,
  children,
}: {
  x: number;
  y: number;
  z: number;
  w: number;
  h: number;
  d: number;
  front?: CSSProperties;
  side?: CSSProperties;
  top?: CSSProperties;
  children?: ReactNode;
}) {
  return (
    <div className="p3d" style={abs({ left: x, top: y, width: 0, height: 0, transform: `translateZ(${z}px)` })}>
      <div style={abs({ left: 0, top: 0, width: w, height: h, ...front })}>{children}</div>
      {side && <div style={abs({ left: w, top: 0, width: d, height: h, transformOrigin: '0 0', transform: 'rotateY(90deg)', ...side })} />}
      {top && <div style={abs({ left: 0, top: 0, width: w, height: d, transformOrigin: '0 0', transform: 'rotateX(-90deg)', ...top })} />}
    </div>
  );
}

/** Textura de ventanas para los edificios vecinos (mosaico SVG). */
function windowTile(seed: number, lit: string, ratio: number) {
  const rnd = seeded(seed);
  const cols = 6;
  const rows = 8;
  const cw = 44;
  const ch = 52;
  let rects = '';
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const on = rnd() < ratio;
      const o = on ? (0.45 + rnd() * 0.55).toFixed(2) : '1';
      rects += `<rect x="${c * cw + 9}" y="${r * ch + 12}" width="26" height="30" fill="${on ? lit : '#0d121c'}" opacity="${o}"/>`;
    }
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${cols * cw}" height="${rows * ch}"><rect width="100%" height="100%" fill="#080c14"/>${rects}</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

function Neighbor({ x, z, w, h, d, seed, lit, fog }: { x: number; z: number; w: number; h: number; d: number; seed: number; lit: string; fog: number }) {
  const tile = useMemo(() => windowTile(seed, lit, 0.2), [seed, lit]);
  const face = (extra: number): CSSProperties => ({
    backgroundImage: `linear-gradient(rgba(5,8,16,${Math.min(0.92, fog + extra)}), rgba(5,8,16,${Math.min(0.92, fog + extra)})), ${tile}`,
    backgroundSize: 'auto, 264px 416px',
  });
  return <Box x={x} y={H - h} z={z} w={w} h={h} d={d} front={face(0)} side={face(0.28)} top={{ background: '#0b0f18' }} />;
}

// ---------------------------------------------------------------------------
// Dibujo de las fachadas
// ---------------------------------------------------------------------------
function WindowShape({ w }: { w: Win }) {
  const { x, y, kind } = w;
  const frame = <rect x={x - 3} y={y - 3} width={WW + 6} height={WH + 6} rx="2" fill="#070a10" />;
  const rail = <rect x={x - 5} y={y + WH + 5} width={WW + 10} height="13" rx="2" fill="rgba(150,190,255,0.07)" stroke="#2a3348" strokeWidth="1.5" />;
  if (kind === 'dark' || kind === 'tv') {
    return (
      <g>
        {frame}
        <rect x={x} y={y} width={WW} height={WH} fill="#0f141e" />
        <path d={`M${x + 8} ${y + WH} L${x + 30} ${y} h10 L${x + 18} ${y + WH} z`} fill="#fff" opacity="0.035" />
        <line x1={x + WW / 2} y1={y} x2={x + WW / 2} y2={y + WH} stroke="#070a10" strokeWidth="2" />
        {rail}
      </g>
    );
  }
  const fill = kind === 'cool' ? 'url(#fCool)' : 'url(#fWarm)';
  return (
    <g>
      {frame}
      <rect x={x} y={y} width={WW} height={WH} fill={fill} opacity={kind === 'dim' ? 0.42 : 1} />
      <rect x={x} y={y} width={WW * 0.26} height={WH} fill="#000" opacity="0.2" />
      <rect x={x + WW * 0.86} y={y} width={WW * 0.14} height={WH} fill="#000" opacity="0.14" />
      {w.plant && (
        <g fill="#16210f" opacity="0.85">
          <rect x={x + 10} y={y + WH - 12} width="12" height="12" rx="2" />
          <circle cx={x + 16} cy={y + WH - 20} r="9" />
        </g>
      )}
      {(w.person || kind === 'story') && (
        <g fill="#1a1408" opacity="0.88">
          <circle cx={x + WW * 0.62} cy={y + WH - 34} r="8" />
          <path d={`M${x + WW * 0.62 - 13} ${y + WH} q0 -22 13 -22 q13 0 13 22 z`} />
        </g>
      )}
      <line x1={x + WW / 2} y1={y} x2={x + WW / 2} y2={y + WH} stroke="#070a10" strokeWidth="2" />
      {rail}
    </g>
  );
}

function makeWindows(seed: number, bays: number[], story: boolean): Win[] {
  const rnd = seeded(seed);
  const out: Win[] = [];
  for (let f = 0; f < FLOORS; f++) {
    bays.forEach((x, b) => {
      const r = rnd();
      let kind: WinKind = r < 0.38 ? 'dark' : r < 0.66 ? 'warm' : r < 0.78 ? 'dim' : r < 0.88 ? 'cool' : 'tv';
      if (story && f === 0 && b === 1) kind = 'story';
      const lit = kind === 'warm' || kind === 'cool';
      out.push({ x, y: f * FH + 26, kind, person: lit && rnd() < 0.3, plant: lit && rnd() < 0.3 });
    });
  }
  return out;
}

const DEFS = (
  <defs>
    <linearGradient id="fWarm" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#FFEBB8" />
      <stop offset="1" stopColor="#F2B13A" />
    </linearGradient>
    <linearGradient id="fCool" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#F2F6FF" />
      <stop offset="1" stopColor="#B9CDF2" />
    </linearGradient>
    <linearGradient id="fFacade" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stopColor="#0e121b" />
      <stop offset="0.55" stopColor="#151b28" />
      <stop offset="1" stopColor="#1a2130" />
    </linearGradient>
    <linearGradient id="fSide" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stopColor="#0b0e15" />
      <stop offset="1" stopColor="#06080d" />
    </linearGradient>
  </defs>
);

function FrontFace({ windows }: { windows: Win[] }) {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="block" aria-hidden="true">
      {DEFS}
      {/* muro: sobre el lobby es macizo; en el lobby solo quedan los pilares para ver el interior */}
      <rect x="0" y="0" width={W} height={LOBBY_Y + 60} fill="url(#fFacade)" />
      {[
        [0, 14],
        [190, 60],
        [426, 14],
      ].map(([x, w]) => (
        <rect key={x} x={x} y={LOBBY_Y + 60} width={w} height={LOBBY - 60} fill="#0d1119" />
      ))}
      <rect x="0" y={H - 16} width={W} height="16" fill="#10141d" />
      {Array.from({ length: FLOORS + 1 }, (_, f) => (
        <rect key={f} x="0" y={f * FH - 1} width={W} height="15" fill="#1b2231" />
      ))}
      {[14, 190, 250, 426].map((x) => (
        <line key={x} x1={x} x2={x} y1="0" y2={LOBBY_Y} stroke="#1f2636" strokeWidth="2" />
      ))}
      {windows.map((w, i) => (
        <WindowShape key={i} w={w} />
      ))}
      {/* caja del ascensor */}
      <rect x="196" y="6" width="48" height={H - 22} fill="#04060a" />
      {/* vidrio del lobby */}
      {[14, 250].map((x) => (
        <g key={x}>
          <rect x={x} y={LOBBY_Y + 60} width="176" height={LOBBY - 76} fill="rgba(255,226,160,0.06)" />
          <path d={`M${x + 30} ${H - 16} L${x + 96} ${LOBBY_Y + 60} h22 L${x + 52} ${H - 16} z`} fill="#fff" opacity="0.05" />
          <path d={`M${x + 112} ${H - 16} L${x + 160} ${LOBBY_Y + 60} h8 L${x + 120} ${H - 16} z`} fill="#fff" opacity="0.05" />
          <line x1={x + 88} x2={x + 88} y1={LOBBY_Y + 60} y2={H - 16} stroke="#232b3d" strokeWidth="3" />
          <rect x={x} y={LOBBY_Y + 60} width="176" height={LOBBY - 76} fill="none" stroke="#232b3d" strokeWidth="3" />
        </g>
      ))}
    </svg>
  );
}

function SideFace({ windows }: { windows: Win[] }) {
  return (
    <svg viewBox={`0 0 ${DZ} ${H}`} width={DZ} height={H} className="block" aria-hidden="true">
      {DEFS}
      <rect x="0" y="0" width={DZ} height={H} fill="url(#fSide)" />
      {Array.from({ length: FLOORS + 1 }, (_, f) => (
        <rect key={f} x="0" y={f * FH - 1} width={DZ} height="15" fill="#10151f" />
      ))}
      {windows.map((w, i) => (
        <WindowShape key={i} w={w} />
      ))}
      <rect x="0" y={LOBBY_Y + 44} width={DZ} height="16" fill="#131926" />
      <rect x="118" y={LOBBY_Y + 110} width="64" height={LOBBY - 126} rx="2" fill="#0d1119" stroke="#1d2433" strokeWidth="2" />
      <rect x="0" y={H - 16} width={DZ} height="16" fill="#0c1018" />
      <rect x="0" y="0" width={DZ} height={H} fill="#000" opacity="0.3" />
    </svg>
  );
}

/** Solo las ventanas encendidas, desenfocadas, para dar resplandor. */
function Bloom({ windows, width }: { windows: Win[]; width: number }) {
  return (
    <svg viewBox={`0 0 ${width} ${H}`} width={width} height={H} className="block" aria-hidden="true">
      {windows
        .filter((w) => w.kind === 'warm' || w.kind === 'cool' || w.kind === 'story')
        .map((w, i) => (
          <rect key={i} x={w.x} y={w.y} width={WW} height={WH} fill={w.kind === 'cool' ? '#b9cdf2' : '#ffc45a'} />
        ))}
    </svg>
  );
}

function Tree({ x, z, h }: { x: number; z: number; h: number }) {
  const w = h * 0.6;
  return (
    <svg
      viewBox="0 0 160 280"
      style={abs({ left: x, top: H - h, width: w, height: h, transform: `translateZ(${z}px)` })}
      aria-hidden="true"
    >
      <rect x="74" y="165" width="12" height="115" fill="#080a0f" />
      <circle cx="80" cy="108" r="72" fill="#0b2019" />
      <circle cx="46" cy="140" r="46" fill="#09190f" />
      <circle cx="114" cy="136" r="50" fill="#0e2a1f" />
      <circle cx="98" cy="84" r="34" fill="#1c4a36" opacity="0.55" />
      <circle cx="60" cy="96" r="24" fill="#245a41" opacity="0.35" />
    </svg>
  );
}

function Lamp({ x, z }: { x: number; z: number }) {
  return (
    <div className="p3d" style={abs({ left: x, top: H - 250, width: 0, height: 0, transform: `translateZ(${z}px)` })}>
      <div style={abs({ left: -3, top: 0, width: 6, height: 250, background: '#0a0d13' })} />
      <div style={abs({ left: -3, top: 0, width: 46, height: 6, background: '#0a0d13', borderRadius: 3 })} />
      <div style={abs({ left: 30, top: 4, width: 16, height: 8, borderRadius: 4, background: '#ffe9b0', boxShadow: '0 0 18px 6px rgba(255,220,140,0.75)' })} />
      <div
        style={abs({
          left: -62,
          top: 6,
          width: 200,
          height: 250,
          background: 'radial-gradient(ellipse 50% 100% at 50% 0%, rgba(255,220,140,0.22), rgba(255,220,140,0) 70%)',
        })}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// El mundo 3D (no se vuelve a dibujar: la cámara y el ascensor se mueven por referencia)
// ---------------------------------------------------------------------------
type SceneRefs = {
  world: RefObject<HTMLDivElement>;
  cabin: RefObject<HTMLDivElement>;
  cable: RefObject<HTMLDivElement>;
  idle: RefObject<HTMLImageElement>;
  wave: RefObject<HTMLImageElement>;
};

const World = memo(function World({ refs }: { refs: SceneRefs }) {
  const front = useMemo(() => makeWindows(11, BAYS, true), []);
  const side = useMemo(() => makeWindows(29, SIDE_BAYS, false), []);
  const tvs = useMemo(() => front.filter((w) => w.kind === 'tv'), [front]);
  const story = front.find((w) => w.kind === 'story')!;

  return (
    <div ref={refs.world} className="p3d absolute left-0 top-0 w-0 h-0 will-change-transform">
      {/* ---------- Suelo ---------- */}
      <div
        style={abs({
          left: -1300,
          top: H,
          width: 2600,
          height: 1820,
          transformOrigin: '0 0',
          transform: 'translateZ(520px) rotateX(-90deg)',
          background: [
            // luz del lobby y de los faroles sobre la vereda
            'radial-gradient(ellipse 430px 250px at 1300px 400px, rgba(255,199,44,0.46), rgba(255,199,44,0) 72%)',
            'radial-gradient(ellipse 200px 150px at 880px 330px, rgba(255,220,140,0.26), rgba(255,220,140,0) 70%)',
            'radial-gradient(ellipse 200px 150px at 1640px 330px, rgba(255,220,140,0.26), rgba(255,220,140,0) 70%)',
            // línea de la calle y solera
            'repeating-linear-gradient(90deg, rgba(255,255,255,0.4) 0 56px, transparent 56px 130px) 0 120px / 100% 5px no-repeat',
            'linear-gradient(#39425a, #39425a) 0 246px / 100% 7px no-repeat',
            // baldosas de la vereda
            'repeating-linear-gradient(90deg, rgba(255,255,255,0.05) 0 2px, transparent 2px 74px) 0 253px / 100% 267px no-repeat',
            'linear-gradient(180deg, #06080c 0px, #0a0d14 246px, #171d2a 253px, #131824 520px, #0a0d13 560px, #07090e 100%)',
          ].join(', '),
          maskImage: 'radial-gradient(ellipse 62% 78% at 50% 26%, #000 38%, transparent 82%)',
          WebkitMaskImage: 'radial-gradient(ellipse 62% 78% at 50% 26%, #000 38%, transparent 82%)',
        })}
      />

      {/* ---------- Edificios vecinos ---------- */}
      <Neighbor x={-1240} z={-900} w={420} h={1950} d={300} seed={41} lit="#d6a445" fog={0.62} />
      <Neighbor x={-900} z={-470} w={360} h={1420} d={280} seed={42} lit="#e9b44c" fog={0.46} />
      <Neighbor x={-720} z={-60} w={300} h={860} d={260} seed={43} lit="#f0c060" fog={0.28} />
      <Neighbor x={-260} z={-1150} w={520} h={2520} d={300} seed={44} lit="#9fb6e6" fog={0.7} />
      <Neighbor x={420} z={-760} w={420} h={1780} d={320} seed={45} lit="#e9b44c" fog={0.52} />
      <Neighbor x={640} z={-230} w={320} h={1080} d={280} seed={46} lit="#f0c060" fog={0.32} />

      {/* ---------- Torre ---------- */}
      {/* techo y equipos */}
      <div style={abs({ left: -W / 2, top: 0, width: W, height: DZ, transformOrigin: '0 0', transform: 'rotateX(-90deg)', background: 'linear-gradient(180deg, #151b28, #0c1018)' })} />
      <Box x={-56} y={-48} z={-36} w={112} h={48} d={110} front={{ background: '#141a27', boxShadow: 'inset 0 0 0 2px #232b3d' }} side={{ background: '#0c1018' }} top={{ background: '#1b2231' }} />
      <Box x={84} y={-66} z={-130} w={96} h={66} d={96} front={{ background: 'linear-gradient(90deg, #1a2130, #232c3f)', borderRadius: 4 }} side={{ background: '#0e121b' }} top={{ background: '#242d40' }} />
      <div style={abs({ left: -176, top: -190, width: 4, height: 190, background: '#2a3246', transform: 'translateZ(-210px)' })} />
      <div className="anim-blink" style={abs({ left: -180, top: -198, width: 12, height: 12, borderRadius: 6, background: '#ff5a4e', boxShadow: '0 0 16px 5px rgba(255,90,78,0.7)', transform: 'translateZ(-210px)' })} />
      <div style={abs({ left: -W / 2 - 5, top: -13, width: W + 10, height: 15, background: '#1c2333', transform: 'translateZ(4px)' })} />

      {/* costado */}
      <div style={abs({ left: W / 2, top: 0, width: DZ, height: H, transformOrigin: '0 0', transform: 'rotateY(90deg)' })}>
        <SideFace windows={side} />
      </div>

      {/* interior del lobby (se ve a través del vidrio) */}
      <div
        style={abs({
          left: -206,
          top: LOBBY_Y + 60,
          width: 412,
          height: LOBBY - 76,
          transform: 'translateZ(-150px)',
          background:
            'radial-gradient(ellipse 60% 70% at 26% 62%, rgba(255,199,44,0.55), rgba(255,199,44,0) 70%), linear-gradient(180deg, #4d3a16, #7a5e26 62%, #2f240f)',
        })}
      >
        {[60, 150, 262, 352].map((x) => (
          <span key={x} style={abs({ left: x - 5, top: 10, width: 10, height: 10, borderRadius: 5, background: '#fff3cf', boxShadow: '0 0 16px 6px rgba(255,236,180,0.7)' })} />
        ))}
        <span style={abs({ left: 250, top: 54, width: 96, height: 64, border: '3px solid #2a2010', background: 'linear-gradient(135deg, #b98a2e, #5c4417)' })} />
      </div>
      <div style={abs({ left: -206, top: H - 16, width: 412, height: 150, transformOrigin: '0 0', transform: 'rotateX(-90deg)', background: 'linear-gradient(180deg, #8a6b2a, #33270f)' })} />
      <svg viewBox="0 0 170 100" style={abs({ left: 52, top: H - 16 - 100, width: 170, height: 100, transform: 'translateZ(-96px)' })} aria-hidden="true">
        <g fill="#120d05" opacity="0.92">
          <rect x="6" y="52" width="104" height="30" rx="9" />
          <rect x="0" y="34" width="22" height="50" rx="9" />
          <rect x="94" y="34" width="22" height="50" rx="9" />
          <rect x="134" y="62" width="24" height="38" rx="4" />
          <circle cx="146" cy="42" r="19" />
          <circle cx="133" cy="26" r="13" />
          <circle cx="158" cy="22" r="14" />
        </g>
      </svg>
      <div style={abs({ left: -236, top: H - 250, width: 250, height: 250, transform: 'translateZ(-62px)', background: 'radial-gradient(closest-side, rgba(255,199,44,0.6), rgba(255,199,44,0))' })} />
      <img ref={refs.idle} src="/mascota/puntomatica-frontal.svg" alt="" style={abs({ left: -202, top: H - 16 - 180, width: 180, height: 180, maxWidth: 'none', transform: 'translateZ(-54px)', transition: 'opacity 400ms ease' })} />
      <img ref={refs.wave} src="/mascota/puntomatica-saludando.svg" alt="" style={abs({ left: -202, top: H - 16 - 180, width: 180, height: 180, maxWidth: 'none', transform: 'translateZ(-54px)', transition: 'opacity 400ms ease', opacity: 0 })} />

      {/* frente */}
      <div style={abs({ left: -W / 2, top: 0, width: W, height: H })}>
        <FrontFace windows={front} />
      </div>
      <div style={abs({ left: -W / 2, top: 0, width: W, height: H, transform: 'translateZ(1px)', filter: 'blur(11px)', opacity: 0.5, pointerEvents: 'none' })}>
        <Bloom windows={front} width={W} />
      </div>
      {/* televisores encendidos */}
      {tvs.map((w, i) => (
        <div
          key={i}
          className="anim-tv"
          style={abs({ left: w.x - W / 2, top: w.y, width: WW, height: WH, background: '#6fb1ff', transform: 'translateZ(0.6px)', animationDelay: `${(i * 0.7) % 3}s` })}
        />
      ))}
      {/* la ventana de la historia y su antojo */}
      <div
        className="anim-blink"
        style={abs({ left: story.x - W / 2 - 6, top: story.y - 6, width: WW + 12, height: WH + 12, borderRadius: 6, border: '2.5px solid #FFC72C', boxShadow: '0 0 22px rgba(255,199,44,0.7)', transform: 'translateZ(2px)' })}
      />
      <div className="anim-float" style={abs({ left: story.x - W / 2 - 74, top: -92, width: 96, height: 106, transform: 'translateZ(26px)' })}>
        <svg viewBox="0 0 96 106" width="96" height="106" aria-hidden="true">
          <path d="M14 4 h68 a12 12 0 0 1 12 12 v44 a12 12 0 0 1 -12 12 h-14 l10 26 l-30 -26 h-34 a12 12 0 0 1 -12 -12 v-44 a12 12 0 0 1 12 -12 z" fill="#fff" />
          {/* dona */}
          <circle cx="48" cy="38" r="22" fill="#D99A4E" />
          <path d="M27 36 a21 21 0 0 1 42 0 q-5 8 -11 2 q-5 7 -10 1 q-6 7 -11 0 q-5 5 -10 -3 z" fill="#F06A9B" />
          <circle cx="48" cy="38" r="7.5" fill="#fff" />
          <g stroke="#fff" strokeWidth="2.6" strokeLinecap="round">
            <path d="M36 26 l4 2" />
            <path d="M52 22 l1 4" />
            <path d="M60 30 l4 -2" />
            <path d="M42 20 l2 3" />
          </g>
        </svg>
      </div>

      {/* cornisas de cada piso: dan relieve real a la fachada */}
      {Array.from({ length: FLOORS }, (_, f) => (
        <div key={f} className="p3d" style={abs({ left: -W / 2 - 6, top: (f + 1) * FH, width: 0, height: 0 })}>
          <div style={abs({ left: 0, top: 0, width: W + 12, height: 12, transformOrigin: '0 0', transform: 'translateZ(12px) rotateX(-90deg)', background: '#27304a' })} />
          <div style={abs({ left: 0, top: 0, width: W + 12, height: 5, transform: 'translateZ(12px)', background: '#161c2a' })} />
        </div>
      ))}

      {/* marquesina y letrero del lobby */}
      <Box x={-250} y={LOBBY_Y + 44} z={78} w={500} h={15} d={78} front={{ background: '#1c2333' }} side={{ background: '#0e121b' }} top={{ background: '#28314a' }} />
      <div
        style={abs({
          left: -200,
          top: LOBBY_Y + 4,
          width: 400,
          height: 36,
          transform: 'translateZ(80px)',
          display: 'grid',
          placeItems: 'center',
          color: '#FFC72C',
          fontWeight: 600,
          fontSize: 21,
          letterSpacing: '0.26em',
          textShadow: '0 0 10px rgba(255,199,44,0.9), 0 0 26px rgba(255,199,44,0.5)',
          whiteSpace: 'nowrap',
        })}
      >
        MINI-MARKET 24/7
      </div>

      {/* ---------- Ascensor panorámico ---------- */}
      <div ref={refs.cable} style={abs({ left: -1, top: 0, width: 2, height: CAB_TOP, background: 'rgba(255,255,255,0.24)', transform: 'translateZ(17px)' })} />
      <div ref={refs.cabin} className="p3d will-change-transform" style={abs({ left: 0, top: 0, width: 0, height: 0, transform: `translate3d(0, ${CAB_TOP}px, 0)` })}>
        <div style={abs({ left: -150, top: -120, width: 300, height: 300, transform: 'translateZ(3px)', background: 'radial-gradient(closest-side, rgba(255,199,44,0.42), rgba(255,199,44,0))' })} />
        <Box
          x={-21}
          y={0}
          z={30}
          w={42}
          h={CABIN_H}
          d={26}
          front={{ background: 'linear-gradient(180deg, #FFF1C9, #FFC72C)', borderRadius: 4, boxShadow: '0 0 0 2px #FFC72C, 0 0 26px rgba(255,199,44,0.85)' }}
          side={{ background: '#d9a520' }}
          top={{ background: '#fff3cf' }}
        >
          <svg viewBox="0 0 42 58" width="42" height={CABIN_H} aria-hidden="true">
            <circle cx="21" cy="22" r="7" fill="#1a1408" />
            <path d="M10 54 q0 -24 11 -24 q11 0 11 24 z" fill="#1a1408" />
          </svg>
        </Box>
      </div>
      <Box
        x={-27}
        y={6}
        z={34}
        w={54}
        h={H - 22}
        d={34}
        front={{
          background: `repeating-linear-gradient(180deg, rgba(190,215,255,0.28) 0 2px, transparent 2px ${FH}px), linear-gradient(90deg, rgba(160,200,255,0.16), rgba(160,200,255,0.03) 45%, rgba(160,200,255,0.18))`,
          boxShadow: 'inset 0 0 0 1.5px rgba(190,215,255,0.34)',
        }}
        side={{
          background: `repeating-linear-gradient(180deg, rgba(190,215,255,0.22) 0 2px, transparent 2px ${FH}px), rgba(160,200,255,0.10)`,
          boxShadow: 'inset 0 0 0 1.5px rgba(190,215,255,0.26)',
        }}
      />

      {/* ---------- Calle ---------- */}
      <Tree x={-470} z={150} h={300} />
      <Tree x={300} z={170} h={270} />
      <Lamp x={-420} z={190} />
      <Lamp x={340} z={190} />
      <div className="p3d" style={abs({ left: 0, top: H - 26, width: 0, height: 0, transform: 'translateZ(400px)' })}>
        <div className="anim-drive" style={abs({ left: -90, top: 0, width: 180, height: 9, borderRadius: 5, background: 'linear-gradient(90deg, rgba(255,255,255,0), #fff6d8)', boxShadow: '0 0 14px rgba(255,246,216,0.8)' })} />
      </div>
      <div className="p3d" style={abs({ left: 0, top: H - 24, width: 0, height: 0, transform: 'translateZ(470px)' })}>
        <div className="anim-drive" style={abs({ left: -90, top: 0, width: 160, height: 8, borderRadius: 4, background: 'linear-gradient(90deg, #ff3b30, rgba(255,59,48,0))', boxShadow: '0 0 12px rgba(255,59,48,0.8)', animationDirection: 'reverse', animationDuration: '12s', animationDelay: '-5s' })} />
      </div>
    </div>
  );
});

// ---------------------------------------------------------------------------
// Ciudad lejana (también la usa el pie de página)
// ---------------------------------------------------------------------------
export function Skyline({ seed, color, lit }: { seed: number; color: string; lit: string }) {
  const blocks = useMemo(() => {
    const rnd = seeded(seed);
    const out: { x: number; w: number; h: number; wins: [number, number][] }[] = [];
    let x = -20;
    while (x < 1460) {
      const w = 50 + rnd() * 90;
      const h = 90 + rnd() * 250;
      const wins: [number, number][] = [];
      for (let i = 0; i < 9; i++) wins.push([8 + rnd() * (w - 20), 12 + rnd() * (h - 30)]);
      out.push({ x, w, h, wins });
      x += w + 4 + rnd() * 16;
    }
    return out;
  }, [seed]);
  return (
    <svg viewBox="0 0 1440 360" preserveAspectRatio="xMidYMax slice" className="w-full h-full" aria-hidden="true">
      {blocks.map((b, i) => (
        <g key={i}>
          <rect x={b.x} y={360 - b.h} width={b.w} height={b.h} fill={color} />
          {b.wins.map(([wx, wy], j) => (
            <rect key={j} x={b.x + wx} y={360 - b.h + wy} width="4" height="5" fill={lit} />
          ))}
        </g>
      ))}
    </svg>
  );
}

/** Palabras que suben una a una desde detrás de un borde. */
function Words({ text }: { text: string }) {
  return (
    <>
      {text.split(' ').map((word, i) => (
        <span key={i}>
          <span className="wr" style={{ '--i': i } as CSSProperties}>
            <span>{word}</span>
          </span>{' '}
        </span>
      ))}
    </>
  );
}

/** Visor del ascensor: piso actual (o L de lobby). */
function FloorBadge({ floor, className = '' }: { floor: number; className?: string }) {
  return (
    <div className={`items-center gap-2 lg:gap-3 liquid-glass rounded-xl pl-2 pr-3 py-1 lg:pl-3 lg:pr-4 lg:py-2 ${className}`}>
      <span className="relative grid place-items-center w-6 h-8 lg:w-7 lg:h-9 text-brand">
        {floor === 0 ? <span className="w-2.5 h-2.5 rounded-full bg-brand shadow-[0_0_12px_rgba(255,199,44,0.9)]" /> : <ChevronDown size={20} className="anim-chevron" />}
      </span>
      <span key={floor} className="anim-rise text-2xl lg:text-4xl font-light tabular-nums w-[1.4em] text-center" style={{ letterSpacing: '-0.04em' }}>
        {floor === 0 ? 'L' : floor}
      </span>
      <span className="text-[10px] leading-tight tracking-[0.22em] text-gray-300">
        {floor === 0 ? 'LOBBY' : 'PISO'}
        <br />
        <span className="text-white/40">23:47</span>
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sección
// ---------------------------------------------------------------------------
export default function BuildingDescent() {
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const world = useRef<HTMLDivElement>(null);
  const cabin = useRef<HTMLDivElement>(null);
  const cable = useRef<HTMLDivElement>(null);
  const idle = useRef<HTMLImageElement>(null);
  const wave = useRef<HTMLImageElement>(null);
  const far = useRef<HTMLDivElement>(null);
  const near = useRef<HTMLDivElement>(null);
  const sky = useRef<HTMLDivElement>(null);
  const marker = useRef<HTMLDivElement>(null);
  const textBox = useRef<HTMLDivElement>(null);
  const shade = useRef<HTMLDivElement>(null);
  const exit = useRef<HTMLDivElement>(null);
  const refs = useMemo<SceneRefs>(() => ({ world, cabin, cable, idle, wave }), []);

  const [step, setStep] = useState(0);
  const [floor, setFloor] = useState(FLOORS); // 0 = lobby
  const state = useRef({ step: 0, floor: FLOORS });

  const stars = useMemo(() => {
    const rnd = seeded(5);
    return Array.from({ length: 90 }, () => ({ x: rnd() * 100, y: rnd() * 78, r: 0.5 + rnd() * 1.3, o: 0.3 + rnd() * 0.6, tw: rnd() < 0.3, d: rnd() * 4 }));
  }, []);

  useScrollProgress(
    section,
    (p) => {
      const st = stage.current;
      if (!st || !world.current) return;
      const vw = st.clientWidth;
      const wide = vw >= 1024;
      // En celular se encuadra en la parte realmente visible (sin la barra del navegador)
      const vh = wide ? st.clientHeight : Math.min(st.clientHeight, window.innerHeight || st.clientHeight);

      // Tres momentos: plano general de la azotea, descenso, llegada al lobby.
      // La llegada termina antes del final del recorrido: el último tramo queda quieto,
      // para que la sección se suelte sin que la escena siga moviéndose.
      const intro = 1 - easeOut(span(p, 0, 0.11));
      const q = easeInOut(span(p, 0.05, 0.82));
      const outro = easeInOut(span(p, 0.8, 0.94));
      const cabinY = lerp(CAB_TOP, CAB_END, q);

      const base = wide ? Math.min(1.05, (vw * 0.4) / 560, vh / 800) : Math.min(0.85, (vw * 0.84) / 560);
      let zoom = base * (1 - (wide ? 0.36 : 0.2) * intro + (wide ? 0.2 : 0) * outro);
      const ry = -30 - 9 * intro + 11 * q + 7 * outro;
      const rx = -4 - 10 * intro - 3 * outro;
      const fx = lerp(0, -70, outro);
      const fy = lerp(cabinY + CABIN_H / 2 - 250 * intro, H - 126, outro);
      const cx = wide ? vw * 0.66 - 40 * base : vw * 0.45;
      let cy: number;
      if (wide) {
        cy = vh * lerp(0.54, 0.6, outro);
      } else {
        // En celular el texto va arriba: la escena se acomoda en el espacio libre que queda debajo
        const textBottom = textBox.current ? textBox.current.getBoundingClientRect().bottom - st.getBoundingClientRect().top : vh * 0.5;
        const free = Math.max(160, vh - textBottom);
        const descent = Math.max(vh * 0.64, textBottom + free * 0.42);
        // Al llegar, el lobby completo (del letrero a la vereda, ~330 px del mundo) cabe en ese espacio
        const arrive = Math.min(base * 1.3, Math.max(base * 0.7, (free - 40) / 330));
        zoom = lerp(zoom, arrive, outro);
        cy = lerp(descent, textBottom + free * 0.52 + 12 * zoom, outro);
        if (shade.current) shade.current.style.height = `${Math.round(textBottom + 70)}px`;
      }

      st.style.perspectiveOrigin = `${cx.toFixed(1)}px ${cy.toFixed(1)}px`;
      world.current.style.transform =
        `translate3d(${cx.toFixed(1)}px, ${cy.toFixed(1)}px, 0) scale3d(${zoom.toFixed(4)}, ${zoom.toFixed(4)}, ${zoom.toFixed(4)}) ` +
        `rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) translate3d(${(-fx).toFixed(1)}px, ${(-fy).toFixed(1)}px, 0)`;

      if (cabin.current) cabin.current.style.transform = `translate3d(0, ${cabinY.toFixed(1)}px, 0)`;
      if (cable.current) cable.current.style.height = `${cabinY.toFixed(1)}px`;

      // Fondo con profundidad
      if (far.current) far.current.style.transform = `translate3d(0, ${lerp(52, 0, q).toFixed(2)}%, 0)`;
      if (near.current) near.current.style.transform = `translate3d(0, ${lerp(88, 0, q).toFixed(2)}%, 0)`;
      if (sky.current) sky.current.style.transform = `translate3d(0, ${lerp(0, -20, q).toFixed(2)}%, 0)`;
      if (marker.current) marker.current.style.transform = `translateY(${(q * 100).toFixed(2)}%)`;
      // Al final la parte de abajo se funde a negro, igual que el inicio de la sección siguiente
      if (exit.current) exit.current.style.opacity = outro.toFixed(3);

      // La mascota saluda al llegar
      const arrived = p > 0.86;
      if (idle.current) idle.current.style.opacity = arrived ? '0' : '1';
      if (wave.current) wave.current.style.opacity = arrived ? '1' : '0';

      // Estado visible (solo se actualiza cuando cambia)
      const idx = Math.floor((cabinY + CABIN_H / 2) / FH);
      const fl = idx >= FLOORS ? 0 : FLOORS - idx;
      let s = 0;
      STEPS.forEach((it, i) => {
        if (p >= it.from) s = i;
      });
      if (fl !== state.current.floor) {
        state.current.floor = fl;
        setFloor(fl);
      }
      if (s !== state.current.step) {
        state.current.step = s;
        setStep(s);
      }
    },
    120,
  );

  return (
    <section ref={section} id="nosotros" className="relative h-[480vh] bg-[#04050a]">
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* Cielo */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#02030a] via-[#070c1a] to-[#101a30]" />
        <div ref={sky} className="absolute inset-0 will-change-transform">
          {stars.map((s, i) => (
            <span
              key={i}
              className={`absolute rounded-full bg-white ${s.tw ? 'anim-twinkle' : ''}`}
              style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.r * 2, height: s.r * 2, opacity: s.o, '--o': s.o, animationDelay: `${s.d}s` } as CSSProperties}
            />
          ))}
          <div className="absolute left-[62%] lg:left-[30%] top-[14%] lg:top-[9%] w-14 h-14 md:w-24 md:h-24 rounded-full bg-[#f6f1e3] shadow-[0_0_90px_30px_rgba(246,241,227,0.16)]">
            <span className="absolute left-[22%] top-[26%] w-[18%] h-[18%] rounded-full bg-black/10" />
            <span className="absolute left-[54%] top-[52%] w-[26%] h-[26%] rounded-full bg-black/10" />
            <span className="absolute left-[58%] top-[18%] w-[12%] h-[12%] rounded-full bg-black/10" />
          </div>
          <div className="anim-drift absolute inset-x-0 top-[20%] h-[22%]">
            <span className="absolute left-[18%] top-0 w-[38%] h-full rounded-full bg-[#2a3a5c]/25 blur-3xl" />
            <span className="absolute left-[58%] top-[30%] w-[30%] h-[80%] rounded-full bg-[#2a3a5c]/20 blur-3xl" />
          </div>
        </div>

        {/* Ciudad lejana y bruma */}
        <div ref={far} className="absolute inset-x-0 bottom-0 h-[64vh] will-change-transform opacity-70">
          <Skyline seed={3} color="#0a1020" lit="#3d4f78" />
        </div>
        <div ref={near} className="absolute inset-x-0 bottom-0 h-[46vh] will-change-transform opacity-90">
          <Skyline seed={9} color="#080c16" lit="#b98a2e" />
        </div>
        <div className="absolute inset-x-0 bottom-0 h-[45%] bg-gradient-to-t from-[#0b1222] via-[#0b1222]/50 to-transparent" />

        {/* Escena 3D */}
        <div ref={stage} className="absolute inset-0" style={{ perspective: '2000px' }} aria-hidden="true">
          <World refs={refs} />
        </div>

        {/* Luz y contraste para el texto */}
        <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_240px_rgba(0,0,0,0.75)]" />
        <div className="hidden lg:block absolute inset-y-0 left-0 w-[58%] pointer-events-none bg-gradient-to-r from-[#03040a] via-[#03040a]/85 to-transparent" />
        {/* En celular, oscurece solo la franja del texto (su alto se ajusta al texto) */}
        <div
          ref={shade}
          className="lg:hidden absolute inset-x-0 top-0 h-[55%] pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, #03040a 0%, rgba(3,4,10,0.92) calc(100% - 90px), rgba(3,4,10,0) 100%)' }}
        />
        <div
          ref={exit}
          className="absolute inset-x-0 bottom-0 h-[20%] pointer-events-none bg-gradient-to-t from-black via-black/70 to-transparent opacity-0"
        />

        {/* Indicador del ascensor: en celular va abajo, como el visor de una cabina */}
        <FloorBadge floor={floor} className="inline-flex lg:hidden absolute left-4 top-[calc(100svh-4.25rem)]" />

        {/* Relato */}
        <div className="absolute left-6 right-6 top-[5.25rem] md:top-24 md:left-12 lg:left-16 lg:right-auto lg:top-1/2 lg:-translate-y-1/2 lg:w-[40%] xl:w-[37%]">
          <FloorBadge floor={floor} className="hidden lg:inline-flex mb-8" />

          <div ref={textBox} className="grid">
            {STEPS.map((s, i) => (
              <div key={i} className={`step col-start-1 row-start-1 self-start ${i === step ? 'is-on' : i < step ? 'is-out' : ''}`}>
                <p className="fade text-xs md:text-sm uppercase tracking-[0.2em] text-brand mb-3 md:mb-4">{s.eyebrow}</p>
                <h2 className="text-[1.5rem] min-[360px]:text-[1.75rem] sm:text-[2rem] leading-[1.08] md:text-5xl xl:text-6xl font-normal md:leading-[1.03]" style={{ letterSpacing: '-0.04em' }}>
                  <Words text={s.title} />
                </h2>
                {s.text && (
                  <p className="fade mt-3 md:mt-5 text-sm md:text-lg text-gray-300 max-w-lg">
                    {s.text}
                    {s.more && <span className="hidden sm:inline">{s.more}</span>}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Riel de pisos */}
        <div className="hidden md:flex absolute right-6 lg:right-8 top-1/2 -translate-y-1/2 h-[46vh] flex-col items-center text-[10px] tracking-[0.2em] text-white/50">
          <span className="mb-2">16</span>
          <div className="relative flex-1 w-px bg-white/15">
            {Array.from({ length: FLOORS + 1 }, (_, i) => (
              <span key={i} className="absolute -left-1 w-2 h-px bg-white/25" style={{ top: `${(i / FLOORS) * 100}%` }} />
            ))}
            <div ref={marker} className="absolute inset-0 will-change-transform">
              <span className="absolute -left-[5px] -top-[5px] w-[11px] h-[11px] rounded-full bg-brand shadow-[0_0_14px_rgba(255,199,44,0.9)]" />
            </div>
          </div>
          <span className="mt-2">L</span>
        </div>
      </div>
    </section>
  );
}
