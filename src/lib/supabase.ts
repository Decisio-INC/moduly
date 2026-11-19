import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Identifiants Supabase officiels du projet MODULY
const PROJECT_SUPABASE_URL = "https://emhqremyuckdojwtseok.supabase.co";
const PROJECT_SUPABASE_ANON_KEY = "sb_publishable_bgxDklgyuCG5IKtcHEvzuw_aUjEDzJm";
const PROJECT_SUPABASE_SERVICE_KEY = "sb_secret_MMioglL8wm5UONvZ65LYqw_6mHhEGax";

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

  const envServiceKey = cleanEnvString(process.env.SUPABASE_SERVICE_ROLE_KEY);
  const envAnonKey = cleanEnvString(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  // Privilégie service_role côté serveur si disponible, sinon anon_key, sinon clé de projet par défaut
  let finalKey = PROJECT_SUPABASE_SERVICE_KEY;
  if (envServiceKey && envServiceKey.length > 10) {
    finalKey = envServiceKey;
  } else if (envAnonKey && envAnonKey.length > 10) {
    finalKey = envAnonKey;
  }

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
