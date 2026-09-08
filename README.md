# PuntoMatica — Landing

Sitio estático. No requiere build.

## Estructura
- `index.html` — la página completa
- `support.js` — runtime del componente
- `assets/` — imágenes, íconos, logos y las mascotas animadas (.jsx)

## Deploy en Vercel
1. Sube esta carpeta a un repositorio de GitHub.
2. En Vercel: **Add New → Project → Import** el repo.
3. **Framework Preset: Other** (NO Node.js). Sin Build Command. **Output Directory:** `.` (o `site` si subes el repo completo).
4. Deploy.

## vercel.json
Incluido, deja el sitio como estático puro.
