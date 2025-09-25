import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://azchtnrtltxnnyaawivl.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6Y2h0bnJ0bHR4bm55YWF3aXZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3MjM2MjIsImV4cCI6MjA3NDI5OTYyMn0.zYu7Biv4BSUn_ulqnYdmR8dl8OT6kZFDBvpkfvO_I20";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
