/*
  # Allow public access for internal business application

  1. Changes
    - Drop existing authenticated-only policies
    - Add public access policies for all operations (SELECT, INSERT, UPDATE, DELETE)
    - Apply to: customers, orders, order_items, delivery_costs, expenses tables
  
  2. Purpose
    - This is an internal business management application
    - No user authentication is required for staff to manage orders
    - All operations are allowed for business operations
  
  3. Security Note
    - This configuration is suitable for internal tools behind a firewall
    - For public-facing applications, authentication should be implemented
*/

-- Drop existing policies for customers
DROP POLICY IF EXISTS "Authenticated users can view all customers" ON customers;
DROP POLICY IF EXISTS "Authenticated users can insert customers" ON customers;
DROP POLICY IF EXISTS "Authenticated users can update customers" ON customers;
DROP POLICY IF EXISTS "Authenticated users can delete customers" ON customers;

-- Create public access policies for customers
CREATE POLICY "Allow public to select customers"
  ON customers FOR SELECT
  USING (true);

CREATE POLICY "Allow public to insert customers"
  ON customers FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public to update customers"
  ON customers FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public to delete customers"
  ON customers FOR DELETE
  USING (true);

-- Drop existing policies for orders
DROP POLICY IF EXISTS "Authenticated users can view all orders" ON orders;
DROP POLICY IF EXISTS "Authenticated users can insert orders" ON orders;
DROP POLICY IF EXISTS "Authenticated users can update orders" ON orders;
DROP POLICY IF EXISTS "Authenticated users can delete orders" ON orders;

-- Create public access policies for orders
CREATE POLICY "Allow public to select orders"
  ON orders FOR SELECT
  USING (true);

CREATE POLICY "Allow public to insert orders"
  ON orders FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public to update orders"
  ON orders FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public to delete orders"
  ON orders FOR DELETE
  USING (true);

-- Drop existing policies for order_items
DROP POLICY IF EXISTS "Authenticated users can view all order_items" ON order_items;
DROP POLICY IF EXISTS "Authenticated users can insert order_items" ON order_items;
DROP POLICY IF EXISTS "Authenticated users can update order_items" ON order_items;
DROP POLICY IF EXISTS "Authenticated users can delete order_items" ON order_items;

-- Create public access policies for order_items
CREATE POLICY "Allow public to select order_items"
  ON order_items FOR SELECT
  USING (true);

CREATE POLICY "Allow public to insert order_items"
  ON order_items FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public to update order_items"
  ON order_items FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public to delete order_items"
  ON order_items FOR DELETE
  USING (true);

-- Drop existing policies for delivery_costs
DROP POLICY IF EXISTS "Authenticated users can view all delivery_costs" ON delivery_costs;
DROP POLICY IF EXISTS "Authenticated users can insert delivery_costs" ON delivery_costs;
DROP POLICY IF EXISTS "Authenticated users can update delivery_costs" ON delivery_costs;
DROP POLICY IF EXISTS "Authenticated users can delete delivery_costs" ON delivery_costs;

-- Create public access policies for delivery_costs
CREATE POLICY "Allow public to select delivery_costs"
  ON delivery_costs FOR SELECT
  USING (true);

CREATE POLICY "Allow public to insert delivery_costs"
  ON delivery_costs FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public to update delivery_costs"
  ON delivery_costs FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public to delete delivery_costs"
  ON delivery_costs FOR DELETE
  USING (true);

-- Drop existing policies for expenses
DROP POLICY IF EXISTS "Authenticated users can view all expenses" ON expenses;
DROP POLICY IF EXISTS "Authenticated users can insert expenses" ON expenses;
DROP POLICY IF EXISTS "Authenticated users can update expenses" ON expenses;
DROP POLICY IF EXISTS "Authenticated users can delete expenses" ON expenses;

-- Create public access policies for expenses
CREATE POLICY "Allow public to select expenses"
  ON expenses FOR SELECT
  USING (true);

CREATE POLICY "Allow public to insert expenses"
  ON expenses FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public to update expenses"
  ON expenses FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public to delete expenses"
  ON expenses FOR DELETE
  USING (true);
