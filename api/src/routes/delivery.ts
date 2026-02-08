import { Router, type Request, type Response } from 'express';
import { supabase } from '../db/index.js';
import { authenticateJWT, type AuthRequest } from '../middleware/auth.js';

const router = Router();

// Middleware: Vérifier si c'est un livreur
const requireCourier = (req: AuthRequest, res: Response, next: any) => {
  // Dans un vrai cas, on aurait user.role === 'courier'. 
  // Ici on accepte tout user authentifié pour la démo, ou on checke un rôle spécifique.
  // if (req.user?.role !== 'courier') ...
  next();
};

router.use(authenticateJWT);
router.use(requireCourier);

// Voir les livraisons disponibles (status = pending)
router.get('/available', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('deliveries')
      .select('*, reservations(id, medications(name))')
      .eq('status', 'pending');
    
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Erreur récupération courses' });
  }
});

// Accepter une livraison
router.post('/:id/accept', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('deliveries')
      .update({ status: 'accepted', courier_id: req.user.id })
      .eq('id', id)
      .eq('status', 'pending') // S'assurer qu'elle n'est pas déjà prise
      .select()
      .single();

    if (error || !data) return res.status(400).json({ error: 'Course non disponible' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Erreur acceptation' });
  }
});

// Mettre à jour le statut (picked_up, delivered)
router.patch('/:id/status', async (req: Request, res: Response) => {
  try {
    const { status, lat, lng } = req.body;
    const { data, error } = await supabase
      .from('deliveries')
      .update({ status, courier_lat: lat, courier_lng: lng, updated_at: new Date() })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Erreur mise à jour' });
  }
});

export default router;
