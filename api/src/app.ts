import express, { type Request, type Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { supabase } from './db/index.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { authenticateJWT, type AuthRequest } from './middleware/auth.js';

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'votre_secret_tres_secure_pour_medigo_2026';

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10kb' }));

// --- ROUTES AUTH ---

app.post('/api/auth/register', async (req: Request, res: Response) => {
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

app.post('/api/auth/login', async (req: Request, res: Response) => {
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

app.get('/api/auth/me', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    const { data: user, error } = await supabase.from('users').select('*').eq('id', req.user.id).single();
    if (error || !user) return res.status(404).json({ error: 'Session invalide' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// --- BUSINESS ROUTES (RÉTABLIES) ---

app.get('/api/search', async (req: Request, res: Response) => {
  const { q, lat, lng, radius = 5000 } = req.query;
  try {
    const { data, error } = await supabase.rpc('search_pharmacies', {
      search_query: `%${q || ''}%`,
      user_lat: parseFloat(lat as string),
      user_lng: parseFloat(lng as string),
      radius_meters: parseInt(radius as string)
    });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Erreur recherche' });
  }
});

app.get('/api/pharmacies/:id/stocks', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase.from('stocks').select(`id, quantity, price, medications (id, name, category)`).eq('pharmacy_id', req.params.id);
    if (error) throw error;
    res.json(data.map((s: any) => ({ stock_id: s.id, medication_id: s.medications.id, name: s.medications.name, price: s.price, category: s.medications.category, quantity: s.quantity })));
  } catch (err) { res.status(500).json({ error: 'Erreur stocks' }); }
});

app.get('/api/reservations', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    let q = supabase.from('reservations').select('id, quantity, status, created_at, pharmacies (name, address), medications (name, price)');
    if (req.user.role === 'patient') q = q.eq('patient_id', req.user.id);
    else if (req.user.role === 'pharmacy_admin') q = q.eq('pharmacy_id', req.user.pharmacy_id);
    const { data, error } = await q.order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data.map((r: any) => ({ id: r.id, quantity: r.quantity, status: r.status, created_at: r.created_at, pharmacy_name: r.pharmacies.name, medication_name: r.medications.name, price: r.medications.price })));
  } catch (err) { res.status(500).json({ error: 'Erreur reservations' }); }
});

app.post('/api/messages', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    const { pharmacy_id, content, is_from_pharmacy } = req.body;
    const { data, error } = await supabase.from('messages').insert([{ pharmacy_id, sender_id: req.user.id, content, is_from_pharmacy }]).select().single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) { res.status(500).json({ error: 'Erreur message' }); }
});

app.get('/api/messages/:pharmacyId', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    const { data, error } = await supabase.from('messages').select('*, users(full_name)').eq('pharmacy_id', req.params.pharmacyId).order('created_at', { ascending: true });
    if (error) throw error;
    res.json(data);
  } catch (err) { res.status(500).json({ error: 'Erreur messages' }); }
});

export default app;