import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

// Get Supabase configuration from environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Validate that required environment variables are present
if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error(
    "Missing Supabase configuration. Please check your environment variables."
  );
}

// Create Supabase client with service role key for backend operations (full database access)
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false, // No need for token refresh on backend
    persistSession: false, // No session persistence needed on backend
  },
});

export default supabase;
