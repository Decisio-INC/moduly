import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Identifiants Supabase officiels du projet MODULY
const PROJECT_SUPABASE_URL = "https://emhqremyuckdojwtseok.supabase.co";
const PROJECT_SUPABASE_ANON_KEY = "sb_publishable_bgxDklgyuCG5IKtcHEvzuw_aUjEDzJm";
const PROJECT_SUPABASE_SERVICE_KEY = "sb_secret_MMioglL8wm5UONvZ65LYqw_6mHhEGax";

/**
 * Nettoie une chaîne de variable d'environnement (guillemets, espaces, slashes)
 */
function cleanEnvString(val?: string): string {
  if (!val) return "";
  return val.trim().replace(/^["']|["']$/g, "").trim();
}

/**
 * Nettoie l'URL Supabase pour s'assurer qu'elle ne contient ni /rest/v1/ ni slash final
 */
export function sanitizeSupabaseUrl(url?: string): string {
  const cleaned = cleanEnvString(url);
  if (!cleaned) return "";
  return cleaned.replace(/\/rest\/v1\/?$/, "").replace(/\/+$/, "");
}

// Récupération dynamique et sécurisée avec fallback sur le projet Supabase configuré
export function getSupabaseCredentials() {
  const envUrl = cleanEnvString(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const finalUrl = sanitizeSupabaseUrl(envUrl || PROJECT_SUPABASE_URL);

  const envServiceKey = cleanEnvString(process.env.SUPABASE_SERVICE_ROLE_KEY);
  const envAnonKey = cleanEnvString(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  // Privilégie service_role côté serveur si disponible, sinon anon_key, sinon clé de projet
  const finalKey = envServiceKey || envAnonKey || PROJECT_SUPABASE_SERVICE_KEY || PROJECT_SUPABASE_ANON_KEY;

  return { url: finalUrl, key: finalKey };
}

const initialCreds = getSupabaseCredentials();
export const supabaseUrl = initialCreds.url;
export const supabaseKey = initialCreds.key;
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey && supabaseUrl.startsWith("http"));

export function getSupabase(): SupabaseClient {
  const { url, key } = getSupabaseCredentials();

  if (!url || !key || !url.startsWith("http")) {
    throw new Error(
      "Configuration Supabase introuvable. Veuillez renseigner NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY dans votre fichier .env.local et dans les paramètres Vercel."
    );
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

// Instance globale prête à l'emploi
export const supabase = getSupabase();

