import { CSSProperties, ReactNode, useEffect, useRef, useState } from 'react';

/** Aparece (opacidad 0 → 1) después de `delay` ms. */
export function FadeIn({
  children,
  delay = 0,
  duration = 1000,
  className = '',
}: {
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  return (
    <div
      className={`transition-opacity ${className}`}
      style={{ opacity: visible ? 1 : 0, transitionDuration: `${duration}ms` }}
    >
      {children}
    </div>
  );
}

/** Título que entra letra por letra, deslizándose desde la izquierda. */
export function AnimatedHeading({
  text,
  className = '',
  style,
  initialDelay = 200,
  charDelay = 30,
  charDuration = 500,
}: {
  text: string;
  className?: string;
  style?: CSSProperties;
  initialDelay?: number;
  charDelay?: number;
  charDuration?: number;
}) {
  const [go, setGo] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setGo(true), initialDelay);
    return () => clearTimeout(t);
  }, [initialDelay]);

  const lines = text.split('\n');
  return (
    <h1 className={className} style={style} aria-label={text.replace('\n', ' ')}>
      {lines.map((line, lineIndex) => {
        let charIndex = 0;
        // Se agrupa por palabra para que el texto solo se corte entre palabras.
        const words = line.split(' ');
        return (
          <span key={lineIndex} className="block lg:whitespace-nowrap" aria-hidden="true">
            {words.map((word, w) => {
              const chars = (w < words.length - 1 ? word + ' ' : word).split('');
              return (
                <span key={w} className="inline-block whitespace-nowrap">
                  {chars.map((ch) => {
                    const i = charIndex++;
                    const delay = lineIndex * line.length * charDelay + i * charDelay;
                    return (
                      <span
                        key={i}
                        className="inline-block"
                        style={{
                          opacity: go ? 1 : 0,
                          transform: go ? 'translateX(0)' : 'translateX(-18px)',
                          transition: `opacity ${charDuration}ms ease, transform ${charDuration}ms ease`,
                          transitionDelay: `${delay}ms`,
                        }}
                      >
                        {ch === ' ' ? ' ' : ch}
                      </span>
                    );
                  })}
                </span>
              );
            })}
          </span>
        );
      })}
    </h1>
  );
}

/** Aparece suavemente cuando entra en pantalla al hacer scroll. */
export function Reveal({
  children,
  delay = 0,
  className = '',
  flip = false,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  /** Entra girando desde atrás, como una tarjeta que se levanta */
  flip?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? 'none' : flip ? 'perspective(1000px) rotateX(24deg) translateY(48px) scale(0.96)' : 'translateY(24px)',
        transformOrigin: '50% 100%',
        transition: flip
          ? 'opacity 700ms ease, transform 1100ms cubic-bezier(.16,1,.3,1)'
          : 'opacity 800ms ease, transform 800ms cubic-bezier(.2,.7,.2,1)',
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}
