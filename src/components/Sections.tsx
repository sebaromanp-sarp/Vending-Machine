import { useState } from 'react';
import { ArrowRight, CircleDollarSign, DoorOpen, HandCoins, MapPin, PackageCheck, Truck, Wrench } from 'lucide-react';
import { BENEFITS, BRANDS, CATS, MACHINES, NAV, SERVICES, STATS } from '../data';
import { Reveal } from './motion';
import { LogoIcon } from './Navbar';
import CityLights from './CityLights';

const ICONS = {
  dollar: CircleDollarSign,
  coins: HandCoins,
  door: DoorOpen,
  pin: MapPin,
  truck: Truck,
  package: PackageCheck,
  wrench: Wrench,
} as const;

const PAD = 'px-6 md:px-12 lg:px-16';
const H2 = 'text-4xl md:text-5xl lg:text-6xl font-normal leading-[1.05]';
const TRACK = { letterSpacing: '-0.04em' };

function Eyebrow({ children }: { children: string }) {
  return <p className="text-xs md:text-sm uppercase tracking-[0.2em] text-brand mb-4">{children}</p>;
}

// ---------------------------------------------------------------------------
export function Stats() {
  return (
    <section className={`${PAD} border-y border-white/10 bg-black`}>
      <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-white/10">
        {STATS.map((s, i) => (
          <Reveal key={s.value} delay={i * 120} className="py-8 sm:py-12 sm:px-8 first:sm:pl-0">
            <p className="text-6xl md:text-7xl font-normal" style={TRACK}>
              {s.value}
            </p>
            <p className="mt-2 text-gray-300">{s.label}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
export function Benefits() {
  return (
    <section id="beneficios" className={`${PAD} relative py-24 md:py-32 bg-black overflow-hidden`}>
      <div className="lg:grid lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:gap-16">
        <Reveal className="mb-12 lg:mb-0 lg:sticky lg:top-32 lg:self-start">
          <Eyebrow>Beneficios</Eyebrow>
          <h2 className={H2} style={TRACK}>
            Lo que gana tu comunidad al sumar el servicio.
          </h2>
        </Reveal>
        <div className="grid sm:grid-cols-2 gap-4">
          {BENEFITS.map((b, i) => {
            const Icon = ICONS[b.icon];
            return (
              <Reveal key={b.title} delay={i * 90}>
                <article className="liquid-glass border border-white/20 rounded-2xl p-6 md:p-7 h-full !bg-white/[0.04]">
                  <div className="flex items-center justify-between mb-10">
                    <span className="grid place-items-center w-12 h-12 rounded-xl bg-brand text-black">
                      <Icon size={22} />
                    </span>
                    <span className="text-sm text-white/30 tabular-nums">0{i + 1}</span>
                  </div>
                  <h3 className="text-xl md:text-2xl font-medium tracking-tight mb-2">{b.title}</h3>
                  <p className="text-gray-300 leading-relaxed">{b.desc}</p>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
export function Catalog() {
  const [active, setActive] = useState(CATS[0].key);
  const cat = CATS.find((c) => c.key === active) ?? CATS[0];
  return (
    <section id="catalogo" className={`${PAD} py-24 md:py-32 bg-[#050506] border-y border-white/10`}>
      <Reveal className="text-center mb-10">
        <Eyebrow>Abarrote esencial + Snack &amp; Bebidas</Eyebrow>
        <h2 className={H2} style={TRACK}>
          Catálogo Adaptable
        </h2>
      </Reveal>

      <Reveal>
        <div role="tablist" aria-label="Categorías del catálogo" className="flex flex-wrap justify-center gap-2.5 mb-12">
          {CATS.map((c) => {
            const on = c.key === active;
            return (
              <button
                key={c.key}
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => setActive(c.key)}
                className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  on ? 'bg-white text-black' : 'liquid-glass border border-white/20 text-white hover:bg-white hover:text-black'
                }`}
              >
                {c.label}
              </button>
            );
          })}
        </div>
      </Reveal>

      <div className="max-w-6xl mx-auto grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-10 lg:gap-16 items-center">
        <Reveal>
          <div className="relative max-w-sm mx-auto">
            <div
              className="rounded-2xl border border-white/15 p-7 grid place-items-center"
              style={{ background: 'radial-gradient(ellipse at 50% 35%, rgba(255,199,44,0.16), rgba(255,255,255,0.03) 65%)' }}
            >
              <img
                src="/assets/maquina-maxima.png"
                alt="Máquina expendedora modelo Máxima Capacidad cargada de productos"
                className="w-full max-w-[250px] h-auto drop-shadow-[0_30px_40px_rgba(0,0,0,0.6)]"
              />
            </div>
            <img
              src="/mascota/puntomatica-costado-derecho.svg"
              alt=""
              className="anim-float absolute -left-8 sm:-left-20 -bottom-3 w-32 sm:w-40 pointer-events-none"
            />
          </div>
        </Reveal>

        <div key={cat.key} className="anim-rise">
          <h3 className="text-3xl md:text-4xl font-normal mb-4" style={TRACK}>
            {cat.label}
          </h3>
          <p className="text-lg text-gray-300 mb-8 max-w-xl">{cat.desc}</p>
          <ul className="flex flex-wrap gap-2.5 mb-10">
            {cat.items.map((item) => (
              <li key={item} className="flex items-center gap-2.5 rounded-full border border-white/15 bg-white/[0.04] px-4 py-2 text-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-brand" />
                {item}
              </li>
            ))}
          </ul>
          <a href="#maquinas" className="inline-flex items-center gap-2 bg-white text-black px-8 py-3 rounded-lg font-medium transition-colors hover:bg-gray-100">
            Ver máquinas <ArrowRight size={18} />
          </a>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
export function Services() {
  return (
    <section id="servicios" className={`${PAD} py-24 md:py-32 bg-black`}>
      <Reveal className="mb-14 max-w-3xl">
        <Eyebrow>Servicios incluidos</Eyebrow>
        <h2 className={H2} style={TRACK}>
          Nosotros nos encargamos de todo.
        </h2>
      </Reveal>
      <div className="grid md:grid-cols-3 gap-px bg-white/10 rounded-2xl overflow-hidden border border-white/10">
        {SERVICES.map((s, i) => {
          const Icon = ICONS[s.icon];
          return (
            <Reveal key={s.title} delay={i * 120} className="bg-black">
              <article className="p-7 md:p-9 h-full">
                <div className="flex items-center gap-4 mb-12">
                  <span className="text-5xl font-light text-white/25 tabular-nums" style={TRACK}>
                    0{i + 1}
                  </span>
                  <span className="h-px flex-1 bg-white/15" />
                  <Icon size={26} className="text-brand" />
                </div>
                <h3 className="text-xl md:text-2xl font-medium tracking-tight mb-2">{s.title}</h3>
                <p className="text-gray-300 leading-relaxed">{s.desc}</p>
              </article>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
export function Machines() {
  return (
    <section id="maquinas" className={`${PAD} py-24 md:py-32 bg-[#050506] border-y border-white/10`}>
      <Reveal className="mb-14 flex flex-wrap items-end justify-between gap-6">
        <div>
          <Eyebrow>Nuestras máquinas</Eyebrow>
          <h2 className={H2} style={TRACK}>
            Una para cada lobby.
          </h2>
        </div>
        <a
          href="#contacto"
          className="liquid-glass border border-white/20 text-white px-8 py-3 rounded-lg font-medium transition-colors hover:bg-white hover:text-black"
        >
          Solicitar evaluación gratuita
        </a>
      </Reveal>

      <div className="grid md:grid-cols-2 gap-5">
        {MACHINES.map((m, i) => (
          <Reveal key={m.name} delay={i * 120}>
            <article className="rounded-2xl border border-white/15 overflow-hidden h-full flex flex-col bg-white/[0.03]">
              <div
                className="relative h-[340px] md:h-[420px] flex items-center justify-center"
                style={{ background: 'radial-gradient(ellipse 60% 70% at 50% 45%, rgba(255,255,255,0.14), transparent 70%)' }}
              >
                <img src={m.img} alt={m.name} className="h-[280px] md:h-[350px] w-auto drop-shadow-[0_30px_40px_rgba(0,0,0,0.65)]" />
                {i === 1 && (
                  <img
                    src="/mascota/puntomatica-costado-izquierdo.svg"
                    alt=""
                    className="anim-float absolute bottom-4 left-[calc(50%+70px)] sm:left-[calc(50%+110px)] w-28 sm:w-36 pointer-events-none"
                  />
                )}
              </div>
              <div className="p-6 md:p-8 flex flex-col items-start sm:flex-row sm:items-end sm:justify-between gap-4 border-t border-white/10">
                <div>
                  <h3 className="text-xl md:text-2xl font-medium tracking-tight">{m.name}</h3>
                  <p className="text-gray-300 mt-1">{m.desc}</p>
                </div>
                <a href="#contacto" className="shrink-0 bg-white text-black px-6 py-2.5 rounded-lg text-sm font-medium transition-colors hover:bg-gray-100">
                  Cotizar
                </a>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
export function Brands() {
  return (
    <section className={`${PAD} py-16 bg-black`}>
      <Reveal>
        <div className="rounded-2xl bg-white text-black px-6 py-8 md:px-10">
          <p className="text-sm font-medium text-gray-500 mb-6">Marcas que encontrarás en tu máquina</p>
          <div className="flex flex-wrap items-center gap-x-12 gap-y-6">
            {BRANDS.map((b) => (
              <img key={b.name} src={b.img} alt={b.name} style={{ height: b.h }} className="w-auto max-w-[170px] object-contain mix-blend-multiply" />
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
}

// ---------------------------------------------------------------------------
export function Footer() {
  return (
    <footer className="relative bg-black overflow-hidden">
      <CityLights />
      <div className={`${PAD} relative border-t border-white/10 py-8 flex flex-wrap items-center justify-between gap-6 bg-[#10141d]`}>
        <div className="flex items-center gap-3 text-sm text-gray-300">
          <LogoIcon size={26} />© 2026 PuntoMatica — Todos los derechos reservados
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          {NAV.map((l) => (
            <a key={l.href} href={l.href} className="text-gray-300 transition-colors hover:text-white">
              {l.label}
            </a>
          ))}
          <a href="#contacto" className="text-gray-300 transition-colors hover:text-white">
            Contacto
          </a>
        </div>
      </div>
    </footer>
  );
}
