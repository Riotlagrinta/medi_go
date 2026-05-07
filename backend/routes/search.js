const router = require('express').Router();
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

// GET /search?q=paracetamol&lat=6.13&lng=1.22&radius=10000
router.get('/', requireAuth, async (req, res) => {
  const { q = '', lat = 6.1372, lng = 1.2255, radius = 10000 } = req.query;
  try {
    const { rows } = await db.query(
      `SELECT
         p.id            AS pharmacy_id,
         p.name          AS pharmacy_name,
         p.address,
         p.phone,
         p.is_on_duty,
         p.is_verified,
         p.lat,
         p.lng,
         m.id            AS medication_id,
         m.name          AS medication_name,
         ps.price,
         ps.quantity,
         ROUND(
           6371000 * acos(
             cos(radians($2::float)) * cos(radians(p.lat)) *
             cos(radians(p.lng) - radians($3::float)) +
             sin(radians($2::float)) * sin(radians(p.lat))
           )
         ) AS distance
       FROM pharmacy_stocks ps
       JOIN pharmacies p  ON p.id  = ps.pharmacy_id
       JOIN medications m ON m.id  = ps.medication_id
       WHERE ps.quantity > 0
         AND ($1 = '' OR m.name ILIKE $4)
         AND (
           6371000 * acos(
             cos(radians($2::float)) * cos(radians(p.lat)) *
             cos(radians(p.lng) - radians($3::float)) +
             sin(radians($2::float)) * sin(radians(p.lat))
           )
         ) <= $5::float
       ORDER BY distance ASC
       LIMIT 50`,
      [q, lat, lng, `%${q}%`, radius]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
