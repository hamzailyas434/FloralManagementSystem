/*
  # Update Sales Table - Add Sales Name Field

  ## Overview
  Adds a sales_name field to the sales table for storing the name of each sale.

  ## Changes
    1. Add `sales_name` column to sales table
    2. The column is optional (nullable) to support existing records

  ## Notes
    - No total_amount column exists, so no removal needed
    - Sales name helps identify and categorize sales
*/

-- Add sales_name column to sales table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sales' AND column_name = 'sales_name'
  ) THEN
    ALTER TABLE sales ADD COLUMN sales_name text;
  END IF;
END $$;
