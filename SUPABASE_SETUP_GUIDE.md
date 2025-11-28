# 🚀 Setting Up a New Supabase Project

## Complete Guide to Migrate Your Database to a New Supabase Project

---

## 📋 Table of Contents

1. [Create New Supabase Project]
(#create-new-supabase-project)
2. [Option 1: Using Supabase CLI (Recommended)](#option-1-using-supabase-cli-recommended)
3. [Option 2: Using SQL Editor (Manual)](#option-2-using-sql-editor-manual)
4. [Update Your Application](#update-your-application)
5. [Verify Setup](#verify-setup)

---

## 🆕 Create New Supabase Project

### Step 1: Sign Up / Log In
1. Go to https://supabase.com/
2. Click "Start your project"
3. Sign in with GitHub, Google, or Email

### Step 2: Create Project
1. Click "New Project"
2. Fill in details:
   - **Name**: `Floral Management System` (or your choice)
   - **Database Password**: Choose a strong password (SAVE THIS!)
   - **Region**: Choose closest to you
   - **Pricing Plan**: Free tier is fine to start
3. Click "Create new project"
4. Wait 2-3 minutes for setup

### Step 3: Get Your Credentials
1. Go to **Project Settings** → **API**
2. Copy these values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public** key (long string starting with `eyJ...`)

---

## ✅ Option 1: Using Supabase CLI (Recommended)

This is the **easiest and fastest** method!

### Step 1: Install Supabase CLI

```bash
# Install globally
npm install -g supabase
```

### Step 2: Login to Supabase

```bash
supabase login
```

This will open your browser to authenticate.

### Step 3: Link Your Project

```bash
cd "/Users/hilyas/Downloads/Floral Management System"
supabase link --project-ref YOUR_PROJECT_REF
```

**To get YOUR_PROJECT_REF:**
- Go to your Supabase project
- Look at the URL: `https://supabase.com/dashboard/project/YOUR_PROJECT_REF`
- Or go to Settings → General → Reference ID

### Step 4: Push All Migrations

```bash
supabase db push
```

This will automatically run all migration files in order:
1. ✅ Create tables (customers, orders, order_items, etc.)
2. ✅ Set up foreign keys
3. ✅ Create indexes
4. ✅ Enable Row Level Security
5. ✅ Create policies
6. ✅ Add all columns and modifications

**That's it!** All tables are now created in your new Supabase project!

---

## 📝 Option 2: Using SQL Editor (Manual)

If you prefer not to use CLI, you can run the SQL manually.

### Step 1: Open SQL Editor

1. Go to your Supabase project
2. Click **SQL Editor** in the left sidebar
3. Click **New query**

### Step 2: Run Migrations in Order

Run each migration file in this **exact order**:

#### Migration 1: Create Base Schema
**File:** `20251126185333_create_cloth_brand_schema.sql`

```sql
-- Copy and paste the entire contents of this file
-- This creates: customers, orders, order_items, delivery_costs, expenses tables
```

<details>
<summary>Click to see full SQL</summary>

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create customers table
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    city TEXT,
    country TEXT,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create orders table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_number TEXT NOT NULL UNIQUE,
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    order_date DATE NOT NULL,
    order_status TEXT NOT NULL DEFAULT 'Received',
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    amount_paid DECIMAL(10,2) NOT NULL DEFAULT 0,
    amount_remaining DECIMAL(10,2) NOT NULL DEFAULT 0,
    payment_status TEXT NOT NULL DEFAULT 'Remaining',
    tracking_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    product_type TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    fabric_details TEXT,
    dye_color JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create delivery_costs table
CREATE TABLE IF NOT EXISTS public.delivery_costs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    delivery_type TEXT,
    delivery_cost DECIMAL(10,2) DEFAULT 0,
    customer_charge DECIMAL(10,2) DEFAULT 0,
    added_to_order BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create expenses table
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    expense_date DATE NOT NULL,
    expense_type TEXT NOT NULL,
    description TEXT,
    cost DECIMAL(10,2) NOT NULL,
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_date ON public.orders(order_date);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_delivery_costs_order_id ON public.delivery_costs(order_id);
CREATE INDEX IF NOT EXISTS idx_expenses_order_id ON public.expenses(order_id);

-- Enable Row Level Security
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all for authenticated users)
CREATE POLICY "Enable all for authenticated users" ON public.customers FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all for authenticated users" ON public.orders FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all for authenticated users" ON public.order_items FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all for authenticated users" ON public.delivery_costs FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all for authenticated users" ON public.expenses FOR ALL USING (auth.role() = 'authenticated');

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for orders table
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
```

</details>

Click **Run** to execute.

---

#### Migration 2: Add Price to Order Items
**File:** `20251126193107_add_price_to_order_items.sql`

```sql
-- Add price column to order_items
ALTER TABLE public.order_items 
ADD COLUMN IF NOT EXISTS price DECIMAL(10,2) DEFAULT 0;
```

Click **Run**.

---

#### Migration 3: Allow Public Access
**File:** `20251126223746_allow_public_access_for_business_app.sql`

```sql
-- Drop existing policies
DROP POLICY IF EXISTS "Enable all for authenticated users" ON public.customers;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON public.orders;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON public.order_items;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON public.delivery_costs;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON public.expenses;

-- Create public access policies
CREATE POLICY "Enable all for public" ON public.customers FOR ALL USING (true);
CREATE POLICY "Enable all for public" ON public.orders FOR ALL USING (true);
CREATE POLICY "Enable all for public" ON public.order_items FOR ALL USING (true);
CREATE POLICY "Enable all for public" ON public.delivery_costs FOR ALL USING (true);
CREATE POLICY "Enable all for public" ON public.expenses FOR ALL USING (true);
```

Click **Run**.

---

#### Migration 4: Create Sales Tables
**File:** `20251127173500_create_sales_table.sql`

```sql
-- Create sales table
CREATE TABLE IF NOT EXISTS public.sales (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    sale_number TEXT NOT NULL UNIQUE,
    sale_date DATE NOT NULL,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    sku_items JSONB DEFAULT '[]'::jsonb,
    total_items INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create sale_items table
CREATE TABLE IF NOT EXISTS public.sale_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    sale_id UUID REFERENCES public.sales(id) ON DELETE CASCADE,
    sku_code TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_sales_customer_id ON public.sales(customer_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_sale_id ON public.sale_items(sale_id);

-- Enable RLS
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable all for public" ON public.sales FOR ALL USING (true);
CREATE POLICY "Enable all for public" ON public.sale_items FOR ALL USING (true);
```

Click **Run**.

---

#### Migration 5: Add Sales Name Field
**File:** `20251127174309_update_sales_add_name_field.sql`

```sql
-- Add sales_name column
ALTER TABLE public.sales 
ADD COLUMN IF NOT EXISTS sales_name TEXT;
```

Click **Run**.

---

#### Migration 6: Add Order Type
**File:** `20251127175118_add_order_type_to_orders.sql`

```sql
-- Add order_type column
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS order_type TEXT DEFAULT 'Customer Order';
```

Click **Run**.

---

#### Migration 7: Add Sale Fields to Order Items
**File:** `20251127175153_add_sale_fields_to_order_items.sql`

```sql
-- Add sale-related fields to order_items
ALTER TABLE public.order_items 
ADD COLUMN IF NOT EXISTS sku_code TEXT,
ADD COLUMN IF NOT EXISTS sale_id UUID REFERENCES public.sales(id) ON DELETE SET NULL;

-- Create index
CREATE INDEX IF NOT EXISTS idx_order_items_sale_id ON public.order_items(sale_id);
```

Click **Run**.

---

### Step 3: Verify Tables Created

1. Go to **Table Editor** in Supabase
2. You should see all tables:
   - ✅ customers
   - ✅ orders
   - ✅ order_items
   - ✅ delivery_costs
   - ✅ expenses
   - ✅ sales
   - ✅ sale_items

---

## 🔧 Update Your Application

### Step 1: Update Environment File

Open `/src/environments.ts` and update with your new credentials:

```typescript
export const environment = {
  supabaseUrl: 'https://YOUR_NEW_PROJECT_REF.supabase.co',
  supabaseAnonKey: 'YOUR_NEW_ANON_KEY'
};
```

### Step 2: Restart Your Application

```bash
# Stop the current server (Ctrl+C)
# Then restart
npm start
```

---

## ✅ Verify Setup

### Test Database Connection

1. Open http://localhost:57077/
2. Try creating a new order
3. Check if it appears in Supabase:
   - Go to **Table Editor**
   - Click **orders** table
   - You should see your new order!

### Verify All Tables

Go to **Table Editor** and check each table has the correct columns:

**customers:**
- id, name, phone, email, city, country, address, created_at

**orders:**
- id, order_number, customer_id, order_date, order_status, order_type, total_amount, amount_paid, amount_remaining, payment_status, tracking_id, created_at, updated_at

**order_items:**
- id, order_id, product_type, quantity, price, fabric_details, dye_color, sku_code, sale_id, created_at

**delivery_costs:**
- id, order_id, delivery_type, delivery_cost, customer_charge, added_to_order, created_at

**expenses:**
- id, expense_date, expense_type, description, cost, order_id, created_at

**sales:**
- id, sale_number, sales_name, sale_date, customer_id, sku_items, total_items, notes, created_at

**sale_items:**
- id, sale_id, sku_code, quantity, created_at

---

## 📊 Quick Setup Script

If you want to run all migrations at once via SQL Editor:

1. Open **SQL Editor**
2. Create **New query**
3. Copy all migration files in order and paste
4. Click **Run**

Or use this single command with Supabase CLI:

```bash
cd "/Users/hilyas/Downloads/Floral Management System"
supabase db push
```

---

## 🔄 Migrating Existing Data

If you want to copy data from your old Supabase to the new one:

### Option 1: Export/Import via Dashboard

1. **Export from old project:**
   - Go to old Supabase project
   - Table Editor → Select table → Export as CSV
   - Repeat for all tables

2. **Import to new project:**
   - Go to new Supabase project
   - Table Editor → Select table → Import CSV
   - Upload the exported files

### Option 2: Using SQL Dump

```bash
# Export from old database
supabase db dump --project-ref OLD_PROJECT_REF > backup.sql

# Import to new database
supabase db push --project-ref NEW_PROJECT_REF < backup.sql
```

---

## 🎯 Summary

### Recommended Method:
1. ✅ Create new Supabase project
2. ✅ Install Supabase CLI: `npm install -g supabase`
3. ✅ Login: `supabase login`
4. ✅ Link project: `supabase link --project-ref YOUR_REF`
5. ✅ Push migrations: `supabase db push`
6. ✅ Update `/src/environments.ts` with new credentials
7. ✅ Restart app: `npm start`
8. ✅ Test and verify!

### Manual Method:
1. ✅ Create new Supabase project
2. ✅ Open SQL Editor
3. ✅ Run each migration file in order
4. ✅ Update `/src/environments.ts`
5. ✅ Restart app
6. ✅ Test and verify!

---

## 📁 Migration Files Location

All migration files are in:
```
/Users/hilyas/Downloads/Floral Management System/supabase/migrations/
```

Files to run in order:
1. `20251126185333_create_cloth_brand_schema.sql`
2. `20251126193107_add_price_to_order_items.sql`
3. `20251126223746_allow_public_access_for_business_app.sql`
4. `20251127173500_create_sales_table.sql`
5. `20251127174309_update_sales_add_name_field.sql`
6. `20251127175118_add_order_type_to_orders.sql`
7. `20251127175153_add_sale_fields_to_order_items.sql`

---

## 🆘 Troubleshooting

### "Migration failed"
- Make sure you run migrations in the correct order
- Check if tables already exist (drop them first if needed)

### "Cannot connect to database"
- Verify your `supabaseUrl` and `supabaseAnonKey` in environments.ts
- Check if Supabase project is active

### "Permission denied"
- Make sure RLS policies are created
- Check if public access is enabled

---

**You now have everything you need to set up a new Supabase project!** 🎉

Choose either the CLI method (faster) or manual SQL method (more control).

---

**Last Updated:** 2024-11-28  
**Migration Files:** 7 files  
**Tables Created:** 7 tables  
**Status:** ✅ Ready to Deploy
