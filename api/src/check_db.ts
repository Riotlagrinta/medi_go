import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkConnection() {
  console.log('Testing Supabase connection...');
  try {
    const { data, error } = await supabase.from('pharmacies').select('id, name').limit(1);
    
    if (error) {
      console.error('❌ Connection Error:', error.message);
      if (error.message.includes('relation "pharmacies" does not exist')) {
        console.log('⚠️ The "pharmacies" table is missing. You need to run init.sql in the Supabase SQL Editor.');
      }
    } else {
      console.log('✅ Connection Successful!');
      console.log('Data found:', data);
    }
  } catch (err) {
    console.error('💥 Unexpected Error:', err);
  }
}

checkConnection();
