const router = require('express').Router();
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

// GET /reservations  — historique du patient connecté
router.get('/', requireAuth, async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT r.*, m.name AS medication_name, p.name AS pharmacy_name, p.address AS pharmacy_address, ps.price
       FROM reservations r
       JOIN medications m ON m.id = r.medication_id
       JOIN pharmacies p  ON p.id  = r.pharmacy_id
       JOIN pharmacy_stocks ps ON ps.pharmacy_id = r.pharmacy_id AND ps.medication_id = r.medication_id
       WHERE r.user_id = $1
       ORDER BY r.created_at DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /reservations
router.post('/', requireAuth, async (req, res) => {
  const { pharmacy_id, medication_id, quantity = 1 } = req.body;
  if (!pharmacy_id || !medication_id)
    return res.status(400).json({ error: 'pharmacy_id et medication_id requis' });

  try {
    const stock = await db.query(
      'SELECT quantity FROM pharmacy_stocks WHERE pharmacy_id = $1 AND medication_id = $2',
      [pharmacy_id, medication_id]
    );
    if (!stock.rows[0] || stock.rows[0].quantity < quantity)
      return res.status(400).json({ error: 'Stock insuffisant' });

    const { rows } = await db.query(
      `INSERT INTO reservations (user_id, pharmacy_id, medication_id, quantity)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [req.user.id, pharmacy_id, medication_id, quantity]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
