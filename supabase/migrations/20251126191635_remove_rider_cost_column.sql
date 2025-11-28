/*
  # Remove rider_cost column from delivery_costs

  ## Changes
  - Removes the `rider_cost` column from the `delivery_costs` table
  - This field is no longer needed as per the updated requirements
  - Only delivery_cost and customer_charge are now tracked

  ## Notes
  - This is a schema-only change
  - Existing data in this column will be permanently removed
*/

-- Remove the rider_cost column
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'delivery_costs' AND column_name = 'rider_cost'
  ) THEN
    ALTER TABLE delivery_costs DROP COLUMN rider_cost;
  END IF;
END $$;