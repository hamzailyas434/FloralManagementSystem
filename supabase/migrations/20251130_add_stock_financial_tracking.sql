-- Add purchase_price to sales table for stock valuation
ALTER TABLE sales
ADD COLUMN IF NOT EXISTS purchase_price_per_item DECIMAL(10, 2) DEFAULT 0;

-- Add total_stock_value (calculated field)
ALTER TABLE sales
ADD COLUMN IF NOT EXISTS total_stock_value DECIMAL(10, 2) DEFAULT 0;

-- Create bank_balance table for financial tracking
CREATE TABLE IF NOT EXISTS bank_balance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  balance DECIMAL(10, 2) NOT NULL DEFAULT 0,
  last_updated TIMESTAMP DEFAULT NOW(),
  notes TEXT
);

-- Insert initial bank balance record
INSERT INTO bank_balance (balance, notes) 
VALUES (0, 'Initial balance')
ON CONFLICT DO NOTHING;

-- Create bank_transactions table for tracking changes
CREATE TABLE IF NOT EXISTS bank_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  transaction_type VARCHAR(20) NOT NULL, -- 'deposit', 'withdrawal', 'order_payment', 'expense'
  amount DECIMAL(10, 2) NOT NULL,
  description TEXT,
  reference_id UUID, -- Link to order or expense
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add comments
COMMENT ON COLUMN sales.purchase_price_per_item IS 'Purchase price per item for stock valuation';
COMMENT ON COLUMN sales.total_stock_value IS 'Total value of stock (quantity × purchase price)';
COMMENT ON TABLE bank_balance IS 'Current bank balance';
COMMENT ON TABLE bank_transactions IS 'Bank transaction history';
