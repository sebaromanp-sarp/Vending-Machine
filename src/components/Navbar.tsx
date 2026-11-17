import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { NAV } from '../data';

/** Ícono simplificado de la mascota (legible a tamaño chico). */
export function LogoIcon({ size = 30 }: { size?: number }) {
  return (
    <svg width={(size * 120) / 160} height={size} viewBox="0 0 120 160" aria-hidden="true">
      <rect x="36" y="128" width="12" height="22" rx="6" fill="#E0A100" />
      <rect x="72" y="128" width="12" height="22" rx="6" fill="#E0A100" />
      <rect x="26" y="144" width="30" height="13" rx="6.5" fill="#C48A00" />
      <rect x="64" y="144" width="30" height="13" rx="6.5" fill="#C48A00" />
      <rect x="10" y="4" width="100" height="132" rx="20" fill="#FFC72C" />
      <rect x="20" y="14" width="80" height="52" rx="12" fill="#1E1E29" />
      <rect x="40" y="27" width="10" height="15" rx="5" fill="#FFC72C" />
      <rect x="70" y="27" width="10" height="15" rx="5" fill="#FFC72C" />
      <path d="M47 50 Q60 60 73 50" stroke="#FFC72C" strokeWidth="5" fill="none" strokeLinecap="round" />
      <rect x="20" y="74" width="52" height="34" rx="7" fill="#1E1E29" />
      <circle cx="33" cy="91" r="5.5" fill="#E5484D" />
      <circle cx="46" cy="91" r="5.5" fill="#46A758" />
      <circle cx="59" cy="91" r="5.5" fill="#3E63DD" />
      <rect x="80" y="74" width="20" height="34" rx="6" fill="#E6A800" />
      <rect x="87" y="82" width="6" height="18" rx="3" fill="#14141C" />
      <rect x="20" y="114" width="80" height="14" rx="7" fill="#1E1E29" />
    </svg>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 min-[360px]:px-6 md:px-12 lg:px-16 pt-6">
      {/* Con el menú abierto el fondo se oscurece, para que el contenido de atrás no compita con los enlaces */}
      <nav className={`liquid-glass rounded-xl px-3 min-[360px]:px-4 py-2 transition-colors duration-200 ${open ? '!bg-black/90' : ''}`}>
        <div className="flex items-center justify-between">
          <a href="#inicio" className="flex items-center gap-2 min-[360px]:gap-2.5 text-lg min-[360px]:text-xl sm:text-2xl font-semibold tracking-tight">
            <LogoIcon />
            PuntoMatica
          </a>

          <div className="hidden md:flex items-center gap-8 text-sm">
            {NAV.map((l) => (
              <a key={l.href} href={l.href} className="transition-colors hover:text-gray-300">
                {l.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <a
              href="#contacto"
              className="bg-white text-black px-3 min-[360px]:px-4 sm:px-6 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-gray-100"
            >
              <span className="hidden sm:inline">Solicitar evaluación</span>
              <span className="sm:hidden">Cotizar</span>
            </a>
            <button
              type="button"
              className="md:hidden shrink-0 grid place-items-center w-9 h-9 min-[360px]:w-10 min-[360px]:h-10 rounded-lg border border-white/20"
              aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {open && (
          <div className="md:hidden flex flex-col gap-1 pt-3 pb-2 text-base">
            {NAV.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="py-2 border-t border-white/10 transition-colors hover:text-gray-300"
                onClick={() => setOpen(false)}
              >
                {l.label}
              </a>
            ))}
          </div>
        )}
      </nav>
    </header>
  );
}
