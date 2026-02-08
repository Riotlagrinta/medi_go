import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import { supabase } from '../db/index.js';
import { authenticateJWT, type AuthRequest } from '../middleware/auth.js';
import { notifyOrderPaid } from '../services/sms.js';

const router = Router();

// Schéma de validation pour l'initialisation du paiement
const paymentInitSchema = z.object({
  reservation_id: z.number().positive(),
  amount: z.number().positive(),
  payment_method: z.enum(['tmoney', 'flooz', 'card']),
  phone: z.string().optional() // Requis pour T-Money/Flooz
});

router.post('/initialize', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    const { reservation_id, amount, payment_method, phone } = paymentInitSchema.parse(req.body);

    // 1. Enregistrer la transaction en attente dans notre DB
    const { data: payment, error: pError } = await supabase
      .from('payments')
      .insert([{
        reservation_id,
        amount,
        payment_method,
        status: 'pending',
        external_transaction_id: `MOCK_${Date.now()}` // Sera remplacé par l'ID FedaPay
      }])
      .select()
      .single();

    if (pError) throw pError;

    // 2. Logique FedaPay (Simulation pour l'instant)
    // Quand vous aurez vos clés, on utilisera l'URL : https://api.fedapay.com/v1/transactions
    console.log(`Initialisation paiement ${payment_method} pour ${amount} XOF...`);

    // Simulation d'une URL de redirection vers le guichet de paiement
    const checkout_url = `https://checkout.fedapay.com/sandbox/${payment.external_transaction_id}`;

    res.status(201).json({
      message: 'Paiement initialisé',
      payment_id: payment.id,
      checkout_url, // Le frontend redirigera l'utilisateur ici
      status: 'pending'
    });

  } catch (err: any) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.issues[0]?.message });
    res.status(500).json({ error: 'Erreur initialisation paiement' });
  }
});

// Webhook pour recevoir les confirmations de FedaPay
router.post('/webhook', async (req: Request, res: Response) => {
  const { id, status, entity } = req.body; // Structure typique FedaPay
  
  try {
    // Mise à jour du statut dans notre DB
    const finalStatus = status === 'approved' ? 'approved' : 'declined';
    
    const { data, error } = await supabase
      .from('payments')
      .update({ status: finalStatus })
      .eq('external_transaction_id', id);

    if (error) throw error;

    // Si approuvé, on peut aussi mettre à jour la réservation
    if (finalStatus === 'approved') {
        const { data: payment } = await supabase.from('payments').select('reservation_id').eq('external_transaction_id', id).single();
        if (payment) {
            await supabase.from('reservations').update({ status: 'paid' }).eq('id', payment.reservation_id);
            
            // Notification SMS
            try {
              const { data: order }: any = await supabase
                .from('reservations')
                .select('users(phone)')
                .eq('id', payment.reservation_id)
                .single();
              
              const phone = order?.users?.phone;
              
              if (phone) {
                await notifyOrderPaid(phone, payment.reservation_id.toString());
              }
            } catch (smsErr) {
              console.error('Erreur SMS paiement:', smsErr);
            }
        }
    }

    res.json({ received: true });
  } catch (err) {
    res.status(500).json({ error: 'Webhook error' });
  }
});

export default router;
