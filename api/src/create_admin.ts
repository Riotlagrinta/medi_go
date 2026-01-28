import { supabase } from './db/index.js';
import bcrypt from 'bcryptjs';

async function createSuperAdmin() {
  const email = 'admin@medigo.tg';
  const password = 'Admin123!';
  const full_name = 'Super Administrateur';
  const role = 'super_admin';

  console.log(`Création du compte Super Admin : ${email}...`);

  const password_hash = await bcrypt.hash(password, 10);

  const { data, error } = await supabase
    .from('users')
    .insert([
      { 
        email, 
        password_hash, 
        full_name, 
        role 
      }
    ])
    .select();

  if (error) {
    console.error('Erreur lors de la création :', error.message);
  } else {
    console.log('-----------------------------------');
    console.log('COMPTE SUPER ADMIN CRÉÉ AVEC SUCCÈS');
    console.log(`Email : ${email}`);
    console.log(`Mot de passe : ${password}`);
    console.log('Rôle : super_admin');
    console.log('-----------------------------------');
    console.log('Veuillez noter ces informations et changer le mot de passe après votre première connexion.');
  }
}

createSuperAdmin();
