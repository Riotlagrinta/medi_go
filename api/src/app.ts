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
const JWT_SECRET = process.env.JWT_SECRET || 'your-fallback-secret';

// Security: Set secure HTTP headers
app.use(helmet());

// Security: CORS restriction
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://medi-go.vercel.app'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10kb' })); // Limit body size to prevent DoS

// Security: Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: 'Trop de requêtes, veuillez réessayer plus tard.' }
});

const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 15, // limit each IP to 15 login/register attempts per hour
  message: { error: 'Trop de tentatives, réessayez dans une heure.' }
});

app.use('/api/', limiter);
app.use('/api/auth/', authLimiter);

// --- SCHEMAS DE VALIDATION ---
const registerSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Le mot de passe doit faire au moins 8 caractères'),
  full_name: z.string().min(2, 'Nom trop court'),
  role: z.enum(['patient', 'pharmacy_admin', 'super_admin']).optional(),
  pharmacy_id: z.number().optional()
});

const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis')
});

// --- AUTHENTICATION ROUTES ---

app.post('/api/auth/register', async (req: Request, res: Response) => {
  try {
    const validatedData = registerSchema.parse(req.body);
    const { email, password, full_name, role = 'patient', pharmacy_id } = validatedData;

    const password_hash = await bcrypt.hash(password, 10);
    const { data, error } = await supabase
      .from('users')
      .insert([{ email, password_hash, full_name, role, pharmacy_id }])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') return res.status(400).json({ error: 'Cet email est déjà utilisé' });
      throw error;
    }

    const token = jwt.sign({ id: data.id, email: data.email, role: data.role, pharmacy_id: data.pharmacy_id }, JWT_SECRET, { expiresIn: '24h' });
    res.status(201).json({ token, user: { id: data.id, email: data.email, role: data.role, full_name: data.full_name } });
  } catch (err) {
    if (err instanceof z.ZodError) {
      const message = err.issues[0]?.message || 'Données invalides';
      return res.status(400).json({ error: message });
    }
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Erreur lors de l\'inscription' });
  }
});

app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const validatedData = loginSchema.parse(req.body);
    const { email, password } = validatedData;

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !data) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    const validPassword = await bcrypt.compare(password, data.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    const token = jwt.sign({ id: data.id, email: data.email, role: data.role, pharmacy_id: data.pharmacy_id }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: data.id, email: data.email, role: data.role, full_name: data.full_name, pharmacy_id: data.pharmacy_id } });
  } catch (err) {
    if (err instanceof z.ZodError) {
      const message = err.issues[0]?.message || 'Données invalides';
      return res.status(400).json({ error: message });
    }
    console.error('Login error:', err);
    res.status(500).json({ error: 'Erreur lors de la connexion' });
  }
});

// --- PROTECTED ROUTES ---

// Search medications and pharmacies nearby
app.get('/api/search', async (req: Request, res: Response) => {
  const { q, lat, lng, radius = 5000 } = req.query;

  if (!q) return res.status(400).json({ error: 'Search query is required' });
  if (!lat || !lng) return res.status(400).json({ error: 'Coordinates are required' });

  try {
    // We use an RPC call for spatial search in Supabase
    const { data, error } = await supabase.rpc('search_pharmacies', {
      search_query: `%${q}%`,
      user_lat: parseFloat(lat as string),
      user_lng: parseFloat(lng as string),
      radius_meters: parseInt(radius as string)
    });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Error during search:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get pharmacies on duty
app.get('/api/pharmacies/on-duty', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('pharmacies')
      .select('*')
      .eq('is_on_duty', true);

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Error fetching pharmacies on duty:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Get single pharmacy details
app.get('/api/pharmacies/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const { data, error } = await supabase
      .from('pharmacies')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Error fetching pharmacy:', err);
    res.status(500).json({ error: 'Erreur lors de la récupération de la pharmacie' });
  }
});

// Get nearby pharmacies
app.get('/api/pharmacies/nearby', async (req: Request, res: Response) => {
  const { lat, lng, radius = 10000 } = req.query;
  if (!lat || !lng) return res.status(400).json({ error: 'Coordinates required' });

  try {
    const { data, error } = await supabase.rpc('search_pharmacies', {
      search_query: '%%',
      user_lat: parseFloat(lat as string),
      user_lng: parseFloat(lng as string),
      radius_meters: parseInt(radius as string)
    });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Error fetching nearby pharmacies:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Search pharmacies by name
app.get('/api/pharmacies/search', async (req: Request, res: Response) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: 'Query is required' });

  try {
    const { data, error } = await supabase
      .from('pharmacies')
      .select('*')
      .ilike('name', `%${q}%`);

    if (error) throw error;

    const formatted = data.map((p: any) => ({
      pharmacy_id: p.id,
      pharmacy_name: p.name,
      address: p.address,
      phone: p.phone,
      is_on_duty: p.is_on_duty,
      distance: 0
    }));

    res.json(formatted);
  } catch (err) {
    console.error('Error searching pharmacies:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a reservation
app.post('/api/reservations', authenticateJWT, async (req: AuthRequest, res: Response) => {
  const { pharmacy_id, medication_id, quantity = 1 } = req.body;
  const patient_id = req.user.id;

  try {
    const { data, error } = await supabase
      .from('reservations')
      .insert([{ pharmacy_id, medication_id, quantity, patient_id, status: 'pending' }])
      .select();

    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (err) {
    console.error('Error creating reservation:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all reservations
app.get('/api/reservations', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    let queryBuilder = supabase
      .from('reservations')
      .select(`
        id, quantity, status, created_at,
        pharmacies (name, address),
        medications (name, price)
      `);

    if (req.user.role === 'patient') {
      queryBuilder = queryBuilder.eq('patient_id', req.user.id);
    } else if (req.user.role === 'pharmacy_admin') {
      queryBuilder = queryBuilder.eq('pharmacy_id', req.user.pharmacy_id);
    }

    const { data, error } = await queryBuilder.order('created_at', { ascending: false });
    if (error) throw error;
    
    const flattened = data.map((r: any) => ({
      id: r.id,
      quantity: r.quantity,
      status: r.status,
      created_at: r.created_at,
      pharmacy_name: r.pharmacies.name,
      pharmacy_address: r.pharmacies.address,
      medication_name: r.medications.name,
      price: r.medications.price
    }));

    res.json(flattened);
  } catch (err) {
    console.error('Error fetching reservations:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create an appointment
app.post('/api/appointments', authenticateJWT, async (req: AuthRequest, res: Response) => {
  const { pharmacy_id, appointment_date, reason } = req.body;
  const patient_id = req.user.id;

  try {
    const { data, error } = await supabase
      .from('appointments')
      .insert([{ pharmacy_id, patient_id, appointment_date, reason, status: 'pending' }])
      .select();

    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (err) {
    console.error('Error creating appointment:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all appointments
app.get('/api/appointments', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    let queryBuilder = supabase
      .from('appointments')
      .select('*, pharmacies(name, address)');

    if (req.user.role === 'patient') {
      queryBuilder = queryBuilder.eq('patient_id', req.user.id);
    } else if (req.user.role === 'pharmacy_admin') {
      queryBuilder = queryBuilder.eq('pharmacy_id', req.user.pharmacy_id);
    }

    const { data, error } = await queryBuilder.order('appointment_date', { ascending: true });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Error fetching appointments:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update pharmacy status
app.patch('/api/pharmacies/:id', authenticateJWT, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { is_on_duty } = req.body;

  if (req.user.role !== 'super_admin' && (req.user.role !== 'pharmacy_admin' || req.user.pharmacy_id !== parseInt(id as string))) {
    return res.status(403).json({ error: 'Accès non autorisé' });
  }

  try {
    const { data, error } = await supabase
      .from('pharmacies')
      .update({ is_on_duty })
      .eq('id', id)
      .select();

    if (error) throw error;
    res.json(data[0]);
  } catch (err) {
    console.error('Error updating pharmacy:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Get pharmacy stocks
app.get('/api/pharmacies/:id/stocks', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const { data, error } = await supabase
      .from('stocks')
      .select(`id, quantity, price, medications (id, name, category)`)
      .eq('pharmacy_id', id);

    if (error) throw error;

    const flattened = data.map((s: any) => ({
      stock_id: s.id,
      medication_id: s.medications.id,
      name: s.medications.name,
      price: s.price,
      category: s.medications.category,
      quantity: s.quantity
    }));

    res.json(flattened);
  } catch (err) {
    console.error('Error fetching stocks:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Update stock quantity and price
app.patch('/api/stocks/:id', authenticateJWT, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { quantity, price } = req.body;

  try {
    const { data: stockEntry } = await supabase.from('stocks').select('pharmacy_id').eq('id', id).single();
    if (!stockEntry || (req.user.role !== 'super_admin' && (req.user.role !== 'pharmacy_admin' || req.user.pharmacy_id !== stockEntry.pharmacy_id))) {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    const { data, error } = await supabase
      .from('stocks')
      .update({ quantity, price })
      .eq('id', id)
      .select();

    if (error) throw error;
    res.json(data[0]);
  } catch (err) {
    console.error('Error updating stock:', err);
    res.status(500).json({ error: 'Erreur lors de la mise à jour' });
  }
});

// Delete stock entry
app.delete('/api/stocks/:id', authenticateJWT, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  try {
    const { data: stockEntry } = await supabase.from('stocks').select('pharmacy_id').eq('id', id).single();
    if (!stockEntry || (req.user.role !== 'super_admin' && (req.user.role !== 'pharmacy_admin' || req.user.pharmacy_id !== stockEntry.pharmacy_id))) {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    const { error } = await supabase.from('stocks').delete().eq('id', id);
    if (error) throw error;
    res.json({ message: 'Médicament retiré du stock' });
  } catch (err) {
    console.error('Error deleting stock:', err);
    res.status(500).json({ error: 'Erreur lors de la suppression' });
  }
});

// Get all medications
app.get('/api/medications', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase.from('medications').select('*');
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Error fetching medications:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Add medication to pharmacy stock
app.post('/api/stocks', authenticateJWT, async (req: AuthRequest, res: Response) => {
  const { pharmacy_id, medication_id, quantity, price } = req.body;

  if (req.user.role !== 'super_admin' && (req.user.role !== 'pharmacy_admin' || req.user.pharmacy_id !== pharmacy_id)) {
    return res.status(403).json({ error: 'Accès non autorisé' });
  }

  try {
    const { data, error } = await supabase
      .from('stocks')
      .insert([{ pharmacy_id, medication_id, quantity, price }])
      .select();
    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (err) {
    console.error('Error adding to stock:', err);
    res.status(500).json({ error: 'Erreur lors de l\'ajout au stock' });
  }
});

// Get chat messages
app.get('/api/messages/:pharmacyId', authenticateJWT, async (req: AuthRequest, res: Response) => {
  const { pharmacyId } = req.params;
  if (req.user.role === 'pharmacy_admin' && req.user.pharmacy_id !== parseInt(pharmacyId as string)) {
    return res.status(403).json({ error: 'Accès non autorisé' });
  }

  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*, users(full_name)')
      .eq('pharmacy_id', pharmacyId)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ error: 'Erreur lors de la récupération des messages' });
  }
});

// Send a message
app.post('/api/messages', authenticateJWT, async (req: AuthRequest, res: Response) => {
  const { pharmacy_id, content, is_from_pharmacy = false } = req.body;
  const sender_id = req.user.id;

  if (is_from_pharmacy && req.user.role !== 'pharmacy_admin') {
    return res.status(403).json({ error: 'Action non autorisée' });
  }

  try {
    const { data, error } = await supabase
      .from('messages')
      .insert([{ pharmacy_id, sender_id, content, is_from_pharmacy }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    console.error('Error sending message:', err);
    res.status(500).json({ error: 'Erreur lors de l\'envoi du message' });
  }
});

// Create a prescription
app.post('/api/prescriptions', authenticateJWT, async (req: AuthRequest, res: Response) => {
  const { pharmacy_id, image_url } = req.body;
  const patient_id = req.user.id;

  try {
    const { data, error } = await supabase
      .from('prescriptions')
      .insert([{ patient_id, pharmacy_id, image_url, status: 'pending' }])
      .select();
    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (err) {
    console.error('Error saving prescription:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Get prescriptions
app.get('/api/pharmacies/:id/prescriptions', authenticateJWT, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  if (req.user.role !== 'super_admin' && (req.user.role !== 'pharmacy_admin' || req.user.pharmacy_id !== parseInt(id as string))) {
    if (req.user.role !== 'patient') return res.status(403).json({ error: 'Accès non autorisé' });
  }

  try {
    let queryBuilder = supabase
      .from('prescriptions')
      .select('*, users(full_name, email)')
      .eq('pharmacy_id', id);

    if (req.user.role === 'patient') {
      queryBuilder = queryBuilder.eq('patient_id', req.user.id);
    }

    const { data, error } = await queryBuilder.order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Error fetching prescriptions:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Update prescription status
app.patch('/api/prescriptions/:id', authenticateJWT, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const { data: prescription } = await supabase.from('prescriptions').select('pharmacy_id').eq('id', id).single();
    if (!prescription || (req.user.role !== 'super_admin' && (req.user.role !== 'pharmacy_admin' || req.user.pharmacy_id !== prescription.pharmacy_id))) {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    const { data, error } = await supabase
      .from('prescriptions')
      .update({ status })
      .eq('id', id)
      .select('*, users(full_name, email)')
      .single();

    if (error) throw error;
    console.log(`NOTIFICATION : Email envoyé à ${data.users.email}`);
    res.json({ message: 'Statut mis à jour', data });
  } catch (err) {
    console.error('Error updating prescription:', err);
    res.status(500).json({ error: 'Erreur lors de la mise à jour' });
  }
});

export default app;