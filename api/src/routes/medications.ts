import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import { supabase } from '../db/index.js';
import { authenticateJWT, type AuthRequest } from '../middleware/auth.js';

const router = Router();

const stockSchema = z.object({
  pharmacy_id: z.number().positive(),
  medication_id: z.number().positive(),
  quantity: z.number().min(0),
  price: z.number().positive()
});

router.get('/', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase.from('medications').select('*').order('name', { ascending: true });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Erreur médicaments' });
  }
});

router.post('/stocks', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    const { pharmacy_id, medication_id, quantity, price } = stockSchema.parse(req.body);
    if (req.user.role !== 'super_admin' && req.user.pharmacy_id !== pharmacy_id) {
      return res.status(403).json({ error: 'Accès refusé' });
    }
    const { data, error } = await supabase.from('stocks').insert([{ pharmacy_id, medication_id, quantity, price }]).select().single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err: any) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.issues[0]?.message });
    res.status(500).json({ error: 'Erreur ajout stock' });
  }
});

router.delete('/stocks/:id', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    const { data: stock } = await supabase.from('stocks').select('pharmacy_id').eq('id', req.params.id).single();
    if (!stock) return res.status(404).json({ error: 'Stock non trouvé' });
    
    if (req.user.role !== 'super_admin' && req.user.pharmacy_id !== stock.pharmacy_id) {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    const { error } = await supabase.from('stocks').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Erreur suppression stock' });
  }
});

export default router;
