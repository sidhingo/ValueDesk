/*
  # Create PE Fund Benchmark Data Table

  1. New Tables
    - `fund_benchmarks`
      - `id` (uuid, primary key)
      - `vintage_year` (integer) - The fund vintage year
      - `metric_type` (text) - Either 'TVPI', 'DPI', or 'IRR'
      - `q1_threshold` (numeric) - Top quartile (25th percentile) threshold
      - `q2_threshold` (numeric) - Second quartile (median/50th percentile) threshold
      - `q3_threshold` (numeric) - Third quartile (75th percentile) threshold
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `fund_benchmarks` table
    - Add policy for public read access (benchmark data is reference data)
*/

CREATE TABLE IF NOT EXISTS fund_benchmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vintage_year integer NOT NULL,
  metric_type text NOT NULL CHECK (metric_type IN ('TVPI', 'DPI', 'IRR')),
  q1_threshold numeric NOT NULL,
  q2_threshold numeric NOT NULL,
  q3_threshold numeric NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE fund_benchmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read benchmark data"
  ON fund_benchmarks FOR SELECT
  TO anon, authenticated
  USING (true);

-- Create unique index to prevent duplicate entries
CREATE UNIQUE INDEX IF NOT EXISTS idx_benchmarks_year_metric 
  ON fund_benchmarks(vintage_year, metric_type);

-- Insert sample benchmark data for recent vintage years
-- TVPI benchmarks
INSERT INTO fund_benchmarks (vintage_year, metric_type, q1_threshold, q2_threshold, q3_threshold)
VALUES
  (2015, 'TVPI', 2.5, 1.8, 1.3),
  (2016, 'TVPI', 2.4, 1.7, 1.2),
  (2017, 'TVPI', 2.3, 1.7, 1.2),
  (2018, 'TVPI', 2.2, 1.6, 1.1),
  (2019, 'TVPI', 2.0, 1.5, 1.1),
  (2020, 'TVPI', 1.8, 1.4, 1.0),
  (2021, 'TVPI', 1.6, 1.3, 1.0),
  (2022, 'TVPI', 1.4, 1.2, 0.9),
  (2023, 'TVPI', 1.3, 1.1, 0.9)
ON CONFLICT (vintage_year, metric_type) DO NOTHING;

-- DPI benchmarks
INSERT INTO fund_benchmarks (vintage_year, metric_type, q1_threshold, q2_threshold, q3_threshold)
VALUES
  (2015, 'DPI', 2.0, 1.5, 1.0),
  (2016, 'DPI', 1.9, 1.4, 0.9),
  (2017, 'DPI', 1.8, 1.3, 0.8),
  (2018, 'DPI', 1.6, 1.1, 0.7),
  (2019, 'DPI', 1.3, 0.9, 0.5),
  (2020, 'DPI', 1.0, 0.6, 0.3),
  (2021, 'DPI', 0.7, 0.4, 0.2),
  (2022, 'DPI', 0.4, 0.2, 0.1),
  (2023, 'DPI', 0.2, 0.1, 0.0)
ON CONFLICT (vintage_year, metric_type) DO NOTHING;

-- IRR benchmarks (in percentage)
INSERT INTO fund_benchmarks (vintage_year, metric_type, q1_threshold, q2_threshold, q3_threshold)
VALUES
  (2015, 'IRR', 25.0, 15.0, 8.0),
  (2016, 'IRR', 24.0, 14.5, 7.5),
  (2017, 'IRR', 23.0, 14.0, 7.0),
  (2018, 'IRR', 22.0, 13.5, 6.5),
  (2019, 'IRR', 20.0, 12.5, 6.0),
  (2020, 'IRR', 18.0, 11.0, 5.0),
  (2021, 'IRR', 15.0, 9.5, 4.0),
  (2022, 'IRR', 12.0, 8.0, 3.0),
  (2023, 'IRR', 10.0, 6.5, 2.5)
ON CONFLICT (vintage_year, metric_type) DO NOTHING;