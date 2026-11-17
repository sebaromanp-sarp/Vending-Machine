import { RefObject, useEffect, useRef } from 'react';

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** Progreso 0..1 de v dentro del tramo [a, b]. */
export const span = (v: number, a: number, b: number) => clamp((v - a) / (b - a));
export const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

/**
 * Llama a onProgress(p) mientras cambia el scroll, donde p (0..1) es cuánto se ha
 * recorrido la sección: 0 cuando su borde superior llega arriba de la pantalla, 1 cuando
 * su borde inferior llega abajo. Pensado para secciones altas con un hijo `sticky`.
 *
 * El scroll no mueve la escena directamente: fija un destino, y un único bucle acerca el
 * valor actual a ese destino con una curva exponencial (`tau` en ms; 0 = sin suavizado).
 * Así el movimiento se siente fluido aunque la rueda del mouse avance a saltos. El bucle
 * se detiene apenas el valor llega a destino.
 */
export function useScrollProgress(ref: RefObject<HTMLElement>, onProgress: (p: number) => void, tau = 0) {
  const cb = useRef(onProgress);
  cb.current = onProgress;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let reduce = false;
    try {
      reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch {
      /* sin soporte: se anima normalmente */
    }
    let raf = 0;
    let cur = -1;
    let last = 0;

    const target = () => {
      const r = el.getBoundingClientRect();
      const total = r.height - window.innerHeight;
      return total > 0 ? clamp(-r.top / total) : 0;
    };
    const frame = (now: number) => {
      raf = 0;
      const t = target();
      if (cur < 0 || !tau || reduce) {
        cur = t;
      } else {
        const dt = last ? Math.min(64, now - last) : 16;
        cur += (t - cur) * (1 - Math.exp(-dt / tau));
        if (Math.abs(t - cur) < 0.0003) cur = t;
      }
      last = now;
      cb.current(cur);
      if (cur !== t) raf = requestAnimationFrame(frame);
      else last = 0;
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(frame);
    };
    window.addEventListener('scroll', kick, { passive: true });
    window.addEventListener('resize', kick);
    kick();
    return () => {
      window.removeEventListener('scroll', kick);
      window.removeEventListener('resize', kick);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [ref, tau]);
}

/** Generador pseudoaleatorio con semilla (para que el dibujo sea siempre igual). */
export function seeded(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
