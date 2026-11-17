import { CSSProperties, ReactNode, useRef, useState } from 'react';
import { ArrowRight, CreditCard, Eye, LayoutGrid, PackageOpen, Radio, Snowflake } from 'lucide-react';
import { clamp, easeInOut, span, useScrollProgress } from '../lib/scroll';

// Medidas de la máquina (px antes de escalar)
const W = 320;
const H = 540;
const D = 220;
const FRONT = D / 2;

/** Tramos del scroll (0..1) */
const T = {
  turn: [0.02, 0.14],
  open: [0.1, 0.27],
  steps: [0.27, 0.81],
  close: [0.81, 0.95],
} as const;
const STEP_LEN = (T.steps[1] - T.steps[0]) / 6;

type Part = {
  id: string;
  x: number;
  y: number;
  z: number;
  w: number;
  h: number;
  /** Cuánto se aleja al desarmarse */
  ex: [number, number, number];
  /** Orden de salida (0 = primero, 1 = último) */
  order: number;
  /** Paso del relato en que esta pieza es protagonista */
  step: number;
};

const SHELVES = [0, 1, 2, 3, 4];

const PARTS: Part[] = [
  { id: 'door', x: 10, y: 46, z: FRONT, w: 212, h: 358, ex: [-30, 0, 340], order: 0, step: 0 },
  { id: 'pay', x: 228, y: 46, z: FRONT, w: 82, h: 358, ex: [120, -10, 250], order: 0.08, step: 4 },
  { id: 'sign', x: 10, y: 8, z: FRONT, w: 300, h: 32, ex: [0, -95, 130], order: 0.15, step: -1 },
  { id: 'pickup', x: 10, y: 412, z: FRONT, w: 300, h: 118, ex: [0, 100, 200], order: 0.22, step: 5 },
  ...SHELVES.map<Part>((i) => ({
    id: `shelf${i}`,
    x: 18,
    y: 58 + i * 68,
    z: 0,
    w: 206,
    h: 64,
    ex: [0, (i - 2) * 12, 60 + i * 52],
    order: 0.3 + i * 0.07,
    step: 1,
  })),
  { id: 'board', x: 236, y: 70, z: 10, w: 64, h: 92, ex: [190, -70, -30], order: 0.7, step: 3 },
  { id: 'cool', x: 30, y: 424, z: -25, w: 230, h: 96, ex: [-10, 190, -40], order: 0.8, step: 2 },
];

const STEPS = [
  {
    icon: Eye,
    title: 'Vitrina a la vista',
    text: 'Abarrotes, snacks y bebidas a la vista de tu comunidad, de día y de noche.',
  },
  {
    icon: LayoutGrid,
    title: 'Bandejas adaptables',
    text: 'El catálogo se ajusta a lo que tu edificio consume: abarrotes esenciales, snacks, bebidas frías y hasta productos para mascotas.',
  },
  {
    icon: Snowflake,
    title: 'Refrigeración permanente',
    text: 'Bebidas a temperatura ideal las 24 horas.',
  },
  {
    icon: Radio,
    title: 'Monitoreo remoto',
    text: 'Controlamos el stock a distancia para que nunca falten productos.',
  },
  {
    icon: CreditCard,
    title: 'Pago en la misma máquina',
    text: 'Eliges tu producto, pagas y listo. A cualquier hora.',
  },
  {
    icon: PackageOpen,
    title: 'Retira y sube',
    text: 'Tu compra cae a la bandeja de retiro. De vuelta a tu departamento sin salir del edificio.',
  },
];

// ---------------------------------------------------------------------------
// Productos dibujados (cada fila es un SVG plano)
// ---------------------------------------------------------------------------
const PALETTES = [
  ['#F76B15', '#E5484D', '#30A46C', '#0090FF', '#F5D90A', '#E5484D'],
  ['#8E4EC6', '#F76B15', '#E5484D', '#0090FF', '#30A46C', '#D6409F'],
  ['#0090FF', '#46A758', '#E5484D', '#F5D90A', '#8E4EC6', '#F76B15', '#12A594', '#E5484D'],
  ['#E5484D', '#46A758', '#3E63DD', '#F76B15', '#E5484D', '#8E4EC6', '#12A594', '#F5D90A', '#3E63DD'],
];

function ProductRow({ kind, shift = 0 }: { kind: number; shift?: number }) {
  let body: ReactNode;
  if (kind === 0) {
    // bolsas de snack
    body = PALETTES[0].map((_, i, arr) => {
      const c = arr[(i + shift) % arr.length];
      const x = 8 + i * 33;
      return (
        <g key={i}>
          <path d={`M${x} 8 h26 l-2 5 l2 39 h-26 l2 -39 z`} fill={c} />
          <circle cx={x + 13} cy="32" r="7.5" fill="#fff" opacity="0.92" />
          <rect x={x + 3} y="8" width="20" height="3" rx="1.5" fill="#fff" opacity="0.4" />
        </g>
      );
    });
  } else if (kind === 1) {
    // galletas y barras
    body = PALETTES[1].map((_, i, arr) => {
      const c = arr[(i + shift) % arr.length];
      const x = 7 + i * 33;
      return (
        <g key={i}>
          <rect x={x} y="18" width="28" height="34" rx="3" fill={c} />
          <rect x={x} y="28" width="28" height="9" fill="#fff" opacity="0.88" />
          <rect x={x + 4} y="42" width="12" height="3" rx="1.5" fill="#fff" opacity="0.5" />
        </g>
      );
    });
  } else if (kind === 2) {
    // botellas
    body = PALETTES[2].map((_, i, arr) => {
      const c = arr[(i + shift) % arr.length];
      const x = 9 + i * 24.5;
      return (
        <g key={i}>
          <rect x={x + 5} y="5" width="6" height="9" rx="2" fill="#fff" opacity="0.9" />
          <rect x={x} y="12" width="16" height="40" rx="5" fill={c} />
          <rect x={x} y="26" width="16" height="11" fill="#fff" opacity="0.85" />
        </g>
      );
    });
  } else if (kind === 3) {
    // latas
    body = PALETTES[3].map((_, i, arr) => {
      const c = arr[(i + shift) % arr.length];
      const x = 7 + i * 21.8;
      return (
        <g key={i}>
          <rect x={x} y="22" width="16" height="30" rx="4" fill={c} />
          <rect x={x} y="31" width="16" height="8" fill="#fff" opacity="0.85" />
          <rect x={x + 2} y="22" width="12" height="3" rx="1.5" fill="#fff" opacity="0.5" />
        </g>
      );
    });
  } else {
    // abarrotes: aceite, tallarines, conservas, mayonesa, crema, aderezo
    body = (
      <>
        <rect x="14" y="4" width="7" height="9" rx="2" fill="#2f9e44" />
        <rect x="8" y="11" width="19" height="41" rx="5" fill="#F2C230" />
        <rect x="8" y="26" width="19" height="12" fill="#fff" opacity="0.85" />
        <rect x="36" y="14" width="26" height="38" rx="3" fill="#2B6CB0" />
        <rect x="41" y="22" width="16" height="16" rx="2" fill="#F6E3A1" />
        <rect x="71" y="36" width="26" height="16" rx="4" fill="#C9CED6" />
        <rect x="71" y="40" width="26" height="8" fill="#E5484D" />
        <rect x="71" y="19" width="26" height="16" rx="4" fill="#C9CED6" />
        <rect x="71" y="23" width="26" height="8" fill="#0090FF" />
        <rect x="108" y="16" width="22" height="7" rx="2" fill="#2B6CB0" />
        <rect x="106" y="22" width="26" height="30" rx="5" fill="#F4F1E6" />
        <rect x="106" y="32" width="26" height="10" fill="#F5D90A" />
        <rect x="141" y="18" width="24" height="34" rx="3" fill="#F4F1E6" />
        <rect x="141" y="18" width="24" height="10" rx="3" fill="#E5484D" />
        <rect x="179" y="6" width="7" height="9" rx="2" fill="#fff" />
        <rect x="174" y="13" width="17" height="39" rx="5" fill="#E5484D" />
        <rect x="174" y="27" width="17" height="11" fill="#fff" opacity="0.85" />
      </>
    );
  }
  return (
    <svg viewBox="0 0 206 54" width="206" height="54" className="block" aria-hidden="true">
      {body}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Piezas
// ---------------------------------------------------------------------------
const plane = (extra: CSSProperties): CSSProperties => ({ position: 'absolute', left: 0, top: 0, ...extra });

function Highlight({ style }: { style?: CSSProperties }) {
  return (
    <div
      className="absolute inset-0 rounded-[inherit] pointer-events-none"
      style={{
        opacity: 'var(--hl, 0)',
        transition: 'opacity 450ms ease',
        boxShadow: '0 0 0 2px #FFC72C, 0 0 38px rgba(255,199,44,0.45)',
        ...style,
      }}
    />
  );
}

function Cabinet() {
  const side = 'linear-gradient(180deg, #2a2a35 0%, #1b1b23 55%, #131319 100%)';
  return (
    <>
      {/* fondo interior con luz */}
      <div
        className="xp"
        style={plane({
          width: W,
          height: H,
          transform: `translateZ(${-FRONT}px)`,
          background:
            'radial-gradient(ellipse at 40% 34%, rgba(255,232,170,0.30), rgba(255,232,170,0.06) 45%, #101016 75%), #101016',
          boxShadow: 'inset 0 0 0 2px #23232d',
        })}
      />
      {/* costado izquierdo, con franja de marca */}
      <div
        className="xp"
        style={plane({ width: D, height: H, transformOrigin: '0 0', transform: `translateZ(${-FRONT}px) rotateY(-90deg)`, background: side, boxShadow: 'inset 0 0 0 2px #30303c' })}
      >
        <div className="absolute left-5 right-5 top-12 h-1.5 rounded-full bg-brand/80" />
        <div className="absolute left-5 top-[72px] text-[34px] font-semibold tracking-tight text-brand/90">24/7</div>
        <div className="absolute left-5 right-5 bottom-10 flex flex-col gap-2.5">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className="h-1.5 rounded-full bg-black/45" />
          ))}
        </div>
      </div>
      {/* costado derecho */}
      <div
        className="xp"
        style={plane({ left: W, width: D, height: H, transformOrigin: '0 0', transform: `translateZ(${-FRONT}px) rotateY(-90deg)`, background: side, boxShadow: 'inset 0 0 0 2px #30303c' })}
      />
      {/* techo y piso */}
      <div
        className="xp"
        style={plane({ width: W, height: D, transformOrigin: '0 0', transform: `translateZ(${-FRONT}px) rotateX(90deg)`, background: '#30303c', boxShadow: 'inset 0 0 0 2px #3c3c4a' })}
      />
      <div
        className="xp"
        style={plane({ top: H, width: W, height: D, transformOrigin: '0 0', transform: `translateZ(${-FRONT}px) rotateX(90deg)`, background: '#0c0c11' })}
      />
      {/* marco frontal */}
      <div
        className="xp rounded-[6px]"
        style={plane({ width: W, height: H, transform: `translateZ(${FRONT - 1}px)`, border: '7px solid #1c1c25', boxShadow: '0 0 0 1px #34343f' })}
      />
    </>
  );
}

function Door() {
  return (
    <div
      className="xp absolute inset-0 rounded-[8px]"
      style={{
        border: '9px solid #0f0f15',
        boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.22), 0 0 0 1px rgba(255,255,255,0.10)',
        background:
          'linear-gradient(115deg, rgba(255,255,255,0.13) 0%, rgba(255,255,255,0.02) 28%, rgba(255,255,255,0.09) 46%, rgba(255,255,255,0.01) 58%, rgba(255,255,255,0.06) 100%)',
      }}
    >
      <span className="absolute right-1 top-1/2 -translate-y-1/2 w-1.5 h-20 rounded-full bg-white/30" />
      <Highlight />
    </div>
  );
}

function Pay() {
  return (
    <div className="xp absolute inset-0 rounded-[8px] bg-[#121218]" style={{ boxShadow: 'inset 0 0 0 1px #34343f' }}>
      <div className="absolute left-2 right-2 top-3 h-12 rounded-md bg-black grid place-items-center" style={{ boxShadow: 'inset 0 0 0 1px #2c2c36' }}>
        <span className="text-brand text-[15px] font-semibold tracking-tight" style={{ textShadow: '0 0 10px rgba(255,199,44,0.8)' }}>
          24/7
        </span>
      </div>
      <div className="absolute left-3 right-3 top-[76px] grid grid-cols-3 gap-1.5">
        {Array.from({ length: 12 }, (_, i) => (
          <span key={i} className="h-3.5 rounded-[3px] bg-[#2a2a35]" />
        ))}
      </div>
      <div className="absolute left-2 right-2 top-[168px] h-16 rounded-md bg-[#1c1c25] grid place-items-center" style={{ boxShadow: 'inset 0 0 0 1px #3a3a47' }}>
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#FFC72C" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <path d="M6 8.5a8 8 0 0 1 0 7" />
          <path d="M10 6a12 12 0 0 1 0 12" />
          <path d="M14 3.5a17 17 0 0 1 0 17" />
        </svg>
      </div>
      <div className="absolute left-3 right-3 top-[250px] h-2 rounded-full bg-black" />
      <div className="absolute left-3 right-3 top-[264px] h-1 rounded-full bg-[#4ADE80]/80" />
      <div className="absolute left-1/2 -translate-x-1/2 bottom-6 w-3 h-10 rounded-full bg-black" style={{ boxShadow: '0 0 0 3px #2a2a35' }} />
      <Highlight />
    </div>
  );
}

function Sign() {
  return (
    <div
      className="xp absolute inset-0 rounded-[6px] bg-[#0b0b10] flex items-center justify-between px-4"
      style={{ boxShadow: 'inset 0 0 0 1px #34343f' }}
    >
      <span className="text-brand text-[15px] font-semibold tracking-tight" style={{ textShadow: '0 0 12px rgba(255,199,44,0.85)' }}>
        PuntoMatica
      </span>
      <span className="text-[10px] tracking-[0.3em] text-white/60">MINI-MARKET</span>
    </div>
  );
}

function Pickup() {
  return (
    <div className="xp absolute inset-0 rounded-[8px] bg-[#121218]" style={{ boxShadow: 'inset 0 0 0 1px #34343f' }}>
      <div
        className="absolute left-6 right-24 top-5 bottom-7 rounded-md bg-black grid place-items-center"
        style={{ boxShadow: 'inset 0 0 0 1px #3a3a47, inset 0 14px 18px rgba(255,255,255,0.05)' }}
      >
        <span className="text-[10px] tracking-[0.35em] text-white/55">RETIRA AQUÍ</span>
      </div>
      <div className="absolute right-6 top-6 w-12 h-12 rounded-md bg-[#1c1c25]" style={{ boxShadow: 'inset 0 0 0 1px #3a3a47' }} />
      <div className="absolute left-6 right-6 bottom-2.5 h-1.5 rounded-full bg-brand/85" />
      <Highlight />
    </div>
  );
}

function Shelf({ i }: { i: number }) {
  const kind = [0, 1, 2, 3, 4][i];
  const rows = [
    { z: 62, shift: 0, bright: 1 },
    { z: 0, shift: 2, bright: 0.72 },
    { z: -62, shift: 4, bright: 0.5 },
  ];
  return (
    <>
      {/* bandeja */}
      <div
        className="xp"
        style={plane({
          top: 56,
          width: 206,
          height: 160,
          transformOrigin: '0 0',
          transform: 'translateZ(-80px) rotateX(90deg)',
          background:
            'repeating-linear-gradient(90deg, rgba(255,255,255,0.14) 0 2px, transparent 2px 34px), repeating-linear-gradient(0deg, rgba(255,255,255,0.06) 0 2px, transparent 2px 9px), #1d1d26',
          boxShadow: 'inset 0 0 0 1px #3a3a47',
        })}
      />
      {rows.map((r) => (
        <div key={r.z} className="xp" style={plane({ transform: `translateZ(${r.z}px)`, filter: r.bright < 1 ? `brightness(${r.bright})` : undefined })}>
          <ProductRow kind={kind} shift={r.shift} />
        </div>
      ))}
      {/* borde frontal con precios */}
      <div className="xp rounded-[2px]" style={plane({ top: 55, width: 206, height: 9, transform: 'translateZ(80px)', background: '#0f0f15', boxShadow: '0 0 0 1px #3a3a47' })}>
        <div className="absolute inset-0 flex items-center justify-around px-2">
          {[0, 1, 2, 3, 4, 5].map((n) => (
            <span key={n} className="w-4 h-1 rounded-full bg-brand" />
          ))}
        </div>
        <Highlight style={{ boxShadow: '0 0 0 1.5px #FFC72C, 0 0 22px rgba(255,199,44,0.6)' }} />
      </div>
    </>
  );
}

function Board() {
  return (
    <div className="xp absolute inset-0 rounded-[6px]" style={{ background: 'linear-gradient(160deg, #136b52, #0c4435)', boxShadow: 'inset 0 0 0 1px #2aa37f' }}>
      <svg viewBox="0 0 64 92" className="absolute inset-0 w-full h-full overflow-visible" aria-hidden="true">
        <g stroke="#58d6ae" strokeWidth="1.4" fill="none" opacity="0.8">
          <path d="M8 80 V58 H22 V44" />
          <path d="M56 80 V64 H42 V50" />
          <path d="M14 12 H30 V26" />
          <path d="M50 30 V20 H40" />
        </g>
        <rect x="20" y="30" width="24" height="24" rx="3" fill="#0b0b10" stroke="#3a3a47" />
        <rect x="26" y="36" width="12" height="12" rx="1.5" fill="#FFC72C" />
        <circle cx="10" cy="84" r="2.5" fill="#FFC72C" />
        <circle cx="54" cy="84" r="2.5" fill="#FFC72C" />
        <line x1="50" y1="14" x2="50" y2="-22" stroke="#d7dbe2" strokeWidth="2.2" strokeLinecap="round" />
        <circle cx="50" cy="-24" r="4" fill="#FFC72C" />
        <circle cx="50" cy="-24" r="10" fill="none" stroke="#FFC72C" strokeWidth="1.6" className="anim-ping" />
        <circle cx="50" cy="-24" r="10" fill="none" stroke="#FFC72C" strokeWidth="1.6" className="anim-ping" style={{ animationDelay: '0.9s' }} />
      </svg>
      <Highlight />
    </div>
  );
}

function Cool() {
  return (
    <div className="xp absolute inset-0 rounded-[8px]" style={{ background: 'linear-gradient(180deg, #26303f, #151b25)', boxShadow: 'inset 0 0 0 1px #445168' }}>
      <svg viewBox="0 0 230 96" className="absolute inset-0 w-full h-full" aria-hidden="true">
        <circle cx="52" cy="48" r="34" fill="#0c1017" stroke="#445168" strokeWidth="2" />
        <g className="anim-spin">
          {[0, 72, 144, 216, 288].map((a) => (
            <path key={a} d="M52 48 C58 34 70 28 76 30 C74 40 64 48 52 48 Z" fill="#8fb8e8" opacity="0.9" transform={`rotate(${a} 52 48)`} />
          ))}
          <circle cx="52" cy="48" r="5" fill="#d7e6fa" />
        </g>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <rect key={i} x="104" y={18 + i * 11} width="80" height="5" rx="2.5" fill="#0c1017" />
        ))}
        <path d="M198 20 v56 M206 20 v56 M214 20 v56" stroke="#7ea6d6" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
      </svg>
      <Highlight />
    </div>
  );
}

const RENDER: Record<string, () => ReactNode> = {
  door: () => <Door />,
  pay: () => <Pay />,
  sign: () => <Sign />,
  pickup: () => <Pickup />,
  board: () => <Board />,
  cool: () => <Cool />,
};

// ---------------------------------------------------------------------------
// Sección
// ---------------------------------------------------------------------------
export default function ExplodedMachine() {
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const rig = useRef<HTMLDivElement>(null);
  const cabinet = useRef<HTMLDivElement>(null);
  const parts = useRef<(HTMLDivElement | null)[]>([]);
  const bar = useRef<HTMLDivElement>(null);
  // -1 = introducción, 0..5 = pasos, 6 = cierre
  const [phase, setPhase] = useState(-1);
  const phaseRef = useRef(-1);

  useScrollProgress(section, (p) => {
    const st = stage.current;
    if (!st || !rig.current) return;
    const sw = st.clientWidth;
    const sh = st.clientHeight;
    const narrow = sw < 640;
    const s = Math.min(1.05, (sh * 0.54) / H, (sw * (narrow ? 0.46 : 0.42)) / W);

    // Cuánto está desarmada (0 armada, 1 desarmada)
    const E = p < 0.5 ? span(p, T.open[0], T.open[1]) : 1 - span(p, T.close[0], T.close[1]);
    const turnIn = easeInOut(span(p, T.turn[0], T.turn[1]));
    const turnOut = easeInOut(span(p, T.close[0] + 0.02, T.close[1] + 0.01));
    const ry = 32 * turnIn - 8 * span(p, T.steps[0], T.steps[1]) - 24 * turnOut;
    const rx = -10 * turnIn + 10 * turnOut;
    const eAll = easeInOut(E);
    const shiftX = eAll * (narrow ? 62 : 105) * s;
    const shiftY = eAll * 44 * s;
    rig.current.style.transform = `translate3d(${(-shiftX).toFixed(1)}px, ${(-shiftY).toFixed(1)}px, 0) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) scale3d(${s.toFixed(4)}, ${s.toFixed(4)}, ${s.toFixed(4)})`;

    // Paso activo
    const inSteps = p >= T.steps[0] && p < T.steps[1];
    const focus = inSteps ? clamp(Math.floor((p - T.steps[0]) / STEP_LEN), 0, 5) : -1;
    const ph = p < T.steps[0] ? -1 : p >= T.steps[1] ? 6 : focus;
    if (ph !== phaseRef.current) {
      phaseRef.current = ph;
      setPhase(ph);
    }

    const STAGGER = 0.8;
    PARTS.forEach((part, i) => {
      const el = parts.current[i];
      if (!el) return;
      const e = easeInOut(clamp(E * (1 + STAGGER) - part.order * STAGGER));
      const x = part.x + part.ex[0] * e;
      const y = part.y + part.ex[1] * e;
      const z = part.z + part.ex[2] * e;
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, ${z.toFixed(1)}px)`;
      const isFocus = part.step === focus;
      el.style.setProperty('--o', focus < 0 || isFocus ? '1' : '0.14');
      el.style.setProperty('--hl', focus >= 0 && isFocus ? '1' : '0');
    });
    cabinet.current?.style.setProperty('--o', focus < 0 ? '1' : '0.5');

    if (bar.current) bar.current.style.transform = `scaleX(${p.toFixed(4)})`;
  }, 110);

  const step = phase >= 0 && phase <= 5 ? STEPS[phase] : null;
  const Icon = step?.icon;

  return (
    <section ref={section} id="por-dentro" className="relative h-[620vh] bg-black">
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* Fondo: foco de luz + cuadrícula de plano técnico */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 60% 55% at 68% 48%, rgba(255,199,44,0.10), transparent 70%), radial-gradient(ellipse 80% 60% at 60% 110%, rgba(255,255,255,0.06), transparent 60%)',
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
            backgroundSize: '56px 56px',
            maskImage: 'radial-gradient(ellipse 70% 65% at 65% 50%, #000 20%, transparent 75%)',
            WebkitMaskImage: 'radial-gradient(ellipse 70% 65% at 65% 50%, #000 20%, transparent 75%)',
          }}
        />

        {/* Escena 3D */}
        <div
          ref={stage}
          className="absolute inset-x-0 top-16 bottom-[38%] lg:top-0 lg:bottom-0 lg:left-[38%]"
          style={{ perspective: '1800px' }}
          aria-hidden="true"
        >
          <div ref={rig} className="p3d absolute left-1/2 top-1/2 w-0 h-0 will-change-transform">
            <div className="p3d absolute" style={{ width: W, height: H, left: -W / 2, top: -H / 2 }}>
              <div ref={cabinet} className="p3d absolute inset-0">
                <Cabinet />
              </div>
              {PARTS.map((part, i) => (
                <div
                  key={part.id}
                  ref={(el) => (parts.current[i] = el)}
                  className="p3d absolute left-0 top-0 will-change-transform"
                  style={{ width: part.w, height: part.h, transform: `translate3d(${part.x}px, ${part.y}px, ${part.z}px)` }}
                >
                  {part.id.startsWith('shelf') ? <Shelf i={Number(part.id.slice(5))} /> : RENDER[part.id]()}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Relato */}
        <div className="absolute left-6 right-6 bottom-8 md:left-12 lg:left-16 lg:right-auto lg:bottom-auto lg:top-1/2 lg:-translate-y-1/2 lg:w-[34%]">
          <p className="text-xs md:text-sm uppercase tracking-[0.2em] text-brand mb-3 md:mb-5">Por dentro</p>

          <div key={phase} className="anim-rise min-h-[168px] md:min-h-[230px]">
            {phase === -1 && (
              <>
                <h2 className="text-4xl md:text-6xl font-normal leading-[1.02]" style={{ letterSpacing: '-0.04em' }}>
                  Ábrela.
                </h2>
                <p className="mt-4 text-base md:text-lg text-gray-300 max-w-md">
                  Sigue bajando y mira, pieza por pieza, cómo funciona un mini-market que cabe en tu lobby.
                </p>
              </>
            )}
            {step && Icon && (
              <>
                <div className="flex items-center gap-3 mb-3 md:mb-4">
                  <span className="grid place-items-center w-10 h-10 md:w-12 md:h-12 rounded-xl liquid-glass text-brand">
                    <Icon size={20} />
                  </span>
                  <span className="text-sm text-gray-300 tabular-nums">
                    0{phase + 1} <span className="text-white/30">/ 06</span>
                  </span>
                </div>
                <h2 className="text-3xl md:text-5xl font-normal leading-[1.05]" style={{ letterSpacing: '-0.035em' }}>
                  {step.title}
                </h2>
                <p className="mt-3 md:mt-4 text-base md:text-lg text-gray-300 max-w-md">{step.text}</p>
              </>
            )}
            {phase === 6 && (
              <>
                <h2 className="text-4xl md:text-6xl font-normal leading-[1.02]" style={{ letterSpacing: '-0.04em' }}>
                  Lista para tu edificio.
                </h2>
                <p className="mt-4 text-base md:text-lg text-gray-300 max-w-md">
                  Instalación, reposición y mantención 100% a nuestro cargo.
                </p>
                <a
                  href="#contacto"
                  className="mt-5 inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-lg font-medium transition-colors hover:bg-gray-100"
                >
                  Yo quiero uno <ArrowRight size={18} />
                </a>
              </>
            )}
          </div>

          {/* Avance */}
          <div className="mt-5 md:mt-8 flex gap-1.5 max-w-xs">
            {STEPS.map((_, i) => (
              <span
                key={i}
                className="h-1 flex-1 rounded-full transition-colors duration-300"
                style={{ background: phase === 6 || (phase >= 0 && i <= phase) ? '#FFC72C' : 'rgba(255,255,255,0.18)' }}
              />
            ))}
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 h-px bg-white/10">
          <div ref={bar} className="h-full bg-brand origin-left" style={{ transform: 'scaleX(0)' }} />
        </div>
      </div>
    </section>
  );
}
