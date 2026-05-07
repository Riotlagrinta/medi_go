const router = require('express').Router();
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

// GET /appointments
router.get('/', requireAuth, async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT a.*, p.name AS pharmacy_name, p.address AS pharmacy_address
       FROM appointments a
       JOIN pharmacies p ON p.id = a.pharmacy_id
       WHERE a.user_id = $1
       ORDER BY a.appointment_date DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /appointments
router.post('/', requireAuth, async (req, res) => {
  const { pharmacy_id, appointment_date, reason } = req.body;
  if (!pharmacy_id || !appointment_date)
    return res.status(400).json({ error: 'pharmacy_id et appointment_date requis' });

  try {
    const { rows } = await db.query(
      `INSERT INTO appointments (user_id, pharmacy_id, appointment_date, reason)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [req.user.id, pharmacy_id, appointment_date, reason || 'Consultation']
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
