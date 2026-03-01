import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Keep your existing interface for the chart lines
export interface FundBenchmark {
  id: string;
  vintage_year: number;
  metric_type: 'TVPI' | 'DPI' | 'IRR';
  q1_threshold: number;
  q2_threshold: number;
  q3_threshold: number;
  created_at: string;
}

// NEW: Add this interface to match your Preqin CSV columns
export interface FundUniverse {
  id: string;
  NAME: string;
  "FUND MANAGER": string;
  "VINTAGE / INCEPTION YEAR": string;
  STRATEGY: string;
  "NET IRR (%)": string;
  "NET MULTIPLE (X)": string;
  "DPI (%)": string;
  "RVPI (%)": string;
}