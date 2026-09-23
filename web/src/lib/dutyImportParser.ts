// Parseur "best effort" pour la liste hebdomadaire des pharmacies de garde au Togo,
// telle que publiée en texte libre (ex: relayée par La Cinquième, l'Ordre National
// des Pharmaciens, ou copiée depuis Facebook/WhatsApp). Le format n'est pas structuré
// (pas de JSON/CSV officiel), donc ce parseur est heuristique : il doit toujours être
// utilisé via un écran de prévisualisation où un humain valide avant d'écrire en base.

export interface ParsedDutyPharmacy {
  name: string;
  address: string;
  city: string;
  phone: string;
  insurances: string[];
  raw: string;
}

// Coordonnées approximatives (centre-ville) utilisées uniquement en secours quand une
// pharmacie nouvellement importée n'a pas de géolocalisation précise disponible.
export const CITY_FALLBACK_COORDS: Record<string, { lat: number; lng: number }> = {
  'Lomé':     { lat: 6.1372,  lng: 1.2255 },
  'Dapaong':  { lat: 10.8620, lng: 0.2060 },
  'Kara':     { lat: 9.5511,  lng: 1.1861 },
  'Kpalimé':  { lat: 6.9000,  lng: 0.6333 },
  'Sokodé':   { lat: 8.9833,  lng: 1.1333 },
  'Atakpamé': { lat: 7.5333,  lng: 1.1333 },
  'Tsévié':   { lat: 6.4167,  lng: 1.2167 },
  'Aného':    { lat: 6.2333,  lng: 1.6000 },
  'Bassar':   { lat: 9.2500,  lng: 0.7833 },
  'Notsé':    { lat: 6.9333,  lng: 1.1500 },
  'Vogan':    { lat: 6.3333,  lng: 1.5333 },
  'Mango':    { lat: 10.3667, lng: 0.4667 },
};

const CITY_HEADER_ALIASES: Record<string, string> = {
  DAPAONG: 'Dapaong',
  KARA: 'Kara',
  KPALIME: 'Kpalimé',
  "KPALIMÉ": 'Kpalimé',
  SOKODE: 'Sokodé',
  "SOKODÉ": 'Sokodé',
  LOME: 'Lomé',
  "LOMÉ": 'Lomé',
  ATAKPAME: 'Atakpamé',
  "ATAKPAMÉ": 'Atakpamé',
  TSEVIE: 'Tsévié',
  "TSÉVIÉ": 'Tsévié',
  ANEHO: 'Aného',
  "ANÉHO": 'Aného',
  BASSAR: 'Bassar',
  NOTSE: 'Notsé',
  "NOTSÉ": 'Notsé',
  VOGAN: 'Vogan',
  MANGO: 'Mango',
};

function normalizeForCompare(s: string) {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // enlève les accents
    .toUpperCase()
    .trim();
}

function isCityHeaderLine(line: string): string | null {
  const trimmed = line.trim();
  if (!trimmed || trimmed.length > 30) return null;
  if (/pharmacie/i.test(trimmed)) return null;
  if (/[a-zàâäéèêëïîôöùûüç]/.test(trimmed)) return null; // doit être tout en majuscules
  const key = normalizeForCompare(trimmed).replace(/\s+/g, '');
  return CITY_HEADER_ALIASES[key] ?? null;
}

// Sépare "NOM DE LA PHARMACIE" (généralement en MAJUSCULES) du reste de l'adresse
// en texte libre. Heuristique : on prend la plus longue suite de mots en majuscules
// en tête de chaîne (jusqu'à 6 mots), le reste est considéré comme l'adresse.
function splitNameAndAddress(label: string): { name: string; address: string } {
  const words = label.trim().split(/\s+/);
  const nameWords: string[] = [];
  for (const w of words) {
    if (nameWords.length >= 6) break;
    const letters = w.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ]/g, '');
    const isUpper = letters.length > 0 && letters === letters.toUpperCase();
    if (isUpper || /^\d+$/.test(w)) {
      nameWords.push(w);
    } else {
      break;
    }
  }
  if (nameWords.length === 0) nameWords.push(words[0] ?? '');
  const name = nameWords.join(' ').trim();
  const address = words.slice(nameWords.length).join(' ').trim() || label.trim();
  return { name, address };
}

export function parseDutyRoster(rawText: string): { entries: ParsedDutyPharmacy[]; unmatched: string[] } {
  const lines = rawText.split(/\r?\n/);

  let currentCity = 'Lomé';
  const streamParts: string[] = [];

  for (const line of lines) {
    const cityMatch = isCityHeaderLine(line);
    if (cityMatch) {
      currentCity = cityMatch;
      streamParts.push(`\u0000CITY:${currentCity}\u0000`); // marqueur inline de changement de ville
      continue;
    }
    streamParts.push(line);
  }

  const stream = streamParts.join(' ');

  // Découpe sur chaque occurrence de "Pharmacie " (insensible à la casse), en
  // gérant le cas où deux entrées se retrouvent collées sans séparateur après le
  // numéro de téléphone (artefact fréquent en copier-coller).
  const chunks = stream.split(/(?=\bPharmacie\s)/i).map((c) => c.trim()).filter(Boolean);

  const entries: ParsedDutyPharmacy[] = [];
  const unmatched: string[] = [];
  let cityForNext = 'Lomé';

  for (const chunk of chunks) {
    // Un marqueur de ville dans ce chunk apparaît toujours APRÈS le contenu de
    // l'entrée courante (le découpage se fait sur "Pharmacie "), donc il concerne
    // l'entrée SUIVANTE : on utilise la ville en vigueur avant ce chunk pour lui,
    // puis on met à jour le contexte pour la prochaine itération.
    const entryCity = cityForNext;
    const cityMarkers = [...chunk.matchAll(/\u0000CITY:([^\u0000]+)\u0000/g)];
    if (cityMarkers.length) cityForNext = cityMarkers[cityMarkers.length - 1][1];
    const working = chunk.replace(/\u0000CITY:[^\u0000]+\u0000/g, ' ').replace(/\s+/g, ' ').trim();

    const withoutPrefix = working.replace(/^Pharmacie\s+/i, '');

    const phoneMatch = withoutPrefix.match(/☎️?\s*(\+?228\s?\d{2}\s?\d{2}\s?\d{2}\s?\d{2}|\+?228\d{8})/);
    if (!phoneMatch) {
      unmatched.push(chunk);
      continue;
    }
    const phone = phoneMatch[1].replace(/\s+/g, '');
    const beforePhone = withoutPrefix.slice(0, phoneMatch.index).trim();
    const afterPhone = withoutPrefix.slice((phoneMatch.index ?? 0) + phoneMatch[0].length).trim();

    const { name, address } = splitNameAndAddress(beforePhone);

    let insurances: string[] = [];
    const assuranceMatch = afterPhone.match(/Assurances?\s*:?\s*(.+)$/i);
    if (assuranceMatch) {
      insurances = assuranceMatch[1].trim().split(/\s{2,}|\s+(?=[A-ZÉÈÀ][A-Z'-]*\s|$)/).filter(Boolean);
      // Repli simple si la séparation ci-dessus échoue à isoler des tokens pertinents :
      if (insurances.length === 0) insurances = assuranceMatch[1].trim().split(/\s+/);
    }

    entries.push({
      name: `Pharmacie ${name}`.replace(/\s+/g, ' ').trim(),
      address: address || beforePhone,
      city: entryCity ?? 'Lomé',
      phone: phone.startsWith('+') ? phone : `+${phone}`,
      insurances,
      raw: chunk,
    });
  }

  return { entries, unmatched };
}
