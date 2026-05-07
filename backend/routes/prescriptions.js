const router = require('express').Router();
const db = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');

// GET /prescriptions  — pour pharmacy_admin : liste de sa pharmacie
router.get('/', requireAuth, requireRole('pharmacy_admin', 'super_admin'), async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT pr.*, u.full_name, u.phone
       FROM prescriptions pr
       JOIN users u ON u.id = pr.user_id
       WHERE pr.pharmacy_id = $1
       ORDER BY pr.created_at DESC`,
      [req.user.pharmacy_id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /prescriptions  — patient envoie une ordonnance
router.post('/', requireAuth, async (req, res) => {
  const { pharmacy_id, image_url } = req.body;
  if (!pharmacy_id || !image_url)
    return res.status(400).json({ error: 'pharmacy_id et image_url requis' });

  try {
    const { rows } = await db.query(
      `INSERT INTO prescriptions (user_id, pharmacy_id, image_url)
       VALUES ($1, $2, $3) RETURNING *`,
      [req.user.id, pharmacy_id, image_url]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// PATCH /prescriptions/:id/status  — pharmacie met à jour le statut
router.patch('/:id/status', requireAuth, requireRole('pharmacy_admin', 'super_admin'), async (req, res) => {
  const { status } = req.body;
  const allowed = ['pending', 'ready', 'rejected', 'picked_up'];
  if (!allowed.includes(status))
    return res.status(400).json({ error: 'Statut invalide' });

  try {
    const { rows } = await db.query(
      'UPDATE prescriptions SET status = $1 WHERE id = $2 AND pharmacy_id = $3 RETURNING *',
      [status, req.params.id, req.user.pharmacy_id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Ordonnance introuvable' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
