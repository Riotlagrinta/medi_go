const router = require('express').Router();
const db = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');

const isSuperAdmin = [requireAuth, requireRole('super_admin')];

// GET /admin/stats
router.get('/stats', ...isSuperAdmin, async (req, res) => {
  try {
    const [users, pharmacies, orders, revenue] = await Promise.all([
      db.query('SELECT COUNT(*) FROM users'),
      db.query('SELECT COUNT(*) FROM pharmacies'),
      db.query("SELECT COUNT(*) FROM reservations WHERE status != 'cancelled'"),
      db.query("SELECT COALESCE(SUM(ps.price * r.quantity), 0) FROM reservations r JOIN pharmacy_stocks ps ON ps.pharmacy_id = r.pharmacy_id AND ps.medication_id = r.medication_id WHERE r.status != 'cancelled'"),
    ]);
    res.json({
      users: parseInt(users.rows[0].count),
      pharmacies: parseInt(pharmacies.rows[0].count),
      orders: parseInt(orders.rows[0].count),
      revenue: parseFloat(revenue.rows[0].coalesce),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /admin/pharmacies?q=
router.get('/pharmacies', ...isSuperAdmin, async (req, res) => {
  const { q = '' } = req.query;
  try {
    const { rows } = await db.query(
      'SELECT * FROM pharmacies WHERE name ILIKE $1 ORDER BY created_at DESC',
      [`%${q}%`]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// PATCH /admin/pharmacies/:id/verify
router.patch('/pharmacies/:id/verify', ...isSuperAdmin, async (req, res) => {
  const { is_verified } = req.body;
  try {
    const { rows } = await db.query(
      'UPDATE pharmacies SET is_verified = $1 WHERE id = $2 RETURNING *',
      [is_verified, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Pharmacie introuvable' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /admin/users?q=
router.get('/users', ...isSuperAdmin, async (req, res) => {
  const { q = '' } = req.query;
  try {
    const { rows } = await db.query(
      `SELECT u.id, u.email, u.full_name, u.role, u.pharmacy_id, u.created_at,
              p.name AS pharmacy_name
       FROM users u
       LEFT JOIN pharmacies p ON p.id = u.pharmacy_id
       WHERE u.full_name ILIKE $1 OR u.email ILIKE $1
       ORDER BY u.created_at DESC`,
      [`%${q}%`]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// PATCH /admin/users/:id/role
router.patch('/users/:id/role', ...isSuperAdmin, async (req, res) => {
  const { role, pharmacy_id } = req.body;
  const allowed = ['patient', 'pharmacy_admin', 'super_admin'];
  if (!allowed.includes(role))
    return res.status(400).json({ error: 'Rôle invalide' });

  try {
    const { rows } = await db.query(
      'UPDATE users SET role = $1, pharmacy_id = $2 WHERE id = $3 RETURNING id, email, full_name, role, pharmacy_id',
      [role, pharmacy_id || null, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Utilisateur introuvable' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
