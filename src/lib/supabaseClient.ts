import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Asegúrate de tener estas variables en tu archivo .env.local (o en las variables de entorno de tu hosting)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error("Supabase URL is not defined. Please check your environment variables.");
}
if (!supabaseAnonKey) {
  throw new Error("Supabase Anon Key is not defined. Please check your environment variables.");
}

// Crear una única instancia del cliente de Supabase para toda la aplicación
let supabaseInstance: SupabaseClient | null = null;

const getSupabaseClient = () => {
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey