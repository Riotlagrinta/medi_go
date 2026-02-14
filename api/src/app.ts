import express, { type Request, type Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { supabase } from './db/index.js';

// Import des routes
import authRoutes from './routes/auth.js';
import medicationRoutes from './routes/medications.js';
import pharmacyRoutes from './routes/pharmacies.js';
import reservationRoutes from './routes/reservations.js';
import paymentRoutes from './routes/payments.js';
import prescriptionRoutes from './routes/prescriptions.js';
import adminRoutes from './routes/admin.js';
import deliveryRoutes from './routes/delivery.js';
import reportRoutes from './routes/reports.js';
import appConfigRoutes from './routes/app_config.js';
import { authenticateJWT, authorizeRoles } from './middleware/auth.js';

export const app = express();

app.use(helmet());
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Request logger for debugging mobile connections
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

app.use(express.json({ limit: '10kb' }));

// Security: Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 300, 
  message: { error: 'Trop de requêtes, veuillez réessayer plus tard.' }
});

app.use('/api/', limiter);

// --- ROUTES ---
app.use('/api/auth', authRoutes);
app.use('/api/medications', medicationRoutes);
app.use('/api/pharmacies', pharmacyRoutes);
app.use('/api/reservations', authenticateJWT, reservationRoutes);
app.use('/api/payments', authenticateJWT, paymentRoutes);
app.use('/api/prescriptions', authenticateJWT, prescriptionRoutes);
app.use('/api/admin', authenticateJWT, authorizeRoles('super_admin'), adminRoutes);
app.use('/api/delivery', authenticateJWT, deliveryRoutes);
app.use('/api/reports', authenticateJWT, authorizeRoles('super_admin', 'pharmacy_admin'), reportRoutes);
app.use('/api', appConfigRoutes); // Pour /api/version

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'OK' });
});

// Recherche globale (publique)
app.get('/api/search', async (req: Request, res: Response) => {
  const { q, lat, lng, radius = 5000 } = req.query;

  if (!q) {
    return res.status(400).json({ error: 'Search query is required' });
  }

  if (!lat || !lng) {
    return res.status(400).json({ error: 'Latitude (lat) and Longitude (lng) are required' });
  }

  try {
    const { data, error } = await supabase.rpc('search_pharmacies', {
      search_query: `%${q}%`,
      user_lat: parseFloat(lat as string),
      user_lng: parseFloat(lng as string),
      radius_meters: parseInt(radius as string)
    });
    if (error) throw error;
    res.json(data);
  } catch (err) { res.status(500).json({ error: 'Erreur recherche' }); }
});

// Messagerie (Sécurisée)
app.post('/api/messages', authenticateJWT, async (req: Request, res: Response) => {
  try {
    const { pharmacy_id, content, is_from_pharmacy } = req.body;
    const sender_id = (req as any).user.id;
    const { data, error } = await supabase.from('messages').insert([{ pharmacy_id, sender_id, content, is_from_pharmacy }]).select().single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) { res.status(500).json({ error: 'Erreur message' }); }
});

export default app;
