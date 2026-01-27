import express, { type Request, type Response } from 'express';
import cors from 'cors';
import { supabase } from './db/index.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { authenticateJWT, type AuthRequest } from './middleware/auth.js';

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'your-fallback-secret';

app.use(cors());
app.use(express.json());

app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'OK', message: 'MediGo API with Supabase is running' });
});

// --- AUTHENTICATION ROUTES ---

app.post('/api/auth/register', async (req: Request, res: Response) => {
  const { email, password, full_name, role = 'patient', pharmacy_id } = req.body;

  try {
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
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Erreur lors de l\'inscription' });
  }
});

app.post('/api/auth/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
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
  // ... existing code ...
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
  // ... existing code ...
});

// Search pharmacies by name
app.get('/api/pharmacies/search', async (req: Request, res: Response) => {
  const { q, lat, lng, radius = 10000 } = req.query;

  if (!q) return res.status(400).json({ error: 'Query is required' });

  try {
    const { data, error } = await supabase
      .from('pharmacies')
      .select('*, ST_Distance(location, ST_MakePoint($1, $2)::geography) as distance') // Note: simple query for name search
      .ilike('name', `%${q}%`);

    if (error) throw error;

    // Map to match the search result format
    const formatted = data.map((p: any) => ({
      pharmacy_id: p.id,
      pharmacy_name: p.name,
      address: p.address,
      phone: p.phone,
      is_on_duty: p.is_on_duty,
      medication_id: 0,
      medication_name: 'Consulter catalogue',
      price: '---',
      quantity: 0,
      distance: 0 // Simplifié pour la démo
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
    let query = supabase
      .from('reservations')
      .select(`
        id, quantity, status, created_at,
        pharmacies (name, address),
        medications (name, price)
      `);

    // If not super_admin, only show own reservations (for patient) or pharmacy reservations (for pharmacy_admin)
    if (req.user.role === 'patient') {
      query = query.eq('patient_id', req.user.id);
    } else if (req.user.role === 'pharmacy_admin') {
      query = query.eq('pharmacy_id', req.user.pharmacy_id);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    
    // Flatten the result to match existing frontend expectations
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
    let query = supabase
      .from('appointments')
      .select('*, pharmacies(name, address)');

    if (req.user.role === 'patient') {
      query = query.eq('patient_id', req.user.id);
    } else if (req.user.role === 'pharmacy_admin') {
      query = query.eq('pharmacy_id', req.user.pharmacy_id);
    }

    const { data, error } = await query.order('appointment_date', { ascending: true });
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

  // Authorization check: only super_admin or the specific pharmacy_admin can update
  if (req.user.role !== 'super_admin' && (req.user.role !== 'pharmacy_admin' || req.user.pharmacy_id !== parseInt(id as string))) {
    return res.status(403).json({ error: 'Accès non autorisé à cette pharmacie' });
  }

  try {
    const { data, error } = await supabase
      .from('pharmacies')
      .update({ is_on_duty })
      .eq('id', id)
      .select();

    if (error) {
      console.error('Supabase error:', error.message);
      return res.status(500).json({ error: error.message });
    }
    
    res.json(data[0]);
  } catch (err) {
    console.error('Unexpected error:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Get pharmacy stocks
app.get('/api/pharmacies/:id/stocks', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const { data, error } = await supabase
      .from('stocks')
      .select(`
        id, quantity, price,
        medications (id, name, category)
      `)
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
    res.status(500).json({ error: 'Erreur lors de la récupération des stocks' });
  }
});

// Update stock quantity and price
app.patch('/api/stocks/:id', authenticateJWT, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { quantity, price } = req.body;

  try {
    // Verify ownership before update
    const { data: stockEntry } = await supabase.from('stocks').select('pharmacy_id').eq('id', id).single();
    if (!stockEntry || (req.user.role !== 'super_admin' && (req.user.role !== 'pharmacy_admin' || req.user.pharmacy_id !== stockEntry.pharmacy_id))) {
      return res.status(403).json({ error: 'Accès non autorisé à ce stock' });
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
    // Verify ownership before delete
    const { data: stockEntry } = await supabase.from('stocks').select('pharmacy_id').eq('id', id).single();
    if (!stockEntry || (req.user.role !== 'super_admin' && (req.user.role !== 'pharmacy_admin' || req.user.pharmacy_id !== stockEntry.pharmacy_id))) {
      return res.status(403).json({ error: 'Accès non autorisé à ce stock' });
    }

    const { error } = await supabase.from('stocks').delete().eq('id', id);
    if (error) throw error;
    res.json({ message: 'Médicament retiré du stock' });
  } catch (err) {
    console.error('Error deleting stock:', err);
    res.status(500).json({ error: 'Erreur lors de la suppression' });
  }
});

// Get all medications (for selection)
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
    return res.status(403).json({ error: 'Accès non autorisé à cette pharmacie' });
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

// Get chat messages for a pharmacy
app.get('/api/messages/:pharmacyId', authenticateJWT, async (req: AuthRequest, res: Response) => {
  const { pharmacyId } = req.params;

  // Patients can only see messages related to them, Admins can see all messages of their pharmacy
  // For simplicity here, we filter by pharmacy, but in a real app, we'd filter by (pharmacy AND user)
  if (req.user.role === 'pharmacy_admin' && req.user.pharmacy_id !== parseInt(pharmacyId as string)) {
    return res.status(403).json({ error: 'Accès non autorisé' });
  }

  try {
    let query = supabase
      .from('messages')
      .select('*, users(full_name)')
      .eq('pharmacy_id', pharmacyId);

    if (req.user.role === 'patient') {
      // In a more complex system, we'd have a conversation_id
      // Here we filter messages where sender is current user OR is from pharmacy to current user
      // For now, let's keep it simple and filter by pharmacy
    }

    const { data, error } = await query.order('created_at', { ascending: true });
    
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
    return res.status(403).json({ error: 'Seules les pharmacies peuvent envoyer des messages officiels' });
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

// Create a prescription entry
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
    res.status(500).json({ error: 'Erreur lors de l\'enregistrement de l\'ordonnance' });
  }
});

// Get prescriptions for a pharmacy
app.get('/api/pharmacies/:id/prescriptions', authenticateJWT, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  if (req.user.role !== 'super_admin' && (req.user.role !== 'pharmacy_admin' || req.user.pharmacy_id !== parseInt(id as string))) {
    // A patient might want to see THEIR prescriptions for this pharmacy
    if (req.user.role !== 'patient') {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }
  }

  try {
    let query = supabase
      .from('prescriptions')
      .select('*, users(full_name, email)')
      .eq('pharmacy_id', id);

    if (req.user.role === 'patient') {
      query = query.eq('patient_id', req.user.id);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Error fetching prescriptions:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Update prescription status (Ready/Cancelled)
app.patch('/api/prescriptions/:id', authenticateJWT, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    // Check if user is the admin of the pharmacy owning the prescription
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

    // Simulation d'envoi de notification
    console.log(`NOTIFICATION : Envoi d'un email à ${data.users.email} : "Votre ordonnance est ${status} à la pharmacie !"`);

    res.json({ message: 'Statut mis à jour et notification envoyée', data });
  } catch (err) {
    console.error('Error updating prescription:', err);
    res.status(500).json({ error: 'Erreur lors de la mise à jour' });
  }
});

export default app;
