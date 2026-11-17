import { ChangeEvent, FormEvent, useState } from 'react';
import { Check, Mail, Phone } from 'lucide-react';
import { COMUNAS, EMAIL, FORM_ENDPOINT, PHONE, PHONE_HREF } from '../data';
import { Reveal } from './motion';

const EMPTY = { nombre: '', apellido: '', email: '', edificio: '', direccion: '', comuna: 'Concepción', novedades: true };

const INPUT =
  'w-full rounded-lg bg-white/[0.05] border border-white/15 px-4 py-3 text-white placeholder-white/35 outline-none transition-colors focus:border-brand';
const LABEL = 'block text-sm text-gray-300 mb-1.5';

export default function Contact() {
  const [form, setForm] = useState(EMPTY);
  const [msg, setMsg] = useState('');
  const [sending, setSending] = useState(false);

  const onChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const t = e.target;
    const value = t instanceof HTMLInputElement && t.type === 'checkbox' ? t.checked : t.value;
    setForm((f) => ({ ...f, [t.name]: value }));
    setMsg('');
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const faltan = (['nombre', 'apellido', 'email', 'edificio'] as const).filter((k) => !form[k].trim());
    if (faltan.length) {
      setMsg('Completa los campos obligatorios.');
      return;
    }
    setSending(true);
    setMsg('Enviando…');
    fetch(FORM_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        _subject: 'Nueva solicitud de evaluación — PuntoMatica',
        _template: 'table',
        Nombre: `${form.nombre} ${form.apellido}`,
        Email: form.email,
        Edificio: form.edificio,
        Dirección: form.direccion || '—',
        Comuna: form.comuna,
        'Quiere novedades': form.novedades ? 'Sí' : 'No',
      }),
    })
      .then((r) => r.json())
      .then(() => {
        setMsg('¡Gracias! Te contactaremos dentro de 24 horas.');
        setForm(EMPTY);
      })
      .catch(() => setMsg(`No se pudo enviar. Escríbenos a ${EMAIL}`))
      .finally(() => setSending(false));
  };

  return (
    <section id="contacto" className="relative px-6 md:px-12 lg:px-16 pt-24 md:pt-32 pb-10 bg-black">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 55% 45% at 80% 30%, rgba(255,199,44,0.10), transparent 70%)' }}
      />
      <div className="relative grid lg:grid-cols-2 gap-12 lg:gap-16">
        <Reveal>
          <p className="text-xs md:text-sm uppercase tracking-[0.2em] text-brand mb-4">Contacto</p>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-normal leading-[1.05] mb-5" style={{ letterSpacing: '-0.04em' }}>
            Solicita una Evaluación de Factibilidad Gratuita
          </h2>
          <p className="text-lg text-gray-300 mb-10">Sin costo ni compromiso para la administración del edificio.</p>

          <div className="flex flex-wrap gap-x-12 gap-y-8">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-white/50 mb-3">Contacto directo</p>
              <a href={PHONE_HREF} className="flex items-center gap-3 text-2xl md:text-3xl font-normal tracking-tight transition-colors hover:text-brand">
                <Phone size={22} className="text-brand" />
                {PHONE}
              </a>
              <a href={`mailto:${EMAIL}`} className="mt-3 flex items-center gap-3 text-gray-300 transition-colors hover:text-white">
                <Mail size={18} className="text-brand" />
                {EMAIL}
              </a>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-white/50 mb-3">Zona de cobertura</p>
              <ul className="space-y-2">
                {COMUNAS.map((c) => (
                  <li key={c} className="flex items-center gap-2.5 text-gray-200">
                    <Check size={16} className="text-brand" />
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <img src="/mascota/puntomatica-saludando.svg" alt="" className="anim-float hidden lg:block w-56 mt-6 -ml-6 pointer-events-none" />
        </Reveal>

        <Reveal delay={120}>
          <form onSubmit={onSubmit} noValidate className="liquid-glass border border-white/20 rounded-2xl p-6 md:p-8 !bg-white/[0.04]">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={LABEL} htmlFor="f-nombre">Nombre *</label>
                <input id="f-nombre" name="nombre" autoComplete="given-name" className={INPUT} value={form.nombre} onChange={onChange} />
              </div>
              <div>
                <label className={LABEL} htmlFor="f-apellido">Apellido *</label>
                <input id="f-apellido" name="apellido" autoComplete="family-name" className={INPUT} value={form.apellido} onChange={onChange} />
              </div>
              <div className="sm:col-span-2">
                <label className={LABEL} htmlFor="f-email">Email *</label>
                <input id="f-email" name="email" type="email" autoComplete="email" className={INPUT} value={form.email} onChange={onChange} />
              </div>
              <div>
                <label className={LABEL} htmlFor="f-edificio">Nombre edificio / oficina *</label>
                <input id="f-edificio" name="edificio" className={INPUT} value={form.edificio} onChange={onChange} />
              </div>
              <div>
                <label className={LABEL} htmlFor="f-direccion">Dirección</label>
                <input id="f-direccion" name="direccion" autoComplete="street-address" className={INPUT} value={form.direccion} onChange={onChange} />
              </div>
              <div className="sm:col-span-2">
                <label className={LABEL} htmlFor="f-comuna">Comuna</label>
                <select id="f-comuna" name="comuna" className={`${INPUT} [&>option]:text-black`} value={form.comuna} onChange={onChange}>
                  {COMUNAS.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <label className="mt-5 flex items-center gap-3 text-sm text-gray-300 cursor-pointer">
              <input type="checkbox" name="novedades" checked={form.novedades} onChange={onChange} className="w-4 h-4 accent-[#FFC72C]" />
              Quiero recibir novedades
            </label>

            <button
              type="submit"
              disabled={sending}
              className="mt-6 w-full bg-white text-black px-8 py-3.5 rounded-lg font-medium transition-colors hover:bg-gray-100 disabled:opacity-60"
            >
              Enviar Solicitud
            </button>
            <p className="mt-3 min-h-[1.5rem] text-sm text-brand" role="status" aria-live="polite">
              {msg}
            </p>
          </form>
        </Reveal>
      </div>
    </section>
  );
}
