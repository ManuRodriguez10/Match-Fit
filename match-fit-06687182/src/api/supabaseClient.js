import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase environment variables are not set.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
});

/**
 * Ensures a valid session before making RPC calls
 * This prevents "No API key found" errors when the session expires
 */
export const ensureValidSession = async () => {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      // Try to refresh the session
      const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession();
      
      if (refreshError || !refreshedSession) {
        throw new Error('No valid session available');
      }
      
      return refreshedSession;
    }
    
    // Check if session is close to expiring (within 5 minutes)
    const now = Math.floor(Date.now() / 1000);
    const expiresAt = session.expires_at;
    
    if (expiresAt && expiresAt - now < 300) {
      // Session expires soon, refresh it
      const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession();
      
      if (refreshError) {
        console.warn("Error refreshing session:", refreshError);
        // Continue with existing session if refresh fails
        return session;
      }
      
      return refreshedSession || session;
    }
    
    return session;
  } catch (error) {
    console.error("Error ensuring valid session:", error);
    throw error;
  }
};

/**
 * Wrapper for RPC calls that ensures session is valid before executing
 */
export const safeRpc = async (functionName, params = {}) => {
  try {
    // Ensure we have a valid session before making the RPC call
    await ensureValidSession();
    
    // Now make the RPC call
    const { data, error } = await supabase.rpc(functionName, params);
    
    if (error) {
      throw error;
    }
    
    return { data, error: null };
  } catch (error) {
    console.error(`RPC call ${functionName} failed:`, error);
    return { data: null, error };
  }
};

