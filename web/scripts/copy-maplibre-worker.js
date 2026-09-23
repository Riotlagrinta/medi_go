// MapLibre GL calcule l'URL de son web worker à partir de `import.meta.url` au
// runtime. Une fois la lib regroupée par le bundler de Next.js dans un chunk,
// cette URL calculée ne correspond plus à aucun fichier réel (Next répond avec
// sa page 404 HTML, que le navigateur refuse de charger comme module JS :
// "non-JavaScript MIME type of text/html").
//
// Fix recommandé par MapLibre pour les bundlers : servir nous-mêmes une copie
// du fichier worker et l'indiquer explicitement via `setWorkerUrl()` (voir
// PharmacyMap.tsx). Ce script copie ce fichier depuis node_modules vers
// public/ à chaque build, pour rester automatiquement synchronisé avec la
// version de maplibre-gl installée.

const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, '..', 'node_modules', 'maplibre-gl', 'dist', 'maplibre-gl-worker.mjs');
const destDir = path.join(__dirname, '..', 'public', 'maps');
const dest = path.join(destDir, 'maplibre-gl-worker.mjs');

fs.mkdirSync(destDir, { recursive: true });
fs.copyFileSync(src, dest);
console.log(`[copy-maplibre-worker] copié vers ${path.relative(process.cwd(), dest)}`);
