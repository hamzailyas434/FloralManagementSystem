/*
  # Change dye_color to support multiple colors per item

  1. Changes
    - Change `dye_color` column in `order_items` table from text to text array
    - This allows storing multiple dye colors (one per quantity unit)
  
  2. Purpose
    - Support individual dye colors for each item quantity
    - Example: Dress quantity 2 can have ["Red", "Blue"] for dress 1 and dress 2
*/

DO $$
BEGIN
  -- Check if column exists and is not already an array
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'order_items' AND column_name = 'dye_color'
    AND data_type = 'text'
  ) THEN
    -- Convert existing data to array format
    ALTER TABLE order_items 
    ALTER COLUMN dye_color TYPE text[] 
    USING CASE 
      WHEN dye_color IS NULL THEN NULL 
      ELSE ARRAY[dye_color]
    END;
  END IF;
END $$;
