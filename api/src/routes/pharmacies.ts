import { Router, type Request, type Response } from 'express';
import { supabase } from '../db/index.js';

const router = Router();

// Route pour toutes les pharmacies (utilisée par le mobile au démarrage)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase.from('pharmacies').select('*');
    
    if (error || !data) {
      console.warn('Database error or no data:', error);
      return res.json([]);
    }
    
    const formatted = data.map((p: any) => ({
      ...p,
      latitude: p.location?.coordinates ? p.location.coordinates[1] : 6.1375,
      longitude: p.location?.coordinates ? p.location.coordinates[0] : 1.2123
    }));
    
    res.json(formatted);
  } catch (err) { 
    console.error('Critical fetch pharmacies error:', err);
    res.json([]); // Toujours renvoyer un tableau vide au mobile pour éviter le crash
  }
});

router.get('/on-duty', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase.from('pharmacies').select('*').eq('is_on_duty', true);
    if (error) throw error;
    
    const formatted = data.map((p: any) => ({
      ...p,
      latitude: p.location?.coordinates ? p.location.coordinates[1] : 6.1375,
      longitude: p.location?.coordinates ? p.location.coordinates[0] : 1.2123
    }));
    
    res.json(formatted);
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
    const { q } = req.query;
    let queryBuilder = supabase
      .from('stocks')
      .select(`id, quantity, price, medications (id, name, category)`)
      .eq('pharmacy_id', req.params.id);
    
    if (q) {
      // Filtrer sur le nom du médicament via la jointure
      // Note: Supabase permet de filtrer sur les tables liées
      queryBuilder = queryBuilder.ilike('medications.name', `%${q}%`);
    }

    const { data, error } = await queryBuilder;
    if (error) throw error;

    // Filtrer les nulls si medications.name ne matchait pas (cas particulier de Supabase sur les joins)
    const filtered = (data as any[]).filter(s => s.medications !== null);

    res.json(filtered.map((s: any) => ({ 
      stock_id: s.id, 
      medication_id: s.medications.id, 
      name: s.medications.name, 
      price: s.price, 
      category: s.medications.category, 
      quantity: s.quantity 
    })));
  } catch (err) { res.status(500).json({ error: 'Erreur stocks' }); }
});

export default router;
