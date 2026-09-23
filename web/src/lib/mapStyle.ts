import { layers, namedFlavor, type Flavor } from '@protomaps/basemaps';
import type { StyleSpecification } from 'maplibre-gl';

// Palette MediGo (emerald) appliquée par-dessus le thème clair par défaut de
// Protomaps, pour que la carte s'accorde avec le reste de l'app plutôt que de
// garder les couleurs génériques du thème d'origine.
const medigoFlavor: Flavor = {
  ...namedFlavor('light'),
  park_a: '#d1fae5',
  park_b: '#a7f3d0',
  water: '#bfdbfe',
  buildings: '#e2e8f0',
  pedestrian: '#f1f5f9',
  major: '#ffffff',
  major_casing_early: '#cbd5e1',
  major_casing_late: '#cbd5e1',
  highway: '#fef3c7',
  highway_casing_early: '#fde68a',
  highway_casing_late: '#fde68a',
};

// Carte auto-hébergée : les tuiles viennent de /maps/togo.pmtiles (servi comme
// simple fichier statique par Next.js, aucun appel à un serveur de tuiles tiers
// à l'affichage). Seuls les glyphes de police et le sprite restent chargés
// depuis les assets publics de Protomaps (fichiers statiques légers, pas une
// API de tuiles à fort trafic).
export function buildMapStyle(pmtilesUrl: string): StyleSpecification {
  return {
    version: 8,
    glyphs: 'https://protomaps.github.io/basemaps-assets/fonts/{fontstack}/{range}.pbf',
    sprite: 'https://protomaps.github.io/basemaps-assets/sprites/v4/light',
    sources: {
      protomaps: {
        type: 'vector',
        url: `pmtiles://${pmtilesUrl}`,
        attribution:
          '<a href="https://protomaps.com" target="_blank">Protomaps</a> © <a href="https://openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>',
      },
    },
    layers: layers('protomaps', medigoFlavor, { lang: 'fr' }),
  } as StyleSpecification;
}
