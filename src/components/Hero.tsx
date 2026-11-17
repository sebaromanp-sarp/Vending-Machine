import { useEffect, useRef } from 'react';
import { AnimatedHeading, FadeIn } from './motion';

const VIDEO_URL =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260403_050628_c4e32401-fab4-4a27-b7a8-6e9291cd5959.mp4';

/**
 * Video de fondo en bucle continuo. En vez de dejar que el video salte al volver al
 * inicio (se nota en las nubes), se usan dos copias: poco antes de que una termine,
 * la otra parte desde cero y aparece encima con un fundido.
 */
function SeamlessVideo({ src, fade = 1.6 }: { src: string; fade?: number }) {
  const a = useRef<HTMLVideoElement>(null);
  const b = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const vids = [a.current!, b.current!];
    let active = 0;
    let switching = false;
    let raf = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;

    vids[0].style.opacity = '1';
    vids[1].style.opacity = '0';
    vids[0].play().catch(() => {});

    const tick = () => {
      const cur = vids[active];
      if (!switching && cur.duration > fade * 2 && cur.currentTime >= cur.duration - fade) {
        switching = true;
        const next = vids[1 - active];
        next.currentTime = 0;
        next.style.transition = 'none';
        next.style.opacity = '0';
        next.style.zIndex = '2';
        cur.style.zIndex = '1';
        next.play().catch(() => {});
        void next.offsetWidth; // fuerza el reflow para que el fundido parta desde 0
        next.style.transition = `opacity ${fade}s linear`;
        next.style.opacity = '1';
        active = 1 - active;
        timer = setTimeout(() => {
          cur.pause();
          cur.style.transition = 'none';
          cur.style.opacity = '0';
          switching = false;
        }, fade * 1000 + 80);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      if (timer) clearTimeout(timer);
    };
  }, [fade]);

  const cls = 'absolute inset-0 w-full h-full object-cover';
  return (
    <>
      <video ref={a} className={cls} src={src} autoPlay muted playsInline preload="auto" />
      <video ref={b} className={cls} src={src} muted playsInline preload="auto" style={{ opacity: 0 }} />
    </>
  );
}

export default function Hero() {
  return (
    <section id="inicio" className="relative min-h-screen flex flex-col bg-black overflow-hidden">
      <SeamlessVideo src={VIDEO_URL} />

      {/* Espacio que ocupa la barra fija */}
      <div className="h-28 shrink-0" />

      <div className="relative z-10 flex-1 flex flex-col justify-end px-6 md:px-12 lg:px-16 pb-12 lg:pb-16">
        <div className="lg:grid lg:grid-cols-2 lg:items-end">
          <div>
            <AnimatedHeading
              text={'Un mini-market 24/7\nen tu edificio.'}
              className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-normal mb-4 [text-shadow:0_2px_24px_rgba(0,0,0,0.35)]"
              style={{ letterSpacing: '-0.04em' }}
            />
            <FadeIn delay={800} duration={1000}>
              <p className="text-base md:text-lg text-gray-300 mb-5 max-w-xl [text-shadow:0_1px_12px_rgba(0,0,0,0.55)]">
                Transformamos los espacios comunes de tu edificio en un micro-mercado de conveniencia: instalación,
                reposición y mantención 100% a nuestro cargo.
              </p>
            </FadeIn>
            <FadeIn delay={1200} duration={1000}>
              <div className="flex flex-wrap gap-4">
                <a
                  href="#contacto"
                  className="bg-white text-black px-8 py-3 rounded-lg font-medium transition-colors hover:bg-gray-100"
                >
                  Yo quiero uno
                </a>
                <a
                  href="#por-dentro"
                  className="liquid-glass border border-white/20 text-white px-8 py-3 rounded-lg font-medium transition-colors hover:bg-white hover:text-black"
                >
                  Ver cómo funciona
                </a>
              </div>
            </FadeIn>
          </div>

          <div className="flex items-end justify-start lg:justify-end mt-8 lg:mt-0">
            <FadeIn delay={1400} duration={1000}>
              <div className="liquid-glass border border-white/20 px-6 py-3 rounded-xl">
                <p className="text-lg md:text-xl lg:text-2xl font-light">Instalación. Reposición. Mantención.</p>
              </div>
            </FadeIn>
          </div>
        </div>
      </div>
    </section>
  );
}
