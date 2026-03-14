import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://udugcpuvphdgkldtfadr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVkdWdjcHV2cGhkZ2tsZHRmYWRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1MDgxNTEsImV4cCI6MjA4OTA4NDE1MX0.YnwJ-m800lhnXmFR-oVd0p0-bvhlFamYCHBzoekaT74';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
