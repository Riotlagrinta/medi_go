import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import { supabase } from '../db/index.js';
import { authenticateJWT, type AuthRequest } from '../middleware/auth.js';

const router = Router();

const reservationSchema = z.object({
  pharmacy_id: z.number().positive(),
  medication_id: z.number().positive(),
  quantity: z.number().min(1)
});

const appointmentSchema = z.object({
  pharmacy_id: z.number().positive(),
  appointment_date: z.string(),
  reason: z.string().min(3)
});

// Réservations
router.get('/reservations', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    let q = supabase.from('reservations').select('id, quantity, status, created_at, pharmacies (name, address), medications (name, price)');
    
    if (req.user.role === 'patient') {
      q = q.eq('patient_id', req.user.id);
    } else if (req.user.role === 'pharmacy_admin') {
      q = q.eq('pharmacy_id', req.user.pharmacy_id);
    } else if (req.user.role !== 'super_admin') {
      return res.json([]);
    }

    const { data, error } = await q.order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data.map((r: any) => ({ id: r.id, quantity: r.quantity, status: r.status, created_at: r.created_at, pharmacy_name: r.pharmacies.name, medication_name: r.medications.name, price: r.medications.price })));
  } catch (err) { res.status(500).json({ error: 'Erreur réservations' }); }
});

router.post('/reservations', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    const { pharmacy_id, medication_id, quantity } = reservationSchema.parse(req.body);
    const { data, error } = await supabase.from('reservations').insert([{ pharmacy_id, medication_id, quantity, patient_id: req.user.id, status: 'pending' }]).select();
    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (err: any) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.issues[0]?.message });
    res.status(500).json({ error: 'Erreur réservation' });
  }
});

// Rendez-vous
router.get('/appointments', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    let q = supabase.from('appointments').select('*, pharmacies(name, address)');
    
    if (req.user.role === 'patient') {
      q = q.eq('patient_id', req.user.id);
    } else if (req.user.role === 'pharmacy_admin') {
      q = q.eq('pharmacy_id', req.user.pharmacy_id);
    } else if (req.user.role !== 'super_admin') {
      return res.json([]);
    }

    const { data, error } = await q.order('appointment_date', { ascending: true });
    if (error) throw error;
    res.json(data);
  } catch (err) { res.status(500).json({ error: 'Erreur récup RDV' }); }
});

router.post('/appointments', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    const { pharmacy_id, appointment_date, reason } = appointmentSchema.parse(req.body);
    const { data, error } = await supabase.from('appointments').insert([{ pharmacy_id, patient_id: req.user.id, appointment_date, reason, status: 'pending' }]).select().single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err: any) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.issues[0]?.message });
    res.status(500).json({ error: 'Erreur RDV' });
  }
});

export default router;
