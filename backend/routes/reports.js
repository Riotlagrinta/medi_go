const router = require('express').Router();
const db = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');

// GET /reports/sales  — chiffre d'affaires du jour pour la pharmacie connectée
router.get('/sales', requireAuth, requireRole('pharmacy_admin', 'super_admin'), async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT
         COALESCE(SUM(ps.price * r.quantity), 0) AS total_revenue,
         COUNT(r.id)                              AS transaction_count,
         NOW()                                    AS generated_at,
         json_agg(json_build_object(
           'date',   r.created_at,
           'item',   m.name,
           'amount', ps.price * r.quantity
         ) ORDER BY r.created_at DESC) AS transactions
       FROM reservations r
       JOIN pharmacy_stocks ps ON ps.pharmacy_id = r.pharmacy_id AND ps.medication_id = r.medication_id
       JOIN medications m ON m.id = r.medication_id
       WHERE r.pharmacy_id = $1
         AND r.status != 'cancelled'
         AND r.created_at >= CURRENT_DATE`,
      [req.user.pharmacy_id]
    );
    const result = rows[0];
    res.json({
      total_revenue: parseFloat(result.total_revenue),
      transaction_count: parseInt(result.transaction_count),
      generated_at: result.generated_at,
      transactions: result.transactions || [],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
