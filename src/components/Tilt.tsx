import { CSSProperties, PointerEvent as ReactPointerEvent, ReactNode, useRef } from 'react';

const MAX = 12; // grados de inclinación máxima

let reduceMotion: boolean | null = null;
function prefersReduced() {
  if (reduceMotion === null) {
    try {
      reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch {
      reduceMotion = false;
    }
  }
  return reduceMotion;
}

/**
 * Tarjeta 3D: se inclina siguiendo el mouse, un brillo sigue al cursor y las capas
 * interiores (`Layer`) se separan en profundidad. En pantallas táctiles reacciona al
 * tocarla con un pequeño "hundimiento" hacia el punto tocado.
 */
export function TiltCard({ children, className = '', faceClassName = '' }: { children: ReactNode; className?: string; faceClassName?: string }) {
  const card = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  const aim = (e: ReactPointerEvent, strength = 1) => {
    const el = card.current;
    if (!el || prefersReduced()) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    el.style.setProperty('--ry', `${((px - 0.5) * 2 * MAX * strength).toFixed(2)}deg`);
    el.style.setProperty('--rx', `${(-(py - 0.5) * 2 * MAX * strength).toFixed(2)}deg`);
    el.style.setProperty('--mx', `${(px * 100).toFixed(1)}%`);
    el.style.setProperty('--my', `${(py * 100).toFixed(1)}%`);
    el.classList.add('is-active');
  };
  const release = () => {
    const el = card.current;
    if (!el) return;
    el.classList.remove('is-active');
    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');
  };

  return (
    <div className={`tilt-wrap h-full ${className}`}>
      <div
        ref={card}
        className="tilt h-full rounded-2xl"
        onPointerMove={(e) => e.pointerType !== 'touch' && aim(e)}
        onPointerLeave={(e) => e.pointerType !== 'touch' && release()}
        onPointerDown={(e) => {
          if (e.pointerType !== 'touch') return;
          if (timer.current) clearTimeout(timer.current);
          aim(e, 0.6);
          timer.current = setTimeout(release, 650);
        }}
      >
        <div className="tilt-slab" aria-hidden="true" />
        <div className={`tilt-face ${faceClassName}`} aria-hidden="true">
          <div className="tilt-grid" />
          <div className="tilt-glare" />
        </div>
        <div className="relative p3d h-full">{children}</div>
      </div>
    </div>
  );
}

/** Capa que se despega de la tarjeta `z` px al pasar el mouse (y un poco en reposo). */
export function Layer({ z, children, className = '', style }: { z: number; children: ReactNode; className?: string; style?: CSSProperties }) {
  return (
    <div className={`tz ${className}`} style={{ '--z': `${z}px`, ...style } as CSSProperties}>
      {children}
    </div>
  );
}
