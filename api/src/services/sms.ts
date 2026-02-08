/**
 * Service de notification SMS pour MediGo
 * Ce service gère l'envoi de messages aux patients et pharmacies.
 * Pour la production, remplacez la logique de console.log par un appel API (Twilio, Infobip, etc.)
 */

export const sendSMS = async (to: string, message: string) => {
  // Formatage du numéro (s'assurer qu'il commence par +228 pour le Togo si nécessaire)
  const formattedNumber = to.startsWith('9') || to.startsWith('7') ? `+228${to}` : to;

  console.log('--------------------------------------------------');
  console.log(`[SMS SERVICE] Envoi à : ${formattedNumber}`);
  console.log(`[MESSAGE] : ${message}`);
  console.log('--------------------------------------------------');

  // Simulation d'un délai réseau
  return new Promise((resolve) => setTimeout(resolve, 500));
};

export const notifyPrescriptionReady = async (phone: string, pharmacyName: string) => {
  const message = `MediGo : Votre ordonnance est prête chez ${pharmacyName}. Vous pouvez venir la récupérer munie de votre code de retrait.`;
  return sendSMS(phone, message);
};

export const notifyOrderPaid = async (phone: string, orderId: string) => {
  const message = `MediGo : Paiement confirmé pour votre commande #${orderId}. La pharmacie prépare vos médicaments.`;
  return sendSMS(phone, message);
};
