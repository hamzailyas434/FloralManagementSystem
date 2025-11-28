/*
  # Cloth Brand Management System Database Schema

  ## Overview
  This migration creates a comprehensive database for managing custom cloth brand operations,
  including customers, orders, product specifications, and expense tracking.

  ## Tables Created

  ### 1. customers
  Stores customer information including contact details and address
  - `id` (uuid, primary key)
  - `name` (text) - Customer's full name
  - `phone` (text, unique) - Contact phone number
  - `email` (text, unique) - Contact email address
  - `country` (text) - Customer's country
  - `city` (text) - Customer's city
  - `address` (text) - Full delivery address
  - `created_at` (timestamptz) - Record creation timestamp

  ### 2. orders
  Central transaction records tracking order status and payments
  - `id` (uuid, primary key)
  - `order_number` (text, unique) - Human-readable order number (e.g., "6000")
  - `customer_id` (uuid, foreign key) - References customers table
  - `order_date` (date) - Date the order was placed
  - `order_status` (text) - Current status (Received, In Progress, Ready, Delivered)
  - `tracking_id` (text) - Shipping tracking number
  - `total_amount` (decimal) - Total final amount charged to customer
  - `payment_status` (text) - Payment status (Full Payment, Half Payment, Remaining)
  - `amount_paid` (decimal) - Amount already paid by customer
  - `amount_remaining` (decimal) - Remaining balance
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Record update timestamp

  ### 3. order_items
  Product specifications for custom items (Dress/Dupatta) within orders
  - `id` (uuid, primary key)
  - `order_id` (uuid, foreign key) - References orders table
  - `product_type` (text) - Type of item (Dress or Dupatta)
  - `quantity` (integer) - Number of this specific item
  - `fabric_used_yards` (decimal) - Yardage used for this item
  - `fabric_details` (text) - Specific fabric type
  - `dye_color` (text) - Specific dye color
  - `created_at` (timestamptz) - Record creation timestamp

  ### 4. expenses
  Tracks all business costs separately from orders
  - `id` (uuid, primary key)
  - `expense_date` (date) - Date the expense was incurred
  - `expense_type` (text) - Type (Material, Making, Delivery, General Overhead)
  - `description` (text) - Detailed description
  - `cost` (decimal) - The actual cost incurred
  - `related_order_id` (uuid, nullable) - Optional reference to order
  - `created_at` (timestamptz) - Record creation timestamp

  ### 5. delivery_costs
  Delivery costs linked to orders
  - `id` (uuid, primary key)
  - `order_id` (uuid, foreign key) - References orders table
  - `rider_cost` (decimal) - Rider cost
  - `delivery_type` (text) - Type (National, International)
  - `delivery_cost` (decimal) - Base delivery cost
  - `added_to_order` (boolean) - Flag if cost was added to customer's order
  - `customer_charge` (decimal) - Amount charged to customer for delivery
  - `created_at` (timestamptz) - Record creation timestamp

  ## Security
  - Row Level Security (RLS) enabled on all tables
  - Policies restrict access to authenticated users only
*/

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text UNIQUE,
  email text UNIQUE,
  country text,
  city text,
  address text,
  created_at timestamptz DEFAULT now()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text UNIQUE NOT NULL,
  customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  order_date date NOT NULL DEFAULT CURRENT_DATE,
  order_status text NOT NULL DEFAULT 'Received',
  tracking_id text,
  total_amount decimal(10, 2) DEFAULT 0.00,
  payment_status text NOT NULL DEFAULT 'Remaining',
  amount_paid decimal(10, 2) DEFAULT 0.00,
  amount_remaining decimal(10, 2) DEFAULT 0.00,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_type text NOT NULL,
  quantity integer DEFAULT 1,
  fabric_used_yards decimal(5, 2),
  fabric_details text,
  dye_color text,
  created_at timestamptz DEFAULT now()
);

-- Create expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_date date NOT NULL DEFAULT CURRENT_DATE,
  expense_type text NOT NULL,
  description text NOT NULL,
  cost decimal(10, 2) NOT NULL,
  related_order_id uuid REFERENCES orders(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Create delivery_costs table
CREATE TABLE IF NOT EXISTS delivery_costs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  rider_cost decimal(10, 2),
  delivery_type text,
  delivery_cost decimal(10, 2),
  added_to_order boolean DEFAULT false,
  customer_charge decimal(10, 2) DEFAULT 0.00,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_date ON orders(order_date);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_expenses_expense_date ON expenses(expense_date);
CREATE INDEX IF NOT EXISTS idx_expenses_related_order_id ON expenses(related_order_id);
CREATE INDEX IF NOT EXISTS idx_delivery_costs_order_id ON delivery_costs(order_id);

-- Enable Row Level Security
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_costs ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies for customers
CREATE POLICY "Authenticated users can view all customers"
  ON customers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert customers"
  ON customers FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update customers"
  ON customers FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete customers"
  ON customers FOR DELETE
  TO authenticated
  USING (true);

-- Create RLS Policies for orders
CREATE POLICY "Authenticated users can view all orders"
  ON orders FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete orders"
  ON orders FOR DELETE
  TO authenticated
  USING (true);

-- Create RLS Policies for order_items
CREATE POLICY "Authenticated users can view all order_items"
  ON order_items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert order_items"
  ON order_items FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update order_items"
  ON order_items FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete order_items"
  ON order_items FOR DELETE
  TO authenticated
  USING (true);

-- Create RLS Policies for expenses
CREATE POLICY "Authenticated users can view all expenses"
  ON expenses FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert expenses"
  ON expenses FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update expenses"
  ON expenses FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete expenses"
  ON expenses FOR DELETE
  TO authenticated
  USING (true);

-- Create RLS Policies for delivery_costs
CREATE POLICY "Authenticated users can view all delivery_costs"
  ON delivery_costs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert delivery_costs"
  ON delivery_costs FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update delivery_costs"
  ON delivery_costs FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete delivery_costs"
  ON delivery_costs FOR DELETE
  TO authenticated
  USING (true);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();