import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Identifiants Supabase vérifiés et actifs du projet MODULY
const PROJECT_SUPABASE_URL = "https://emhqremyuckdojwtseok.supabase.co";
const PROJECT_SUPABASE_ANON_KEY = "sb_publishable_bgxDklgyuCG5IKtcHEvzuw_aUjEDzJm";

/**
 * Nettoie une chaîne de variable d'environnement (guillemets, espaces, 'undefined', 'null')
 */
function cleanEnvString(val?: string): string {
  if (!val || typeof val !== "string") return "";
  const trimmed = val.trim().replace(/^["']|["']$/g, "").trim();
  if (trimmed === "undefined" || trimmed === "null" || trimmed === "") return "";
  return trimmed;
}

/**
 * Nettoie l'URL Supabase pour s'assurer qu'elle ne contient ni /rest/v1/ ni slash final
 */
export function sanitizeSupabaseUrl(url?: string): string {
  const cleaned = cleanEnvString(url);
  if (!cleaned || !cleaned.startsWith("http")) return PROJECT_SUPABASE_URL;
  return cleaned.replace(/\/rest\/v1\/?$/, "").replace(/\/+$/, "");
}

// Récupération dynamique et infaillible des identifiants Supabase
export function getSupabaseCredentials() {
  const envUrl = cleanEnvString(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const finalUrl = (envUrl && envUrl.startsWith("http")) ? sanitizeSupabaseUrl(envUrl) : PROJECT_SUPABASE_URL;

  const envAnonKey = cleanEnvString(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  // Utilise la clé anonyme vérifiée (qui possède tous les droits RLS SELECT, INSERT, UPDATE, DELETE)
  const finalKey = (envAnonKey && envAnonKey.length > 20) ? envAnonKey : PROJECT_SUPABASE_ANON_KEY;

  return { url: finalUrl, key: finalKey };
}

const initialCreds = getSupabaseCredentials();
export const supabaseUrl = initialCreds.url;
export const supabaseKey = initialCreds.key;
export const isSupabaseConfigured = true;

let cachedClient: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (cachedClient) return cachedClient;

  const { url, key } = getSupabaseCredentials();
  cachedClient = createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return cachedClient;
}

// Instance globale prête à l'emploi
export const supabase = getSupabase();
