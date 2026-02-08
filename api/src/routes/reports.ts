import { Router, type Request, type Response } from 'express';
import { supabase } from '../db/index.js';
import { authenticateJWT, type AuthRequest } from '../middleware/auth.js';

const router = Router();

router.use(authenticateJWT);

router.get('/sales', async (req: AuthRequest, res: Response) => {
  try {
    // Vérifier si admin de pharmacie
    if (req.user.role !== 'pharmacy_admin') return res.status(403).json({ error: 'Accès interdit' });

    // Récupérer les ventes (réservations payées + ordonnances payées)
    const { data: sales, error } = await supabase
      .from('payments')
      .select('*, reservations(medications(name, price))')
      .eq('status', 'approved');

    if (error) throw error;

    // Calculs sommaires
    const totalRevenue = sales.reduce((sum, sale) => sum + sale.amount, 0);
    const count = sales.length;

    // Ici on pourrait utiliser PDFKit pour générer un binaire
    // Pour l'instant, on renvoie les data, le frontend fera un joli "window.print()"
    res.json({
      generated_at: new Date(),
      pharmacy_id: req.user.pharmacy_id,
      total_revenue: totalRevenue,
      transaction_count: count,
      transactions: sales.map(s => ({
        date: s.created_at,
        amount: s.amount,
        item: s.reservations?.medications?.name || 'Produit divers'
      }))
    });

  } catch (err) {
    res.status(500).json({ error: 'Erreur rapport' });
  }
});

export default router;
