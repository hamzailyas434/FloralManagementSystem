/*
  # Add Order Type to Orders Table

  ## Overview
  Adds an order_type field to the orders table to distinguish between Customer Orders and Sale Orders.

  ## Changes
    1. Add `order_type` column to orders table
      - Type: text
      - Values: 'Customer Order' or 'Sale'
      - Default: 'Customer Order'

  ## Notes
    - This allows orders to be linked to sales inventory
    - When order_type is 'Sale', order items will reference SKUs from sales table
*/

-- Add order_type column to orders table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'order_type'
  ) THEN
    ALTER TABLE orders ADD COLUMN order_type text DEFAULT 'Customer Order' NOT NULL;
  END IF;
END $$;
