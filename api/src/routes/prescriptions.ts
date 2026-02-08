import { Router, type Request, type Response } from 'express';
import { supabase } from '../db/index.js';
import { authenticateJWT, type AuthRequest } from '../middleware/auth.js';
import { notifyPrescriptionReady } from '../services/sms.js';

const router = Router();

// Créer une ordonnance (Patient)
router.post('/', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    const { pharmacy_id, image_url } = req.body;
    const { data, error } = await supabase
      .from('prescriptions')
      .insert([{ 
        pharmacy_id, 
        patient_id: req.user.id, 
        image_url, 
        status: 'pending' 
      }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Erreur envoi ordonnance' });
  }
});

// Récupérer les ordonnances (Pharmacien ou Patient)
router.get('/', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    let q = supabase.from('prescriptions').select('*, users(full_name, phone)');
    
    if (req.user.role === 'pharmacy_admin') {
      q = q.eq('pharmacy_id', req.user.pharmacy_id);
    } else if (req.user.role === 'patient') {
      q = q.eq('patient_id', req.user.id);
    }

    const { data, error } = await q.order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Erreur récupération ordonnances' });
  }
});

// Mettre à jour le statut (Pharmacien)
router.patch('/:id/status', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body; // 'ready', 'rejected', 'picked_up'
    const { id } = req.params;

    // Vérif sécu
    if (req.user.role !== 'pharmacy_admin') return res.status(403).json({ error: 'Non autorisé' });

    const { data, error } = await supabase
      .from('prescriptions')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    
    // Notification SMS si prête
    if (status === 'ready') {
      try {
        // Récupérer les infos du patient et de la pharmacie pour le SMS
        const { data: details }: any = await supabase
          .from('prescriptions')
          .select('users(phone), pharmacies(name)')
          .eq('id', id)
          .single();

        const phone = details?.users?.phone;
        const pharmacyName = details?.pharmacies?.name;

        if (phone) {
          await notifyPrescriptionReady(phone, pharmacyName || 'votre pharmacie');
        }
      } catch (smsErr) {
        console.error('Erreur notification SMS:', smsErr);
      }
    }
    
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Erreur mise à jour statut' });
  }
});

export default router;
