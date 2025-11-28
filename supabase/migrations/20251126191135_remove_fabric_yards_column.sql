/*
  # Remove fabric_used_yards column from order_items

  ## Changes
  - Removes the `fabric_used_yards` column from the `order_items` table
  - This field is no longer needed as per the updated requirements

  ## Notes
  - This is a schema-only change
  - Existing data in this column will be permanently removed
*/

-- Remove the fabric_used_yards column
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'order_items' AND column_name = 'fabric_used_yards'
  ) THEN
    ALTER TABLE order_items DROP COLUMN fabric_used_yards;
  END IF;
END $$;