-- Add estimated_date and notes columns to orders table

ALTER TABLE orders
ADD COLUMN IF NOT EXISTS estimated_date DATE,
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Add comments
COMMENT ON COLUMN orders.estimated_date IS 'Estimated delivery/completion date for the order';
COMMENT ON COLUMN orders.notes IS 'Internal notes about the order (not shown on invoice)';
