import { Router, type Request, type Response } from 'express';
import { supabase } from '../db/index.js';

const router = Router();

router.get('/on-duty', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase.from('pharmacies').select('*').eq('is_on_duty', true);
    if (error) throw error;
    res.json(data);
  } catch (err) { res.status(500).json({ error: 'Erreur pharmacies de garde' }); }
});

router.get('/nearby', async (req: Request, res: Response) => {
  const { lat, lng, radius = 10000 } = req.query;
  try {
    const { data, error } = await supabase.rpc('search_pharmacies', {
      search_query: '%%',
      user_lat: parseFloat(lat as string),
      user_lng: parseFloat(lng as string),
      radius_meters: parseInt(radius as string)
    });
    if (error) throw error;
    res.json(data);
  } catch (err) { res.status(500).json({ error: 'Erreur à proximité' }); }
});

router.get('/:id/stocks', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase.from('stocks').select(`id, quantity, price, medications (id, name, category)`).eq('pharmacy_id', req.params.id);
    if (error) throw error;
    res.json(data.map((s: any) => ({ stock_id: s.id, medication_id: s.medications.id, name: s.medications.name, price: s.price, category: s.medications.category, quantity: s.quantity })));
  } catch (err) { res.status(500).json({ error: 'Erreur stocks' }); }
});

export default router;
