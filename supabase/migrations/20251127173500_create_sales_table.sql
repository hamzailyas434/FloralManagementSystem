/*
  # Create Sales Table

  1. New Tables
    - `sales`
      - `id` (uuid, primary key)
      - `sale_date` (date) - Date of sale
      - `total_amount` (numeric) - Total sale amount
      - `notes` (text, optional) - Additional notes
      - `created_at` (timestamptz) - Record creation timestamp

    - `sale_items`
      - `id` (uuid, primary key)
      - `sale_id` (uuid, foreign key) - Reference to sales table
      - `sku_code` (text) - SKU code of the item
      - `quantity` (integer) - Quantity sold
      - `created_at` (timestamptz) - Record creation timestamp

  2. Security
    - Enable RLS on both tables
    - Add policies for public access (since this is a business app without authentication)
*/

CREATE TABLE IF NOT EXISTS sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_date date NOT NULL DEFAULT CURRENT_DATE,
  total_amount numeric(10, 2) DEFAULT 0,
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sale_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id uuid NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  sku_code text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public access to sales"
  ON sales
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public access to sale_items"
  ON sale_items
  FOR ALL
  USING (true)
  WITH CHECK (true);
