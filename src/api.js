import axios from "axios";
import { createClient } from "@supabase/supabase-js";

// ✅ Supabase client
export const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

// ✅ Axios instance for backend API
const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Automatically attach Supabase access token to requests
API.interceptors.request.use(
  async (config) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
      }
    } catch (error) {
      console.error("❌ Failed to attach token:", error.message);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export { API };
