-- Floral Management System Database Schema
-- Run this SQL in your new Supabase database SQL Editor

-- 1. Customers Table
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  city TEXT,
  country TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Sales Table
CREATE TABLE IF NOT EXISTS sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_number TEXT,
  sales_name TEXT NOT NULL,
  sale_date DATE NOT NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  total_items INTEGER DEFAULT 0,
  sku_items JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  order_date DATE NOT NULL,
  order_type TEXT NOT NULL CHECK (order_type IN ('Customer Order', 'Sale')),
  order_status TEXT NOT NULL CHECK (order_status IN ('Received', 'In Progress', 'Completed', 'Delivered', 'Cancelled')),
  payment_status TEXT NOT NULL CHECK (payment_status IN ('Full Payment', 'Half Payment', 'Remaining')),
  total_amount DECIMAL(10, 2) DEFAULT 0,
  amount_paid DECIMAL(10, 2) DEFAULT 0,
  amount_remaining DECIMAL(10, 2) DEFAULT 0,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_type TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  dye_color JSONB DEFAULT '[]'::jsonb,
  sale_id UUID REFERENCES sales(id) ON DELETE SET NULL,
  sku_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Delivery Costs Table
CREATE TABLE IF NOT EXISTS delivery_costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  delivery_type TEXT CHECK (delivery_type IN ('Local', 'National', 'International')),
  delivery_cost DECIMAL(10, 2) DEFAULT 0,
  customer_charge DECIMAL(10, 2) DEFAULT 0,
  added_to_order BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Expenses Table
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_date DATE NOT NULL,
  expense_type TEXT NOT NULL,
  description TEXT,
  cost DECIMAL(10, 2) NOT NULL,
  related_order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Sale Items Table (for individual SKU tracking)
CREATE TABLE IF NOT EXISTS sale_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id UUID REFERENCES sales(id) ON DELETE CASCADE,
  sku_code TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_sale_id ON order_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_delivery_costs_order_id ON delivery_costs(order_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(expense_date);
CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(sale_date);
CREATE INDEX IF NOT EXISTS idx_sales_customer_id ON sales(customer_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_sale_id ON sale_items(sale_id);

-- Enable Row Level Security (RLS) - IMPORTANT for security
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;

-- Create policies to allow authenticated users full access
-- You can customize these based on your security requirements

-- Customers policies
CREATE POLICY "Enable all for authenticated users" ON customers
  FOR ALL USING (auth.role() = 'authenticated');

-- Sales policies
CREATE POLICY "Enable all for authenticated users" ON sales
  FOR ALL USING (auth.role() = 'authenticated');

-- Orders policies
CREATE POLICY "Enable all for authenticated users" ON orders
  FOR ALL USING (auth.role() = 'authenticated');

-- Order Items policies
CREATE POLICY "Enable all for authenticated users" ON order_items
  FOR ALL USING (auth.role() = 'authenticated');

-- Delivery Costs policies
CREATE POLICY "Enable all for authenticated users" ON delivery_costs
  FOR ALL USING (auth.role() = 'authenticated');

-- Expenses policies
CREATE POLICY "Enable all for authenticated users" ON expenses
  FOR ALL USING (auth.role() = 'authenticated');

-- Sale Items policies
CREATE POLICY "Enable all for authenticated users" ON sale_items
  FOR ALL USING (auth.role() = 'authenticated');

-- Insert sample data (optional - for testing)
-- You can remove this if you don't want sample data

-- Sample Customer
INSERT INTO customers (name, phone, email, city, country, address) VALUES
('Hamza Ilyas', '+92-300-1234567', 'hamza@example.com', 'Lahore', 'Pakistan', '123 Main Street');

-- Sample Sale
INSERT INTO sales (sales_name, sale_date, total_items, sku_items) VALUES
('November Sale', '2025-11-29', 100, '[{"sku_code": "SKU-001", "quantity": 50}, {"sku_code": "SKU-002", "quantity": 50}]'::jsonb);

-- Sample Order
INSERT INTO orders (order_number, order_date, order_type, order_status, payment_status, total_amount, amount_paid, amount_remaining, customer_id)
SELECT '6000', '2025-11-29', 'Customer Order', 'Received', 'Full Payment', 25000.00, 25000.00, 0.00, id
FROM customers LIMIT 1;

-- Success message
SELECT 'Database schema created successfully!' as message;
