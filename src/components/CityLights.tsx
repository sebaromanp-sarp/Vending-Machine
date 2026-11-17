import { PointerEvent as ReactPointerEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Lightbulb, LightbulbOff } from 'lucide-react';
import { seeded } from '../lib/scroll';

// Lienzo del dibujo
const VW = 1440;
const VH = 320;
const GROUND = VH - 4;
// Ventanas
const CELL_W = 20;
const CELL_H = 24;
const WIN_W = 11;
const WIN_H = 15;
// Relieve lateral de cada edificio
const DX = 13;
const DY = 9;

type Win = { i: number; x: number; y: number; on: boolean };
type Building = {
  x: number;
  top: number;
  w: number;
  h: number;
  floors: number;
  roof: 'antenna' | 'tank' | 'none';
  wins: Win[];
};

function buildCity() {
  const rnd = seeded(77);
  const front: Building[] = [];
  let x = -14;
  let i = 0;
  while (x < VW + 20) {
    const cols = 3 + Math.floor(rnd() * 4);
    const floors = 5 + Math.floor(rnd() * 7);
    const w = cols * CELL_W + 14;
    const h = floors * CELL_H + 20;
    const top = GROUND - h;
    const wins: Win[] = [];
    for (let f = 0; f < floors; f++) {
      for (let c = 0; c < cols; c++) {
        wins.push({ i: i++, x: x + 7 + c * CELL_W + (CELL_W - WIN_W) / 2, y: top + 13 + f * CELL_H, on: rnd() < 0.4 });
      }
    }
    const r = rnd();
    front.push({ x, top, w, h, floors, roof: r < 0.3 ? 'antenna' : r < 0.6 ? 'tank' : 'none', wins });
    x += w + DX + 8 + rnd() * 18;
  }

  // Segunda fila, más lejos: solo siluetas con luces pequeñas
  const back: { x: number; w: number; h: number; dots: [number, number][] }[] = [];
  let bx = -30;
  while (bx < VW + 30) {
    const w = 60 + rnd() * 90;
    const h = 170 + rnd() * 130;
    const dots: [number, number][] = [];
    for (let k = 0; k < 14; k++) dots.push([6 + Math.floor(rnd() * ((w - 12) / 9)) * 9, 10 + Math.floor(rnd() * ((h - 20) / 11)) * 11]);
    back.push({ x: bx, w, h, dots });
    bx += w + 6 + rnd() * 30;
  }
  return { front, back, total: i };
}

export default function CityLights() {
  const svg = useRef<SVGSVGElement>(null);
  const city = useMemo(buildCity, []);
  const lit = useRef<Element[]>([]);
  const glow = useRef<Element[]>([]);
  const on = useRef<boolean[]>([]);
  const painting = useRef<boolean | null>(null);
  const [count, setCount] = useState(() => city.front.reduce((n, b) => n + b.wins.filter((w) => w.on).length, 0));

  useEffect(() => {
    const root = svg.current;
    if (!root) return;
    root.querySelectorAll('[data-lit]').forEach((el) => (lit.current[Number(el.getAttribute('data-lit'))] = el));
    root.querySelectorAll('[data-glow]').forEach((el) => (glow.current[Number(el.getAttribute('data-glow'))] = el));
    city.front.forEach((b) => b.wins.forEach((w) => (on.current[w.i] = w.on)));
  }, [city]);

  const setWindow = (i: number, state: boolean) => {
    if (on.current[i] === state) return false;
    on.current[i] = state;
    lit.current[i]?.classList.toggle('on', state);
    glow.current[i]?.classList.toggle('on', state);
    return true;
  };
  const recount = () => setCount(on.current.filter(Boolean).length);

  const indexAt = (e: ReactPointerEvent) => {
    const el = document.elementFromPoint(e.clientX, e.clientY);
    const v = el?.getAttribute('data-i');
    return v == null ? -1 : Number(v);
  };

  // Clic: cambia una ventana. Arrastrar: "pinta" el mismo estado en las que se cruzan.
  const onDown = (e: ReactPointerEvent) => {
    const i = indexAt(e);
    if (i < 0) return;
    const state = !on.current[i];
    painting.current = state;
    if (setWindow(i, state)) recount();
  };
  const onMove = (e: ReactPointerEvent) => {
    if (painting.current === null) return;
    if (e.pointerType === 'mouse' && e.buttons === 0) {
      painting.current = null;
      return;
    }
    const i = indexAt(e);
    if (i >= 0 && setWindow(i, painting.current)) recount();
  };
  const stop = () => {
    painting.current = null;
  };

  const toggleAll = () => {
    const state = count === 0;
    for (let i = 0; i < city.total; i++) setWindow(i, state);
    recount();
  };

  const drawing = useMemo(() => {
    const wins = city.front.flatMap((b) => b.wins);
    return (
      <>
        <defs>
          <linearGradient id="cbFront" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#0f131c" />
            <stop offset="1" stopColor="#171d2a" />
          </linearGradient>
          <linearGradient id="cbSide" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#090c12" />
            <stop offset="1" stopColor="#05070b" />
          </linearGradient>
          <linearGradient id="cwWarm" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#FFF0BF" />
            <stop offset="1" stopColor="#FFC72C" />
          </linearGradient>
          <filter id="cwBlur" filterUnits="userSpaceOnUse" x="0" y="0" width={VW} height={VH}>
            <feGaussianBlur stdDeviation="5" />
          </filter>
        </defs>

        {/* fila lejana */}
        <g opacity="0.75">
          {city.back.map((b, k) => (
            <g key={k}>
              <rect x={b.x} y={GROUND - b.h} width={b.w} height={b.h} fill="#080b13" />
              {b.dots.map(([dx, dy], j) => (
                <rect key={j} x={b.x + dx} y={GROUND - b.h + dy} width="4" height="5" fill="#b98a2e" opacity="0.55" />
              ))}
            </g>
          ))}
        </g>

        {/* edificios */}
        {city.front.map((b, k) => (
          <g key={k}>
            {/* costado y techo: dan volumen */}
            <path d={`M${b.x + b.w} ${b.top} l${DX} ${-DY} V${GROUND} H${b.x + b.w} z`} fill="url(#cbSide)" />
            <path d={`M${b.x} ${b.top} l${DX} ${-DY} h${b.w} l${-DX} ${DY} z`} fill="#222a3c" />
            <rect x={b.x} y={b.top} width={b.w} height={b.h} fill="url(#cbFront)" />
            <rect x={b.x - 1} y={b.top - 2} width={b.w + 2} height="4" fill="#232b3d" />
            {Array.from({ length: b.floors }, (_, f) => (
              <rect key={f} x={b.x} y={b.top + 13 + f * CELL_H + WIN_H + 3} width={b.w} height="2" fill="#1d2433" />
            ))}
            {b.roof === 'antenna' && (
              <>
                <line x1={b.x + b.w * 0.6} y1={b.top - DY} x2={b.x + b.w * 0.6} y2={b.top - DY - 30} stroke="#2a3246" strokeWidth="2" />
                <circle cx={b.x + b.w * 0.6} cy={b.top - DY - 31} r="2.4" fill="#ff5a4e" className="anim-blink" style={{ animationDelay: `${k * 0.4}s` }} />
              </>
            )}
            {b.roof === 'tank' && (
              <>
                <rect x={b.x + b.w * 0.3} y={b.top - DY - 13} width="24" height="15" rx="2" fill="#151b28" />
                <path d={`M${b.x + b.w * 0.3 + 24} ${b.top - DY - 13} l6 -4 v15 l-6 4 z`} fill="#0b0e15" />
              </>
            )}
            {/* ventanas apagadas */}
            {b.wins.map((w) => (
              <rect key={w.i} x={w.x} y={w.y} width={WIN_W} height={WIN_H} fill="#0a0e16" />
            ))}
          </g>
        ))}

        {/* resplandor de las ventanas encendidas */}
        <g filter="url(#cwBlur)">
          {wins.map((w) => (
            <rect key={w.i} data-glow={w.i} className={`cw-glow ${w.on ? 'on' : ''}`} x={w.x - 3} y={w.y - 3} width={WIN_W + 6} height={WIN_H + 6} fill="#FFC72C" />
          ))}
        </g>
        {/* luz */}
        <g>
          {wins.map((w) => (
            <g key={w.i} data-lit={w.i} className={`cw-lit ${w.on ? 'on' : ''}`}>
              <rect x={w.x} y={w.y} width={WIN_W} height={WIN_H} fill="url(#cwWarm)" />
              <rect x={w.x + WIN_W / 2 - 0.5} y={w.y} width="1" height={WIN_H} fill="#0a0e16" opacity="0.7" />
            </g>
          ))}
        </g>
        {/* zona de clic (toda la celda, para que sea fácil acertar) */}
        <g>
          {wins.map((w) => (
            <rect
              key={w.i}
              data-i={w.i}
              className="cw-hit"
              x={w.x - (CELL_W - WIN_W) / 2}
              y={w.y - (CELL_H - WIN_H) / 2}
              width={CELL_W}
              height={CELL_H}
            />
          ))}
        </g>

        <rect x="0" y={GROUND} width={VW} height={VH - GROUND} fill="#10141d" />
      </>
    );
  }, [city]);

  const allOff = count === 0;

  return (
    <div className="select-none bg-gradient-to-b from-black via-[#060912] to-[#0f1830]">
      <div className="px-6 md:px-12 lg:px-16 pt-8 pb-2 flex items-center justify-between gap-4">
        <p className="text-xs md:text-sm text-white/55">Toca las ventanas para prender o apagar sus luces.</p>
        <button
          type="button"
          onClick={toggleAll}
          className="shrink-0 liquid-glass border border-white/20 rounded-lg px-4 py-2 text-xs md:text-sm font-medium flex items-center gap-2 transition-colors hover:bg-white hover:text-black"
        >
          {allOff ? <Lightbulb size={16} /> : <LightbulbOff size={16} />}
          {allOff ? 'Encender todas' : 'Apagar todas'}
        </button>
      </div>
      <div className="relative h-72 md:h-80">
      <div
        className="absolute inset-x-0 bottom-0 h-2/3 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 70% 100% at 50% 100%, rgba(255,199,44,0.10), transparent 70%)' }}
      />
      <svg
        ref={svg}
        viewBox={`0 0 ${VW} ${VH}`}
        preserveAspectRatio="xMidYMax slice"
        className="absolute inset-0 w-full h-full"
        style={{ touchAction: 'pan-y' }}
        aria-hidden="true"
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={stop}
        onPointerLeave={stop}
        onPointerCancel={stop}
      >
        {drawing}
      </svg>

      </div>
    </div>
  );
}
