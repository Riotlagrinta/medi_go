const router = require('express').Router();
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

// GET /messages/:pharmacy_id  — conversation patient <-> pharmacie
router.get('/:pharmacy_id', requireAuth, async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT * FROM messages
       WHERE pharmacy_id = $1 AND user_id = $2
       ORDER BY created_at ASC
       LIMIT 100`,
      [req.params.pharmacy_id, req.user.id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /messages
router.post('/', requireAuth, async (req, res) => {
  const { pharmacy_id, content, is_from_pharmacy = false } = req.body;
  if (!pharmacy_id || !content)
    return res.status(400).json({ error: 'pharmacy_id et content requis' });

  try {
    const { rows } = await db.query(
      `INSERT INTO messages (user_id, pharmacy_id, content, is_from_pharmacy)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [req.user.id, pharmacy_id, content, is_from_pharmacy]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
