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

// Security: Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 300, 
  message: { error: 'Trop de requêtes, veuillez réessayer plus tard.' }
});

const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: { error: 'Trop de tentatives, réessayez dans une heure.' }
});

app.use('/api/', limiter);
app.use('/api/auth/', authLimiter);

// --- SCHEMAS DE VALIDATION ZOD ---
const stockSchema = z.object({
  pharmacy_id: z.number().positive(),
  medication_id: z.number().positive(),
  quantity: z.number().min(0),
  price: z.number().positive()
});

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

// --- ROUTES AUTHENTIFICATION ---

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

app.post('/api/auth/sync-profile', async (req: Request, res: Response) => {
  const { email, full_name, phone, address, medical_info, role, pharmacy_id } = req.body;
  try {
    const { data, error } = await supabase.from('users').upsert({ email, full_name, phone, address, medical_info, role, pharmacy_id }, { onConflict: 'email' }).select().single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Erreur synchronisation' });
  }
});

// --- ROUTES PHARMACIES & STOCKS ---

app.get('/api/pharmacies/on-duty', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase.from('pharmacies').select('*').eq('is_on_duty', true);
    if (error) throw error;
    res.json(data);
  } catch (err) { res.status(500).json({ error: 'Erreur pharmacies de garde' }); }
});

app.get('/api/pharmacies/nearby', async (req: Request, res: Response) => {
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

app.get('/api/pharmacies/:id/stocks', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase.from('stocks').select(`id, quantity, price, medications (id, name, category)`).eq('pharmacy_id', req.params.id);
    if (error) throw error;
    res.json(data.map((s: any) => ({ stock_id: s.id, medication_id: s.medications.id, name: s.medications.name, price: s.price, category: s.medications.category, quantity: s.quantity })));
  } catch (err) { res.status(500).json({ error: 'Erreur stocks' }); }
});

app.post('/api/stocks', authenticateJWT, async (req: AuthRequest, res: Response) => {
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

// --- ROUTES RÉSERVATIONS & RDV ---

app.get('/api/reservations', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    let q = supabase.from('reservations').select('id, quantity, status, created_at, pharmacies (name, address), medications (name, price)');
    if (req.user.role === 'patient') q = q.eq('patient_id', req.user.id);
    else if (req.user.role === 'pharmacy_admin') q = q.eq('pharmacy_id', req.user.pharmacy_id);
    const { data, error } = await q.order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data.map((r: any) => ({ id: r.id, quantity: r.quantity, status: r.status, created_at: r.created_at, pharmacy_name: r.pharmacies.name, medication_name: r.medications.name, price: r.medications.price })));
  } catch (err) { res.status(500).json({ error: 'Erreur réservations' }); }
});

app.post('/api/reservations', authenticateJWT, async (req: AuthRequest, res: Response) => {
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

app.post('/api/appointments', authenticateJWT, async (req: AuthRequest, res: Response) => {
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

app.get('/api/appointments', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    let q = supabase.from('appointments').select('*, pharmacies(name, address)');
    if (req.user.role === 'patient') q = q.eq('patient_id', req.user.id);
    else if (req.user.role === 'pharmacy_admin') q = q.eq('pharmacy_id', req.user.pharmacy_id);
    const { data, error } = await q.order('appointment_date', { ascending: true });
    if (error) throw error;
    res.json(data);
  } catch (err) { res.status(500).json({ error: 'Erreur récup RDV' }); }
});

// --- MESSAGERIE & RECHERCHE GLOBALE ---

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
  } catch (err) { res.status(500).json({ error: 'Erreur recherche' }); }
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