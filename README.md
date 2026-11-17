# PuntoMatica — Sitio web

Sitio hecho con React + TypeScript + Tailwind CSS + Vite.

## Trabajar en local
```bash
npm install
npm run dev
```

## Publicar
`npm run build` genera la carpeta `dist/`. Vercel lo hace solo con cada cambio que llega a `main`
(configurado en `vercel.json`).

## Estructura
- `index.html` — entrada de Vite
- `src/App.tsx` — orden de las secciones
- `src/data.ts` — textos, teléfono, correo, catálogo y marcas
- `src/components/Hero.tsx` — portada con video de fondo en bucle continuo
- `src/components/BuildingDescent.tsx` — edificio con ascensor que baja al hacer scroll
- `src/components/ExplodedMachine.tsx` — máquina 3D que se desarma y arma al hacer scroll
- `src/components/Sections.tsx` — beneficios, catálogo, servicios, máquinas, marcas y pie
- `src/components/Contact.tsx` — formulario de evaluación
- `public/assets/` — fotos y logos
- `public/mascota/` — mascota en SVG (se generan con `node mascota-v2/generar.mjs` y se copian aquí)
- `sitio-anterior/` — versión anterior del sitio (estática), guardada como respaldo
