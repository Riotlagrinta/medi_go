"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importStar(require("express"));
const cors_1 = __importDefault(require("cors"));
const db_1 = require("./db");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'MediGo API with Supabase is running' });
});
// Search medications and pharmacies nearby
app.get('/api/search', async (req, res) => {
    const { q, lat, lng, radius = 5000 } = req.query;
    if (!q)
        return res.status(400).json({ error: 'Search query is required' });
    if (!lat || !lng)
        return res.status(400).json({ error: 'Coordinates are required' });
    try {
        // We use an RPC call for spatial search in Supabase
        const { data, error } = await db_1.supabase.rpc('search_pharmacies', {
            search_query: `%${q}%`,
            user_lat: parseFloat(lat),
            user_lng: parseFloat(lng),
            radius_meters: parseInt(radius)
        });
        if (error)
            throw error;
        res.json(data);
    }
    catch (err) {
        console.error('Error during search:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Get pharmacies on duty
app.get('/api/pharmacies/on-duty', async (req, res) => {
    // ... existing code ...
});
// Get single pharmacy details
app.get('/api/pharmacies/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const { data, error } = await db_1.supabase
            .from('pharmacies')
            .select('*')
            .eq('id', id)
            .single();
        if (error)
            throw error;
        res.json(data);
    }
    catch (err) {
        console.error('Error fetching pharmacy:', err);
        res.status(500).json({ error: 'Erreur lors de la récupération de la pharmacie' });
    }
});
// Get nearby pharmacies
app.get('/api/pharmacies/nearby', async (req, res) => {
    // ... existing code ...
});
// Search pharmacies by name
app.get('/api/pharmacies/search', async (req, res) => {
    const { q, lat, lng, radius = 10000 } = req.query;
    if (!q)
        return res.status(400).json({ error: 'Query is required' });
    try {
        const { data, error } = await db_1.supabase
            .from('pharmacies')
            .select('*, ST_Distance(location, ST_MakePoint($1, $2)::geography) as distance') // Note: simple query for name search
            .ilike('name', `%${q}%`);
        if (error)
            throw error;
        // Map to match the search result format
        const formatted = data.map((p) => ({
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
    }
    catch (err) {
        console.error('Error searching pharmacies:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Create a reservation
app.post('/api/reservations', async (req, res) => {
    const { pharmacy_id, medication_id, quantity = 1 } = req.body;
    try {
        const { data, error } = await db_1.supabase
            .from('reservations')
            .insert([{ pharmacy_id, medication_id, quantity, status: 'pending' }])
            .select();
        if (error)
            throw error;
        res.status(201).json(data[0]);
    }
    catch (err) {
        console.error('Error creating reservation:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Get all reservations
app.get('/api/reservations', async (req, res) => {
    try {
        const { data, error } = await db_1.supabase
            .from('reservations')
            .select(`
        id, quantity, status, created_at,
        pharmacies (name, address),
        medications (name, price)
      `)
            .order('created_at', { ascending: false });
        if (error)
            throw error;
        // Flatten the result to match existing frontend expectations
        const flattened = data.map((r) => ({
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
    }
    catch (err) {
        console.error('Error fetching reservations:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Create an appointment
app.post('/api/appointments', async (req, res) => {
    const { pharmacy_id, appointment_date, reason } = req.body;
    try {
        const { data, error } = await db_1.supabase
            .from('appointments')
            .insert([{ pharmacy_id, appointment_date, reason, status: 'pending' }])
            .select();
        if (error)
            throw error;
        res.status(201).json(data[0]);
    }
    catch (err) {
        console.error('Error creating appointment:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Get all appointments
app.get('/api/appointments', async (req, res) => {
    // ... existing code ...
});
// Login for pharmacy admin
app.post('/api/auth/login', async (req, res) => {
    // ... existing code ...
});
// Update pharmacy status
app.patch('/api/pharmacies/:id', async (req, res) => {
    const { id } = req.params;
    const { is_on_duty } = req.body;
    try {
        const { data, error } = await db_1.supabase
            .from('pharmacies')
            .update({ is_on_duty })
            .eq('id', id)
            .select();
        if (error) {
            console.error('Supabase error:', error.message);
            return res.status(500).json({ error: error.message });
        }
        res.json(data[0]);
    }
    catch (err) {
        console.error('Unexpected error:', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});
// Get pharmacy stocks
app.get('/api/pharmacies/:id/stocks', async (req, res) => {
    const { id } = req.params;
    try {
        const { data, error } = await db_1.supabase
            .from('stocks')
            .select(`
        id, quantity, price,
        medications (id, name, category)
      `)
            .eq('pharmacy_id', id);
        if (error)
            throw error;
        const flattened = data.map((s) => ({
            stock_id: s.id,
            medication_id: s.medications.id,
            name: s.medications.name,
            price: s.price,
            category: s.medications.category,
            quantity: s.quantity
        }));
        res.json(flattened);
    }
    catch (err) {
        console.error('Error fetching stocks:', err);
        res.status(500).json({ error: 'Erreur lors de la récupération des stocks' });
    }
});
// Update stock quantity and price
app.patch('/api/stocks/:id', async (req, res) => {
    const { id } = req.params;
    const { quantity, price } = req.body;
    try {
        const { data, error } = await db_1.supabase
            .from('stocks')
            .update({ quantity, price })
            .eq('id', id)
            .select();
        if (error)
            throw error;
        res.json(data[0]);
    }
    catch (err) {
        console.error('Error updating stock:', err);
        res.status(500).json({ error: 'Erreur lors de la mise à jour' });
    }
});
// Delete stock entry
app.delete('/api/stocks/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const { error } = await db_1.supabase.from('stocks').delete().eq('id', id);
        if (error)
            throw error;
        res.json({ message: 'Médicament retiré du stock' });
    }
    catch (err) {
        console.error('Error deleting stock:', err);
        res.status(500).json({ error: 'Erreur lors de la suppression' });
    }
});
// Get all medications (for selection)
app.get('/api/medications', async (req, res) => {
    try {
        const { data, error } = await db_1.supabase.from('medications').select('*');
        if (error)
            throw error;
        res.json(data);
    }
    catch (err) {
        console.error('Error fetching medications:', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});
// Add medication to pharmacy stock
app.post('/api/stocks', async (req, res) => {
    const { pharmacy_id, medication_id, quantity, price } = req.body;
    try {
        const { data, error } = await db_1.supabase
            .from('stocks')
            .insert([{ pharmacy_id, medication_id, quantity, price }])
            .select();
        if (error)
            throw error;
        res.status(201).json(data[0]);
    }
    catch (err) {
        console.error('Error adding to stock:', err);
        res.status(500).json({ error: 'Erreur lors de l\'ajout au stock' });
    }
});
// Get chat messages for a pharmacy
app.get('/api/messages/:pharmacyId', async (req, res) => {
    const { pharmacyId } = req.params;
    try {
        const { data, error } = await db_1.supabase
            .from('messages')
            .select('*')
            .eq('pharmacy_id', pharmacyId)
            .order('created_at', { ascending: true });
        if (error)
            throw error;
        res.json(data);
    }
    catch (err) {
        console.error('Error fetching messages:', err);
        res.status(500).json({ error: 'Erreur lors de la récupération des messages' });
    }
});
// Send a message
app.post('/api/messages', async (req, res) => {
    // ... existing code ...
});
// Create a prescription entry
app.post('/api/prescriptions', async (req, res) => {
    const { patient_name, pharmacy_id, image_url } = req.body;
    try {
        const { data, error } = await db_1.supabase
            .from('prescriptions')
            .insert([{ patient_name, pharmacy_id, image_url }])
            .select();
        if (error)
            throw error;
        res.status(201).json(data[0]);
    }
    catch (err) {
        console.error('Error saving prescription:', err);
        res.status(500).json({ error: 'Erreur lors de l\'enregistrement de l\'ordonnance' });
    }
});
// Get prescriptions for a pharmacy
app.get('/api/pharmacies/:id/prescriptions', async (req, res) => {
    // ... existing code ...
});
// Update prescription status (Ready/Cancelled)
app.patch('/api/prescriptions/:id', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        const { data, error } = await db_1.supabase
            .from('prescriptions')
            .update({ status })
            .eq('id', id)
            .select()
            .single();
        if (error)
            throw error;
        // Simulation d'envoi de notification
        console.log(`NOTIFICATION : Envoi d'un SMS au ${data.patient_phone || 'client'} : "Votre commande est prête à la pharmacie !"`);
        res.json({ message: 'Statut mis à jour et notification envoyée', data });
    }
    catch (err) {
        console.error('Error updating prescription:', err);
        res.status(500).json({ error: 'Erreur lors de la mise à jour' });
    }
});
exports.default = app;
//# sourceMappingURL=app.js.map