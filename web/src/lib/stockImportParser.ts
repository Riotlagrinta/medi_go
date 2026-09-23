// Parseur "best effort" pour importer un stock en masse depuis du texte
// CSV/TSV collé (export Excel/Google Sheets, ou logiciel de caisse existant
// de la pharmacie). Il n'existe pas de format officiel côté pharmacies
// togolaises, donc ce parseur reste heuristique : il passe toujours par un
// écran de prévisualisation avant d'écrire quoi que ce soit en base.
//
// Format attendu, une ligne par médicament : nom ; prix ; quantité
// (virgule ou tabulation acceptées aussi comme séparateur de colonnes).

export interface ParsedStockRow {
  name: string;
  price: number;
  quantity: number;
  raw: string;
}

function detectDelimiter(sampleLine: string): string {
  const counts: [string, number][] = [
    [';', (sampleLine.match(/;/g) || []).length],
    ['\t', (sampleLine.match(/\t/g) || []).length],
    [',', (sampleLine.match(/,/g) || []).length],
  ];
  counts.sort((a, b) => b[1] - a[1]);
  return counts[0][1] > 0 ? counts[0][0] : ',';
}

// Excel en français exporte les décimales avec une virgule ("1500,50") et
// utilise alors le point-virgule comme séparateur de colonnes. On ne traite
// la virgule comme séparateur décimal que si elle n'est pas déjà le
// délimiteur de colonnes (sinon "1500,50" serait coupé en deux colonnes).
function parseNumber(raw: string, delimiter: string): number | null {
  let s = raw.trim().replace(/[\s ]/g, ''); // espaces normaux + insécables (milliers)
  if (delimiter !== ',' && /^\d+,\d{1,2}$/.test(s)) {
    s = s.replace(',', '.');
  }
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

export function parseStockCsv(rawText: string): { rows: ParsedStockRow[]; unmatched: string[] } {
  const lines = rawText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) return { rows: [], unmatched: [] };

  const delimiter = detectDelimiter(lines[0]);
  const rows: ParsedStockRow[] = [];
  const unmatched: string[] = [];

  for (const line of lines) {
    const cols = line.split(delimiter).map((c) => c.trim());
    if (cols.length < 3) {
      unmatched.push(line);
      continue;
    }

    const [name, priceRaw, quantityRaw] = cols;
    const price = parseNumber(priceRaw, delimiter);
    const quantity = parseNumber(quantityRaw, delimiter);

    // Ligne d'en-tête probable (ex: "Nom;Prix;Quantité") : ni le prix ni la
    // quantité ne ressemblent à un nombre -> on l'ignore silencieusement.
    if (price === null && quantity === null && !/^-?\d/.test(priceRaw) && !/^-?\d/.test(quantityRaw)) {
      continue;
    }

    if (!name || price === null || quantity === null) {
      unmatched.push(line);
      continue;
    }

    rows.push({ name, price, quantity: Math.max(0, Math.round(quantity)), raw: line });
  }

  return { rows, unmatched };
}
