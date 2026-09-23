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

// Le fichier worker importe lui-même un module compagnon (code partagé avec
// le bundle principal) : les deux doivent être copiés ensemble, sinon le
// worker charge bien mais échoue au premier `import` interne.
const distDir = path.join(__dirname, '..', 'node_modules', 'maplibre-gl', 'dist');
const destDir = path.join(__dirname, '..', 'public', 'maps');
const files = ['maplibre-gl-worker.mjs', 'maplibre-gl-shared.mjs'];

fs.mkdirSync(destDir, { recursive: true });
for (const file of files) {
  fs.copyFileSync(path.join(distDir, file), path.join(destDir, file));
  console.log(`[copy-maplibre-worker] copié vers ${path.relative(process.cwd(), path.join(destDir, file))}`);
}
