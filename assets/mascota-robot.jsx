// Mascota robot de Vending Concepción — loop continuo de 5s (flotar → saludo → volver).
const R = window.React;

const clamp = (v, a, b) => Math.min(Math.max(v, a), b);
const interpolate = ([i0, i1], [o0, o1], ease) => (t) => {
  const p = i1 === i0 ? 0 : clamp((t - i0) / (i1 - i0), 0, 1);
  const e = ease ? ease(p) : p;
  return o0 + (o1 - o0) * e;
};
const Easing = {
  easeOutQuad: (t) => 1 - (1 - t) * (1 - t),
  easeOutCubic: (t) => 1 - Math.pow(1 - t, 3),
  easeInOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  easeOutBack: (t) => 1 + 2.70158 * Math.pow(t - 1, 3) + 1.70158 * Math.pow(t - 1, 2),
};
const animate = ({ from, to, start, end, ease }) => (T) => {
  const p = clamp((T - start) / (end - start), 0, 1);
  return from + (to - from) * (ease ? ease(p) : p);
};

const TOTAL = 5;
const CUES = { Flotar: 0, Saludo: 2, Volver: 4 };

function useComposition() {
  const [T, setT] = R.useState(0);
  R.useEffect(() => {
    let raf, t0 = null;
    const step = (ts) => {
      if (t0 === null) t0 = ts;
      setT(((ts - t0) / 1000) % TOTAL);
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, []);
  return { T, CUES, authoredTotal: TOTAL };
}

const MOTION = { swing: (o) => animate({ ...o, ease: Easing.easeInOutCubic }) };

const C = { shell: "#34383F", yellow: "#F8C630", ink: "#22262B", light: "#F4F6F8" };

function hexRgb(h) {
  const n = parseInt(h.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function shade(h, amt) {
  const [r, g, b] = hexRgb(h);
  const f = (v) => Math.round(clamp(amt > 0 ? v + (255 - v) * amt : v * (1 + amt), 0, 255));
  return `rgb(${f(r)}, ${f(g)}, ${f(b)})`;
}
function shadeA(h, amt, a) {
  const [r, g, b] = hexRgb(h);
  const f = (v) => Math.round(clamp(amt > 0 ? v + (255 - v) * amt : v * (1 + amt), 0, 255));
  return `rgba(${f(r)}, ${f(g)}, ${f(b)}, ${a})`;
}
function pulse(T, at, w) {
  const d = Math.abs(T - at);
  return d > w ? 0 : 1 - d / w;
}

function Robot({ accent, shellBase, scale }) {
  const { T, CUES, authoredTotal } = useComposition();
  const YEL = accent || C.yellow;
  const YEL_D = shade(YEL, -0.14);
  const SH = shellBase || C.shell;
  const SH_DEEP = shade(SH, -0.22);
  const SH_EDGE = shade(SH, 0.16);
  const total = authoredTotal || 5;

  const phase = (T / total) * Math.PI * 2;
  const floatY = Math.sin(phase) * 9;
  const bob = Math.sin(phase * 2) * 2.2;
  const sway = Math.sin(phase) * 1.6;

  const wStart = CUES["Saludo"];
  const wEnd = CUES["Volver"];
  const lift = MOTION.swing({ from: 0, to: 1, start: wStart - 0.35, end: wStart + 0.55 })(T);
  const drop = MOTION.swing({ from: 0, to: 1, start: wEnd + 0.15, end: wEnd + 0.85 })(T);
  const raised = clamp(lift - drop, 0, 1);
  const armRot = interpolate([0, 1], [6, -128])(raised);
  const flap = raised * Math.sin((T - wStart) * 11) * 15;

  const tilt = raised * 3.5 + sway * 0.6;
  const rise = raised * -6;

  const blink = Math.max(pulse(T, 1.15, 0.11), pulse(T, 3.55, 0.11));
  const eyeH = interpolate([0, 1], [1, 0.08])(blink);
  const cheer = raised;
  const smileH = interpolate([0, 1], [15, 20], Easing.easeOutQuad)(cheer);

  const antennaSwing = Math.sin(phase + 0.6) * 7 + raised * -10;
  const dotDrift = Math.sin(phase * 1.5 + 1.2) * 6;
  const glowScale = 1 + Math.sin(phase) * 0.06 + raised * 0.05;

  const abs = (s) => ({ position: "absolute", ...s });
  const s = scale || 1;

  return (
    <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", pointerEvents: "none" }}>
      <div style={{ position: "relative", width: 360, height: 360, transform: `scale(${s})`, transformOrigin: "50% 100%" }}>
        <div style={abs({ left: "50%", top: 296, width: 150, height: 20, marginLeft: -75, borderRadius: "50%", background: "radial-gradient(closest-side, rgba(20,22,26,0.30), rgba(20,22,26,0))", transform: `translateY(${floatY * 0.35}px) scaleX(${1 - floatY * 0.004})`, opacity: 0.55 - floatY * 0.008 })} />
        <div style={abs({ left: "50%", top: 60, width: 240, height: 240, marginLeft: -120, borderRadius: "50%", background: `radial-gradient(closest-side, ${shadeA(YEL, 0, 0.16)}, ${shadeA(YEL, 0, 0)})`, transform: `translateY(${floatY}px) scale(${glowScale})` })} />
        <div style={abs({ left: 0, top: 0, width: 360, height: 360, transform: `translate(${sway}px, ${floatY + bob + rise}px) rotate(${tilt}deg)`, transformOrigin: "50% 78%" })}>
          <div style={abs({ left: 236, top: 66, width: 10, height: 42, borderRadius: 6, background: SH_EDGE, transform: `rotate(${antennaSwing}deg)`, transformOrigin: "50% 100%" })} />
          <div style={abs({ left: 222, top: 40, width: 38, height: 38, borderRadius: "50%", background: `radial-gradient(circle at 32% 28%, ${C.light}, #C9CFD6)`, boxShadow: "0 6px 18px rgba(0,0,0,0.28)", transform: `translate(${antennaSwing * 0.45}px, ${antennaSwing * -0.1}px)` })} />
          {[132, 190].map((x) => (
            <div key={x} style={abs({ left: x, top: 250, width: 38, height: 52, borderRadius: 14, background: `linear-gradient(180deg, ${SH}, ${SH_DEEP})` })} />
          ))}
          <div style={abs({ left: 84, top: 150, width: 26, height: 82, borderRadius: 13, background: `linear-gradient(180deg, ${SH}, ${SH_DEEP})`, transform: `rotate(${-8 + sway * 1.4}deg)`, transformOrigin: "50% 10%" })} />
          <div style={abs({ left: 104, top: 84, width: 154, height: 178, borderRadius: 44, background: `linear-gradient(165deg, ${SH_EDGE} 0%, ${SH} 42%, ${SH_DEEP} 100%)`, boxShadow: "0 22px 44px rgba(12,14,18,0.32), inset 0 2px 0 rgba(255,255,255,0.06)" })} />
          <div style={abs({ left: 122, top: 100, width: 118, height: 104, borderRadius: 30, background: `linear-gradient(160deg, ${YEL} 0%, ${YEL_D} 100%)`, boxShadow: `inset 0 -3px 0 rgba(0,0,0,0.10), 0 4px 14px ${shadeA(YEL, -0.1, 0.3)}` })}>
            {[30, 66].map((x) => (
              <div key={x} style={abs({ left: x, top: 34, width: 13, height: 17, borderRadius: 7, background: C.ink, transform: `scaleY(${eyeH})`, transformOrigin: "50% 50%" })} />
            ))}
            <svg width="60" height="34" viewBox="0 0 60 34" style={abs({ left: 29, top: 58, overflow: "visible" })}>
              <path d={`M 6 4 Q 30 ${8 + smileH * 1.1} 54 4`} fill="none" stroke={C.ink} strokeWidth="6" strokeLinecap="round" />
            </svg>
          </div>
          <div style={abs({ left: 128, top: 216, width: 106, height: 22, borderRadius: 11, background: SH_DEEP, boxShadow: "inset 0 2px 4px rgba(0,0,0,0.35)" })} />
          <div style={abs({ left: 134, top: 223, width: 94, height: 8, borderRadius: 4, background: shadeA(YEL, 0, 0.25 + raised * 0.5) })} />
          <div style={abs({ left: 250, top: 150, width: 26, height: 82, borderRadius: 13, background: `linear-gradient(180deg, ${SH_EDGE}, ${SH})`, transform: `rotate(${armRot + flap}deg)`, transformOrigin: "50% 10%", boxShadow: "0 8px 18px rgba(12,14,18,0.30)" })}>
            <div style={abs({ left: -3, bottom: -6, width: 32, height: 32, borderRadius: "50%", background: `linear-gradient(180deg, ${SH_EDGE}, ${SH_DEEP})` })} />
          </div>
        </div>
        <div style={abs({ left: 60, top: 196, width: 22, height: 22, borderRadius: "50%", background: `radial-gradient(circle at 34% 30%, ${C.light}, #C9CFD6)`, transform: `translate(${-dotDrift * 0.6}px, ${dotDrift}px)`, opacity: 0.95 })} />
        <div style={abs({ left: 292, top: 246, width: 12, height: 12, borderRadius: "50%", background: YEL, transform: `translate(${dotDrift * 0.5}px, ${-dotDrift * 0.8}px)`, opacity: 0.85 })} />
      </div>
    </div>
  );
}

window.MascotaRobot = Robot;
module.exports = { MascotaRobot: Robot };
