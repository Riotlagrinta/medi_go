import { supabase } from './db/index.js';

async function cleanupUsers() {
  console.log('Suppression de tous les utilisateurs en cours...');
  
  const { error } = await supabase
    .from('users')
    .delete()
    .not('email', 'is', null); // Supprime tous les comptes ayant un email

  if (error) {
    console.error('Erreur lors de la suppression :', error.message);
  } else {
    console.log('Tous les comptes utilisateurs ont été supprimés avec succès.');
  }
}

cleanupUsers();
