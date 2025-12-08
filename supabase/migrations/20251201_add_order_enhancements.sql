-- Add dress_type and notes to order_items
ALTER TABLE order_items 
ADD COLUMN IF NOT EXISTS dress_type TEXT,
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Create payment_records table for multiple payments
CREATE TABLE IF NOT EXISTS payment_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  payment_date DATE NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  payment_method TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add TCS ID to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS tcs_id TEXT;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_payment_records_order_id ON payment_records(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_records_date ON payment_records(payment_date DESC);

-- Enable RLS
ALTER TABLE payment_records ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Enable all operations for authenticated users" ON payment_records
  FOR ALL USING (true);
