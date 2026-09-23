import { NextRequest } from 'next/server';
import { checkRateLimit, getClientIp, rateLimited } from '@/lib/rateLimit';

// Calcule un itinéraire routier via OpenRouteService (clé API gratuite, quota
// largement suffisant pour notre volume). L'appel se fait côté serveur pour
// ne jamais exposer la clé au navigateur, et pour pouvoir le limiter/logguer.
export async function POST(req: NextRequest) {
  const apiKey = process.env.ORS_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "Le calcul d'itinéraire n'est pas encore configuré (clé API manquante)." },
      { status: 503 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const { startLat, startLng, endLat, endLng } = body ?? {};
  const coords = [startLat, startLng, endLat, endLng];
  if (coords.some((c) => typeof c !== 'number' || Number.isNaN(c))) {
    return Response.json({ error: 'Coordonnées invalides.' }, { status: 400 });
  }

  // Anti-abus : protège notre quota gratuit OpenRouteService (2000 req/jour).
  const ip = getClientIp(req);
  const ok = await checkRateLimit(`directions:ip:${ip}`, 20, 60 * 60);
  if (!ok) return rateLimited();

  try {
    const res = await fetch('https://api.openrouteservice.org/v2/directions/driving-car/geojson', {
      method: 'POST',
      headers: {
        Authorization: apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ coordinates: [[startLng, startLat], [endLng, endLat]] }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      console.error('Échec OpenRouteService:', res.status, detail);
      const status = res.status === 429 ? 429 : 502;
      return Response.json({ error: "Impossible de calculer l'itinéraire pour le moment." }, { status });
    }

    const data = await res.json();
    const feature = data.features?.[0];
    if (!feature) {
      return Response.json({ error: 'Aucun itinéraire trouvé.' }, { status: 404 });
    }

    const summary = feature.properties?.summary ?? {};
    return Response.json({
      geometry: feature.geometry,
      distanceMeters: typeof summary.distance === 'number' ? summary.distance : null,
      durationSeconds: typeof summary.duration === 'number' ? summary.duration : null,
    });
  } catch (err) {
    console.error('Erreur appel OpenRouteService:', err);
    return Response.json({ error: "Impossible de calculer l'itinéraire pour le moment." }, { status: 502 });
  }
}
