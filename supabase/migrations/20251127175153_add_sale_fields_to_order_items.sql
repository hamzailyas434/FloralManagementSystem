/*
  # Add Sale Reference Fields to Order Items

  ## Overview
  Adds fields to order_items table to link items to sales SKUs for inventory tracking.

  ## Changes
    1. Add `sale_id` column - references the sale this item is from
    2. Add `sku_code` column - stores the SKU code when order is linked to a sale

  ## Notes
    - These fields are optional (nullable)
    - Only populated when order_type is 'Sale'
    - Allows tracking which sale inventory is being used
*/

-- Add sale_id column to order_items table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'order_items' AND column_name = 'sale_id'
  ) THEN
    ALTER TABLE order_items ADD COLUMN sale_id uuid REFERENCES sales(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Add sku_code column to order_items table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'order_items' AND column_name = 'sku_code'
  ) THEN
    ALTER TABLE order_items ADD COLUMN sku_code text;
  END IF;
END $$;
