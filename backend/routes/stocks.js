const router = require('express').Router();
const db = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');

// POST /stocks - Ajout ou mise à jour de stock
router.post('/', requireAuth, requireRole('pharmacy_admin', 'super_admin'), async (req, res) => {
  const { pharmacy_id, medication_id, quantity, price } = req.body;
  if (!pharmacy_id || !medication_id || quantity === undefined || price === undefined) {
    return res.status(400).json({ error: 'Champs requis manquants' });
  }

  if (req.user.role === 'pharmacy_admin' && req.user.pharmacy_id !== parseInt(pharmacy_id)) {
    return res.status(403).json({ error: 'Accès refusé' });
  }

  try {
    const { rows } = await db.query(
      `INSERT INTO pharmacy_stocks (pharmacy_id, medication_id, quantity, price)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (pharmacy_id, medication_id)
       DO UPDATE SET quantity = $3, price = $4, updated_at = NOW()
       RETURNING *`,
      [pharmacy_id, medication_id, quantity, price]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// DELETE /stocks/:id - Supprimer un stock
router.delete('/:id', requireAuth, requireRole('pharmacy_admin', 'super_admin'), async (req, res) => {
  try {
    let queryText = 'DELETE FROM pharmacy_stocks WHERE id = $1 RETURNING *';
    let params = [req.params.id];

    if (req.user.role === 'pharmacy_admin') {
      queryText = 'DELETE FROM pharmacy_stocks WHERE id = $1 AND pharmacy_id = $2 RETURNING *';
      params = [req.params.id, req.user.pharmacy_id];
    }

    const { rows } = await db.query(queryText, params);
    if (!rows[0]) return res.status(404).json({ error: 'Stock introuvable' });
    res.json({ success: true, deleted: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
