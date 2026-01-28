import { supabase } from './db/index.js';

async function promoteUser(email: string, newRole: 'super_admin' | 'pharmacy_admin' | 'patient') {
  console.log(`Promotion de ${email} au rang de ${newRole}...`);

  const { data, error } = await supabase
    .from('users')
    .update({ role: newRole })
    .eq('email', email)
    .select();

  if (error) {
    console.error('Erreur :', error.message);
  } else if (data.length === 0) {
    console.error('Utilisateur non trouvé avec cet email.');
  } else {
    console.log(`Succès ! ${email} est maintenant ${newRole}.`);
  }
}

// Récupération des arguments depuis la commande
const email = process.argv[2];
const role = process.argv[3] as any;

if (!email || !role) {
  console.log('Usage: npx tsx src/promote_user.ts <email> <role>');
  console.log('Roles valides: super_admin, pharmacy_admin, patient');
} else {
  promoteUser(email, role);
}
