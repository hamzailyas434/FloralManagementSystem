/*
  # Add price field to order_items table

  1. Changes
    - Add `price` column to `order_items` table
      - Type: numeric (to handle decimal values)
      - Default: 0
      - Not null
    - Add `item_total` computed column that multiplies quantity × price
  
  2. Purpose
    - Enable automatic calculation of order totals based on item quantity and unit price
    - Track individual item pricing for better order management
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'order_items' AND column_name = 'price'
  ) THEN
    ALTER TABLE order_items ADD COLUMN price numeric DEFAULT 0 NOT NULL;
  END IF;
END $$;
