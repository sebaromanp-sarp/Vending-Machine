// Genera las 4 vistas de la mascota PuntoMatica (vendomática con cara).
// Uso: node mascota-v2/generar.mjs
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = dirname(fileURLToPath(import.meta.url));

// Paleta de marca
const C = {
  yellow: '#FFC72C',
  yellowHi: '#FFD95C',
  yellowLo: '#F2B200',
  top: '#FFE286',
  side1: '#E6A800',
  side2: '#C98F00',
  limb: '#E0A100',
  limbLo: '#C48A00',
  ink: '#14141C',
  panel: '#1E1E29',
  panelHi: '#2E2E3B',
  shelf: '#4A4A5A',
  blush: '#FF8F6B',
};

const W = 260; // ancho del frente
const H = 380; // alto
const D = 150; // profundidad

const defs = `
  <defs>
    <linearGradient id="gBody" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${C.yellowHi}"/>
      <stop offset="0.55" stop-color="${C.yellow}"/>
      <stop offset="1" stop-color="${C.yellowLo}"/>
    </linearGradient>
    <linearGradient id="gSide" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${C.side1}"/>
      <stop offset="1" stop-color="${C.side2}"/>
    </linearGradient>
    <linearGradient id="gScreen" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#2A2A38"/>
      <stop offset="1" stop-color="#191922"/>
    </linearGradient>
    <linearGradient id="gGlass" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#34344A"/>
      <stop offset="1" stop-color="#232330"/>
    </linearGradient>
    <linearGradient id="gLimb" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${C.limb}"/>
      <stop offset="1" stop-color="${C.limbLo}"/>
    </linearGradient>
    <clipPath id="cScreen"><rect x="26" y="26" width="208" height="124" rx="21"/></clipPath>
    <clipPath id="cGlass"><rect x="25" y="177" width="140" height="118" rx="10"/></clipPath>
  </defs>`;

// ---------- Frente de la máquina (coordenadas locales 0..W x 0..H) ----------
function productos() {
  const latas = ['#E5484D', '#46A758', '#3E63DD', '#F76B15', '#8E4EC6'];
  const bolsas = ['#F76B15', '#E5484D', '#30A46C', '#0090FF'];
  const botellas = ['#0090FF', '#46A758', '#E5484D', '#F5D90A', '#8E4EC6'];
  let s = '';
  // Fila 1: latas
  latas.forEach((col, i) => {
    const x = 39 + i * 24;
    s += `<rect x="${x}" y="186" width="16" height="27" rx="4" fill="${col}"/>`;
    s += `<rect x="${x}" y="195" width="16" height="7" fill="#fff" opacity=".85"/>`;
    s += `<rect x="${x + 2}" y="186" width="12" height="3" rx="1.5" fill="#fff" opacity=".45"/>`;
  });
  // Fila 2: bolsas de snack
  bolsas.forEach((col, i) => {
    const x = 33 + i * 34;
    s += `<path d="M${x} 224 h22 l-2 4 l2 23 h-22 l2 -23 z" fill="${col}"/>`;
    s += `<circle cx="${x + 11}" cy="239" r="6" fill="#fff" opacity=".9"/>`;
  });
  // Fila 3: botellas
  botellas.forEach((col, i) => {
    const x = 40 + i * 24;
    s += `<rect x="${x + 4}" y="262" width="6" height="8" rx="2" fill="#fff" opacity=".9"/>`;
    s += `<rect x="${x}" y="268" width="14" height="25" rx="4.5" fill="${col}"/>`;
    s += `<rect x="${x}" y="277" width="14" height="7" fill="#fff" opacity=".8"/>`;
  });
  return s;
}

function cara(boca) {
  const ojos = `
    <rect x="76" y="56" width="22" height="32" rx="11" fill="${C.yellow}"/>
    <rect x="162" y="56" width="22" height="32" rx="11" fill="${C.yellow}"/>
    <circle cx="92" cy="65" r="4" fill="#fff"/>
    <circle cx="178" cy="65" r="4" fill="#fff"/>`;
  const mejillas = `
    <ellipse cx="58" cy="104" rx="11" ry="7" fill="${C.blush}" opacity=".6"/>
    <ellipse cx="202" cy="104" rx="11" ry="7" fill="${C.blush}" opacity=".6"/>`;
  const bocas = {
    sonrisa: `<path d="M100 106 Q130 132 160 106" fill="none" stroke="${C.yellow}" stroke-width="8" stroke-linecap="round"/>`,
    abierta: `<path d="M98 102 Q130 110 162 102 Q160 138 130 138 Q100 138 98 102 Z" fill="${C.yellow}" stroke="${C.yellow}" stroke-width="5" stroke-linejoin="round"/>
              <path d="M112 128 Q130 116 148 128 Q142 138 130 138 Q118 138 112 128 Z" fill="${C.blush}"/>`,
  };
  return ojos + mejillas + bocas[boca];
}

function frente({ boca = 'sonrisa', rx = 36 } = {}) {
  return `
    <rect width="${W}" height="${H}" rx="${rx}" fill="url(#gBody)"/>
    ${rx ? `<rect x="5" y="5" width="${W - 10}" height="${H - 10}" rx="${rx - 5}" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="3"/>` : ''}

    <!-- Pantalla / cara -->
    <rect x="20" y="20" width="220" height="136" rx="26" fill="${C.ink}"/>
    <rect x="26" y="26" width="208" height="124" rx="21" fill="url(#gScreen)"/>
    <g clip-path="url(#cScreen)">
      <path d="M150 20 L196 20 L120 160 L74 160 Z" fill="#fff" opacity=".045"/>
      <path d="M206 20 L224 20 L148 160 L130 160 Z" fill="#fff" opacity=".045"/>
    </g>
    ${cara(boca)}

    <!-- Vitrina de productos -->
    <rect x="20" y="172" width="150" height="128" rx="14" fill="${C.ink}"/>
    <rect x="25" y="177" width="140" height="118" rx="10" fill="url(#gGlass)"/>
    <g clip-path="url(#cGlass)">
      ${productos()}
      <rect x="25" y="213" width="140" height="5" fill="${C.shelf}"/>
      <rect x="25" y="252" width="140" height="5" fill="${C.shelf}"/>
      <rect x="25" y="291" width="140" height="5" fill="${C.shelf}"/>
      <path d="M95 170 L125 170 L70 300 L40 300 Z" fill="#fff" opacity=".09"/>
      <path d="M135 170 L146 170 L91 300 L80 300 Z" fill="#fff" opacity=".09"/>
    </g>

    <!-- Panel de control -->
    <rect x="184" y="172" width="56" height="26" rx="7" fill="${C.ink}"/>
    <rect x="191" y="181" width="16" height="8" rx="2.5" fill="#4ADE80"/>
    <rect x="211" y="181" width="8" height="8" rx="2.5" fill="#4ADE80" opacity=".75"/>
    <rect x="223" y="181" width="10" height="8" rx="2.5" fill="#4ADE80" opacity=".45"/>
    ${[0, 1, 2].map((r) => [0, 1, 2].map((c) =>
      `<rect x="${188 + c * 18}" y="${207 + r * 18}" width="12" height="12" rx="3.5" fill="${C.panel}"/>`).join('')).join('')}
    <rect x="199" y="264" width="26" height="36" rx="10" fill="${C.side1}"/>
    <rect x="208" y="270" width="8" height="24" rx="4" fill="${C.ink}"/>

    <!-- Bandeja de retiro -->
    <rect x="20" y="314" width="220" height="48" rx="15" fill="${C.ink}"/>
    <rect x="29" y="322" width="202" height="32" rx="10" fill="${C.panelHi}"/>
    <rect x="62" y="334" width="136" height="8" rx="4" fill="${C.yellow}"/>`;
}

// ---------- Costado ----------
function costado() {
  return `
    <rect width="${D}" height="${H}" fill="url(#gSide)"/>
    <text x="75" y="118" text-anchor="middle" font-family="Poppins, 'Segoe UI', Helvetica, Arial, sans-serif"
          font-weight="900" font-size="46" fill="${C.ink}" opacity=".85">24/7</text>
    ${[0, 1, 2, 3].map((i) =>
      `<rect x="30" y="${292 + i * 15}" width="90" height="7" rx="3.5" fill="${C.ink}" opacity=".28"/>`).join('')}`;
}

// ---------- Extremidades ----------
const limb = (d, w = 17) =>
  `<path d="${d}" fill="none" stroke="url(#gLimb)" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
// Con trazo sólido (para líneas rectas, donde el degradado por bounding box falla)
const limbSolid = (d, w = 17, col = C.limb) =>
  `<path d="${d}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
const mano = (x, y, r = 15) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${C.limb}"/>`;
const sombra = (cx, cy, rx) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="13" fill="#000" opacity=".16"/>`;

// ---------- Vista frontal ----------
function vistaFrontal({ saludando = false } = {}) {
  const X = 170, Y = 66; // esquina del cuerpo
  const piernas = `
    ${limbSolid(`M${X + 84} ${Y + 360} L${X + 84} ${Y + 440}`, 19)}
    ${limbSolid(`M${X + 176} ${Y + 360} L${X + 176} ${Y + 440}`, 19)}
    <ellipse cx="${X + 76}" cy="${Y + 446}" rx="27" ry="13" fill="${C.limbLo}"/>
    <ellipse cx="${X + 184}" cy="${Y + 446}" rx="27" ry="13" fill="${C.limbLo}"/>`;

  const brazoIzq = `
    ${limb(`M${X + 8} ${Y + 196} C${X - 38} ${Y + 204} ${X - 52} ${Y + 252} ${X - 44} ${Y + 300}`)}
    ${mano(X - 44, Y + 302)}`;

  let brazoDer, extras = '';
  if (saludando) {
    brazoDer = `
      ${limb(`M${X + W - 8} ${Y + 190} C${X + W + 46} ${Y + 196} ${X + W + 62} ${Y + 128} ${X + W + 66} ${Y + 78}`)}
      ${mano(X + W + 66, Y + 74, 17)}`;
    extras = `
      <g fill="none" stroke="${C.yellow}" stroke-width="6" stroke-linecap="round">
        <path d="M${X + W + 26} ${Y + 62} Q${X + W + 22} ${Y + 40} ${X + W + 36} ${Y + 24}"/>
        <path d="M${X + W + 104} ${Y + 62} Q${X + W + 110} ${Y + 40} ${X + W + 98} ${Y + 22}"/>
        <path d="M${X + W + 56} ${Y + 34} L${X + W + 58} ${Y + 16}" opacity=".0"/>
      </g>`;
  } else {
    brazoDer = `
      ${limb(`M${X + W - 8} ${Y + 196} C${X + W + 38} ${Y + 204} ${X + W + 52} ${Y + 252} ${X + W + 44} ${Y + 300}`)}
      ${mano(X + W + 44, Y + 302)}`;
  }

  const cuerpo = `
    ${piernas}
    ${brazoIzq}
    ${brazoDer}
    <g transform="translate(${X} ${Y})">${frente({ boca: saludando ? 'abierta' : 'sonrisa' })}</g>`;

  return svg(`
    ${sombra(300, 530, 150)}
    ${saludando ? `<g transform="rotate(-4 300 520)">${cuerpo}${extras}</g>` : cuerpo}`);
}

// ---------- Vista 3/4 ----------
// derecha=true: se ve el costado derecho de la mascota (queda a la izquierda de la imagen).
function vistaCostado({ derecha = true } = {}) {
  const fx = 0.86, fy = -0.14; // vector del frente por unidad
  const sx = -0.55, sy = -0.22; // vector de profundidad por unidad
  const px = 232, py = 104; // esquina superior compartida (vista "derecha")

  // Geometría calculada para la vista "derecha"; la otra es su espejo.
  const P = [px, py];
  const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
  const Fv = [fx * W, fy * W];
  const Sv = [sx * D, sy * D];
  const down = [0, H];
  let hex = [add(add(P, Fv), Sv), add(P, Fv), add(add(P, Fv), down), add(P, down), add(add(P, Sv), down), add(P, Sv)];
  const mx = (p) => (derecha ? p : [600 - p[0], p[1]]);
  hex = hex.map(mx);

  // Silueta redondeada (clip) para que las caras calcen perfecto en las aristas
  const r = 30;
  const unit = (a, b) => { const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy); return [dx / l, dy / l]; };
  let d = '';
  hex.forEach((V, i) => {
    const prev = hex[(i + hex.length - 1) % hex.length], next = hex[(i + 1) % hex.length];
    const u1 = unit(V, prev), u2 = unit(V, next);
    const A = [V[0] + u1[0] * r, V[1] + u1[1] * r], B = [V[0] + u2[0] * r, V[1] + u2[1] * r];
    d += `${i ? 'L' : 'M'}${A[0].toFixed(1)} ${A[1].toFixed(1)} Q${V[0].toFixed(1)} ${V[1].toFixed(1)} ${B[0].toFixed(1)} ${B[1].toFixed(1)} `;
  });
  d += 'Z';

  const Pm = mx(P);
  let mFront, mSide, mTop;
  if (derecha) {
    mFront = `matrix(${fx} ${fy} 0 1 ${px} ${py})`;
    mSide = `matrix(${-sx} ${-sy} 0 1 ${px + sx * D} ${py + sy * D})`;
    mTop = `matrix(${fx} ${fy} ${sx} ${sy} ${px} ${py})`;
  } else {
    mFront = `matrix(${fx} ${-fy} 0 1 ${Pm[0] - fx * W} ${py + fy * W})`;
    mSide = `matrix(${-sx} ${sy} 0 1 ${Pm[0]} ${py})`;
    mTop = `matrix(${fx} ${-fy} ${-sx} ${sy} ${Pm[0] - fx * W} ${py + fy * W})`;
  }

  // Extremidades (dibujadas para la vista "derecha" y espejadas si hace falta)
  const base = (u) => [px + fx * u + sx * D * 0.5, py + H + fy * u + sy * D * 0.5];
  const pierna = (u) => {
    const [bx, by] = base(u);
    const ay = by + 96;
    return `${limbSolid(`M${bx} ${by} L${bx} ${ay}`, 19)}
            ${limbSolid(`M${bx + 2} ${ay + 2} L${bx + 22} ${ay + 10}`, 23, C.limbLo)}`;
  };
  const hombro = [px + sx * D * 0.5, py + 185 + sy * D * 0.5];
  const lejos = [px + fx * W - 6, py + fy * W + 176];
  const atras = `
    ${limb(`M${lejos[0]} ${lejos[1]} C${lejos[0] + 40} ${lejos[1] + 6} ${lejos[0] + 54} ${lejos[1] + 52} ${lejos[0] + 46} ${lejos[1] + 100}`)}
    ${mano(lejos[0] + 46, lejos[1] + 102)}
    ${pierna(196)}
    ${pierna(74)}`;
  // El brazo cercano va sobre el costado (del mismo tono), así que usa amarillo claro + sombra
  const brazoD = `M${hombro[0]} ${hombro[1]} C${hombro[0] - 36} ${hombro[1] + 14} ${hombro[0] - 44} ${hombro[1] + 62} ${hombro[0] - 32} ${hombro[1] + 108}`;
  const adelante = `
    <g transform="translate(5 6)" opacity=".22">
      ${limbSolid(brazoD, 17, C.ink)}
      <circle cx="${hombro[0] - 32}" cy="${hombro[1] + 110}" r="15" fill="${C.ink}"/>
    </g>
    <circle cx="${hombro[0]}" cy="${hombro[1]}" r="15" fill="${C.limbLo}"/>
    ${limbSolid(brazoD, 17, C.yellowHi)}
    <circle cx="${hombro[0] - 32}" cy="${hombro[1] + 110}" r="15" fill="${C.yellowHi}"/>`;
  const flip = derecha ? '' : ' transform="translate(600 0) scale(-1 1)"';

  const L = (a, b) => `<path d="M${a[0]} ${a[1]} L${b[0]} ${b[1]}" stroke="#fff" stroke-opacity=".4" stroke-width="3" stroke-linecap="round"/>`;
  const aristas = L(hex[3], Pm) + L(Pm, hex[1]) + L(Pm, hex[5]);

  return svg(`
    <defs><clipPath id="cSil"><path d="${d}"/></clipPath></defs>
    ${sombra(300, 548, 170)}
    <g${flip}>${atras}</g>
    <g clip-path="url(#cSil)">
      <g transform="${mSide}">${costado()}</g>
      <g transform="${mTop}"><rect width="${W}" height="${D}" fill="${C.top}"/></g>
      <g transform="${mFront}">${frente({ rx: 0 })}</g>
      ${aristas}
    </g>
    <g${flip}>${adelante}</g>`);
}

function svg(inner) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">${defs}${inner}\n</svg>\n`;
}

const archivos = {
  'puntomatica-frontal.svg': vistaFrontal(),
  'puntomatica-costado-derecho.svg': vistaCostado({ derecha: true }),
  'puntomatica-costado-izquierdo.svg': vistaCostado({ derecha: false }),
  'puntomatica-saludando.svg': vistaFrontal({ saludando: true }),
};
for (const [nombre, contenido] of Object.entries(archivos)) {
  writeFileSync(join(OUT, nombre), contenido);
  console.log('ok', nombre);
}
