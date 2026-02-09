import { Router, type Request, type Response } from 'express';
import { supabase } from '../db/index.js';
import { authenticateJWT, type AuthRequest } from '../middleware/auth.js';

const router = Router();

// Middleware pour vérifier que c'est un Super Admin
const requireSuperAdmin = (req: AuthRequest, res: Response, next: any) => {
  if (req.user?.role !== 'super_admin') return res.status(403).json({ error: 'Accès réservé au Super Admin' });
  next();
};

router.use(authenticateJWT);
router.use(requireSuperAdmin);

// Stats globales
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const { count: usersCount } = await supabase.from('users').select('*', { count: 'exact', head: true });
    const { count: pharmaciesCount } = await supabase.from('pharmacies').select('*', { count: 'exact', head: true });
    const { count: ordersCount } = await supabase.from('reservations').select('*', { count: 'exact', head: true });
    
    // Revenu simulé (somme des paiements 'approved')
    const { data: payments } = await supabase.from('payments').select('amount').eq('status', 'approved');
    const revenue = payments?.reduce((acc, curr) => acc + curr.amount, 0) || 0;

    res.json({
      users: usersCount,
      pharmacies: pharmaciesCount,
      orders: ordersCount,
      revenue
    });
  } catch (err) {
    res.status(500).json({ error: 'Erreur stats' });
  }
});

// Lister toutes les pharmacies (y compris celles non vérifiées)
router.get('/pharmacies', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase.from('pharmacies').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Erreur liste pharmacies' });
  }
});

// Valider une pharmacie (Badge Bleu)
router.patch('/pharmacies/:id/verify', async (req: Request, res: Response) => {
  try {
    const { is_verified } = req.body; // true ou false
    const { data, error } = await supabase
      .from('pharmacies')
      .update({ is_verified: is_verified }) // Assurez-vous d'avoir ajouté cette colonne en DB si elle manque
      .eq('id', req.params.id)
      .select()
      .single();
      
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Erreur validation' });
  }
});

// Lister tous les utilisateurs
router.get('/users', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*, pharmacies(name)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Erreur liste utilisateurs' });
  }
});

// Modifier le rôle et la pharmacie d'un utilisateur
router.patch('/users/:id/role', async (req: Request, res: Response) => {
  try {
    const { role, pharmacy_id } = req.body;
    const { data, error } = await supabase
      .from('users')
      .update({ role, pharmacy_id })
      .eq('id', req.params.id)
      .select()
      .single();
    
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Erreur mise à jour rôle' });
  }
});

export default router;
