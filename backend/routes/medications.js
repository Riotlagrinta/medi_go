const router = require('express').Router();
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

// GET /medications
router.get('/', requireAuth, async (req, res) => {
  const { q = '' } = req.query;
  try {
    const { rows } = await db.query(
      'SELECT id, name, category, description FROM medications WHERE name ILIKE $1 ORDER BY name ASC',
      [`%${q}%`]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
