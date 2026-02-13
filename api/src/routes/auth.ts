import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { supabase } from '../db/index.js';
import { authenticateJWT, type AuthRequest } from '../middleware/auth.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'votre_secret_tres_secure_pour_medigo_2026';

router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, full_name } = req.body;
    const password_hash = await bcrypt.hash(password, 10);
    const { data, error } = await supabase.from('users').insert([{ email, password_hash, full_name, role: 'patient' }]).select().single();
    if (error) throw error;
    const token = jwt.sign({ id: data.id, email: data.email, role: data.role }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: data });
  } catch (err: any) {
    res.status(400).json({ error: 'Erreur inscription ou email déjà utilisé' });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const { data: user, error } = await supabase.from('users').select('*').eq('email', email).single();
    if (error || !user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role, pharmacy_id: user.pharmacy_id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.get('/me', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, full_name, role, pharmacy_id, phone, address, medical_info, photo_url, created_at')
      .eq('id', req.user.id)
      .single();
    if (error || !user) return res.status(404).json({ error: 'Session invalide' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.post('/sync-profile', authenticateJWT, async (req: AuthRequest, res: Response) => {
  const { full_name, phone, address, medical_info } = req.body;
  const email = req.user.email; // Use email from JWT to ensure it's the owner

  try {
    // Regular users can only update their own basic info.
    // They CANNOT update their role or pharmacy_id via this endpoint.
    const { data, error } = await supabase
      .from('users')
      .update({ full_name, phone, address, medical_info })
      .eq('id', req.user.id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Erreur synchronisation' });
  }
});

export default router;
