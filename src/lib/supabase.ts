import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://bjlxagdolffucgvoomge.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqbHhhZ2RvbGZmdWNndm9vbWdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0MTM0MjQsImV4cCI6MjA4Njk4OTQyNH0.hycWFNe_VDwtl7L6ij0KJsDikPQKPU1CUhLYGvTOIG8";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
