const router = require('express').Router();
const db = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');

// GET /pharmacies/on-duty
router.get('/on-duty', requireAuth, async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT * FROM pharmacies WHERE is_on_duty = TRUE ORDER BY name'
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /pharmacies/search?q=paix&lat=6.13&lng=1.22
router.get('/search', requireAuth, async (req, res) => {
  const { q = '', lat = 6.1372, lng = 1.2255 } = req.query;
  try {
    const { rows } = await db.query(
      `SELECT *,
         ROUND(
           6371000 * acos(
             cos(radians($2::float)) * cos(radians(lat)) *
             cos(radians(lng) - radians($3::float)) +
             sin(radians($2::float)) * sin(radians(lat))
           )
         ) AS distance
       FROM pharmacies
       WHERE name ILIKE $1
       ORDER BY distance ASC
       LIMIT 20`,
      [`%${q}%`, lat, lng]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /pharmacies/:id/prescriptions  (admin pharmacie)
router.get('/:id/prescriptions', requireAuth, async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT pr.*, u.full_name, u.phone
       FROM prescriptions pr
       JOIN users u ON u.id = pr.user_id
       WHERE pr.pharmacy_id = $1
       ORDER BY pr.created_at DESC`,
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
