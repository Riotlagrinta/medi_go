import { createClient } from '@supabase/supabase-js';

// 1. Récupération des clés (depuis .env ou localStorage en secours)
let supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
let supabaseKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim();

// Système de secours si le fichier .env n'est pas lu
if (typeof window !== 'undefined' && (!supabaseUrl || supabaseUrl.includes('A_REMPLACER'))) {
  supabaseUrl = localStorage.getItem('SB_URL') || '';
  supabaseKey = localStorage.getItem('SB_KEY') || '';
}

const isValid = supabaseUrl.startsWith('http');

if (!isValid && typeof window !== 'undefined') {
  console.warn("⚠️ Mode Secours : Utilisez la console pour configurer vos clés.");
}

export const supabase = createClient(
  isValid ? supabaseUrl : 'https://placeholder-project.supabase.co',
  supabaseKey || 'placeholder-key'
);
