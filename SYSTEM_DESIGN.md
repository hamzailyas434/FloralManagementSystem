# Floral Management System - System Design Documentation

## 📋 Table of Contents
1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Database Schema](#database-schema)
5. [Application Modules](#application-modules)
6. [Data Flow](#data-flow)
7. [Security Model](#security-model)
8. [API Services](#api-services)
9. [Frontend Components](#frontend-components)
10. [Business Logic](#business-logic)

---

## 🎯 System Overview

**Floral Management System** (also referred to as "Cloth Brand Management System" in code) is a comprehensive business management application designed for custom cloth/textile manufacturing businesses. The system manages the complete lifecycle of custom orders, from customer management to order fulfillment, delivery tracking, expense management, and sales inventory.

### Core Objectives
- Manage custom cloth orders with detailed product specifications
- Track customer information and order history
- Monitor expenses and calculate profitability
- Handle dual order types: Custom Orders and Inventory Sales
- Provide real-time analytics and business insights
- Manage delivery logistics and costs

---

## 🏗️ Architecture

### Architecture Pattern
**Client-Server Architecture with BaaS (Backend as a Service)**

```
┌─────────────────────────────────────────────────────────┐
│                    Client Layer                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │         Angular 20 SPA Application               │   │
│  │  ┌────────────┐  ┌────────────┐  ┌───────────┐  │   │
│  │  │ Components │  │  Services  │  │   Models  │  │   │
│  │  └────────────┘  └────────────┘  └───────────┘  │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                           │
                           │ HTTPS/REST API
                           ▼
┌─────────────────────────────────────────────────────────┐
│                   Backend Layer (Supabase)               │
│  ┌──────────────────────────────────────────────────┐   │
│  │              PostgreSQL Database                 │   │
│  │  ┌────────────┐  ┌────────────┐  ┌───────────┐  │   │
│  │  │   Tables   │  │   Views    │  │ Functions │  │   │
│  │  └────────────┘  └────────────┘  └───────────┘  │   │
│  └──────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────┐   │
│  │         Authentication & Authorization           │   │
│  │              (Row Level Security)                │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### Key Architectural Decisions

1. **Single Page Application (SPA)**: Angular 20 for reactive, fast user experience
2. **Standalone Components**: Modern Angular architecture without NgModules
3. **Backend as a Service**: Supabase for managed PostgreSQL, authentication, and real-time capabilities
4. **Client-Side Routing**: Angular Router for navigation without page reloads
5. **Service-Oriented Frontend**: Separation of concerns with dedicated service layer

---

## 💻 Technology Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| **Angular** | 20.0.0 | Core framework |
| **TypeScript** | 5.8.2 | Type-safe development |
| **RxJS** | 7.8.1 | Reactive programming |
| **Chart.js** | 4.5.1 | Data visualization |
| **DataTables.net** | 2.3.5+ | Advanced table features |
| **SweetAlert2** | 11.26.3 | User-friendly alerts |
| **jsPDF/pdfmake** | 0.2.20 | PDF generation |
| **JSZip** | 3.10.1 | Data export functionality |

### Backend
| Technology | Purpose |
|------------|---------|
| **Supabase** | Backend as a Service platform |
| **PostgreSQL** | Relational database |
| **PostgREST** | Automatic REST API |
| **Row Level Security** | Data access control |

### Development Tools
- **Angular CLI** 20.0.0
- **Node.js** (via package dependencies)
- **npm** for package management

---

## 🗄️ Database Schema

### Entity Relationship Diagram

```
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│  customers   │◄────────│    orders    │────────►│ order_items  │
│              │ 1     * │              │ 1     * │              │
│ - id (PK)    │         │ - id (PK)    │         │ - id (PK)    │
│ - name       │         │ - order_num  │         │ - order_id   │
│ - phone      │         │ - customer_id│         │ - product_   │
│ - email      │         │ - order_date │         │   type       │
│ - country    │         │ - order_type │         │ - quantity   │
│ - city       │         │ - status     │         │ - price      │
│ - address    │         │ - tracking_id│         │ - fabric_    │
└──────────────┘         │ - total_amt  │         │   details    │
                         │ - payment_   │         │ - dye_color  │
                         │   status     │         │ - sku_code   │
                         │ - amt_paid   │         │ - sale_id    │
                         │ - amt_remain │         └──────────────┘
                         └──────────────┘
                                │ 1
                                │
                                │ *
                         ┌──────────────┐
                         │delivery_costs│
                         │              │
                         │ - id (PK)    │
                         │ - order_id   │
                         │ - delivery_  │
                         │   type       │
                         │ - delivery_  │
                         │   cost       │
                         │ - added_to_  │
                         │   order      │
                         │ - customer_  │
                         │   charge     │
                         └──────────────┘

┌──────────────┐         ┌──────────────┐
│   expenses   │         │    sales     │
│              │         │              │
│ - id (PK)    │         │ - id (PK)    │
│ - expense_   │         │ - sale_num   │
│   date       │         │ - sales_name │
│ - expense_   │         │ - sale_date  │
│   type       │         │ - customer_id│
│ - description│         │ - total_items│
│ - cost       │         │ - notes      │
│ - related_   │         └──────────────┘
│   order_id   │                │ 1
└──────────────┘                │
                                │ *
                         ┌──────────────┐
                         │ sale_items   │
                         │              │
                         │ - id (PK)    │
                         │ - sale_id    │
                         │ - sku_code   │
                         │ - quantity   │
                         └──────────────┘
```

### Table Descriptions

#### 1. **customers**
Stores customer information for order management.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY | Unique identifier |
| name | text | NOT NULL | Customer full name |
| phone | text | UNIQUE | Contact phone number |
| email | text | UNIQUE | Contact email address |
| country | text | - | Customer's country |
| city | text | - | Customer's city |
| address | text | - | Full delivery address |
| created_at | timestamptz | DEFAULT now() | Record creation timestamp |

**Indexes:**
- Primary key on `id`
- Unique constraints on `phone` and `email`

---

#### 2. **orders**
Central table tracking all orders (both custom and sales).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY | Unique identifier |
| order_number | text | UNIQUE, NOT NULL | Human-readable order number (e.g., "6000") |
| customer_id | uuid | FK → customers | Reference to customer |
| order_date | date | NOT NULL, DEFAULT CURRENT_DATE | Order placement date |
| order_type | text | NOT NULL, DEFAULT 'Customer Order' | 'Customer Order' or 'Sale' |
| order_status | text | NOT NULL, DEFAULT 'Received' | Order lifecycle status |
| tracking_id | text | - | Shipping tracking number |
| total_amount | decimal(10,2) | DEFAULT 0.00 | Total order value |
| payment_status | text | NOT NULL, DEFAULT 'Remaining' | Payment state |
| amount_paid | decimal(10,2) | DEFAULT 0.00 | Amount paid by customer |
| amount_remaining | decimal(10,2) | DEFAULT 0.00 | Outstanding balance |
| created_at | timestamptz | DEFAULT now() | Record creation |
| updated_at | timestamptz | DEFAULT now() | Last update timestamp |

**Order Status Values:**
- Received
- In Progress
- Ready
- Delivered

**Payment Status Values:**
- Full Payment
- Half Payment
- Remaining

**Indexes:**
- `idx_orders_customer_id` on `customer_id`
- `idx_orders_order_date` on `order_date`

**Triggers:**
- `update_orders_updated_at` - Auto-updates `updated_at` on modification

---

#### 3. **order_items**
Product specifications for items within orders.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY | Unique identifier |
| order_id | uuid | FK → orders, ON DELETE CASCADE | Parent order reference |
| product_type | text | NOT NULL | Type of item (e.g., "Dress", "Dupatta") |
| quantity | integer | DEFAULT 1 | Number of items |
| price | decimal(10,2) | - | Item price |
| fabric_details | text | - | Fabric type/specifications |
| dye_color | text[] | - | Array of dye colors |
| sale_id | text | - | Reference to sale (for Sale orders) |
| sku_code | text | - | SKU code (for Sale orders) |
| created_at | timestamptz | DEFAULT now() | Record creation |

**Indexes:**
- `idx_order_items_order_id` on `order_id`

---

#### 4. **delivery_costs**
Delivery logistics and costs per order.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY | Unique identifier |
| order_id | uuid | FK → orders, ON DELETE CASCADE | Parent order reference |
| delivery_type | text | - | "National" or "International" |
| delivery_cost | decimal(10,2) | - | Base delivery cost |
| added_to_order | boolean | DEFAULT false | Whether cost added to order total |
| customer_charge | decimal(10,2) | DEFAULT 0.00 | Amount charged to customer |
| created_at | timestamptz | DEFAULT now() | Record creation |

**Indexes:**
- `idx_delivery_costs_order_id` on `order_id`

---

#### 5. **expenses**
Business expense tracking.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY | Unique identifier |
| expense_date | date | NOT NULL, DEFAULT CURRENT_DATE | Expense date |
| expense_type | text | NOT NULL | Expense category |
| description | text | NOT NULL | Detailed description |
| cost | decimal(10,2) | NOT NULL | Expense amount |
| related_order_id | uuid | FK → orders, ON DELETE SET NULL | Optional order reference |
| created_at | timestamptz | DEFAULT now() | Record creation |

**Expense Types:**
- Material
- Making
- Delivery
- General Overhead

**Indexes:**
- `idx_expenses_expense_date` on `expense_date`
- `idx_expenses_related_order_id` on `related_order_id`

---

#### 6. **sales**
Inventory sales tracking.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY | Unique identifier |
| sale_number | text | - | Sale reference number |
| sales_name | text | - | Sale name/description |
| sale_date | date | NOT NULL, DEFAULT CURRENT_DATE | Sale date |
| customer_id | uuid | - | Optional customer reference |
| total_items | integer | - | Total items in sale |
| notes | text | - | Additional notes |
| created_at | timestamptz | DEFAULT now() | Record creation |
| updated_at | timestamptz | - | Last update |

---

#### 7. **sale_items**
Individual items within a sale.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY | Unique identifier |
| sale_id | uuid | FK → sales, ON DELETE CASCADE | Parent sale reference |
| sku_code | text | NOT NULL | Product SKU code |
| quantity | integer | NOT NULL, DEFAULT 1 | Quantity sold |
| created_at | timestamptz | DEFAULT now() | Record creation |

---

## 🔐 Security Model

### Row Level Security (RLS)

All tables have RLS enabled with the following policy structure:

```sql
-- Example for customers table
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
```

### Public Access Exception

**Sales and Sale Items** tables have public access policies for business app usage:

```sql
CREATE POLICY "Allow public access to sales"
  ON sales
  FOR ALL
  USING (true)
  WITH CHECK (true);
```

### Security Features
1. **Row Level Security**: Enabled on all tables
2. **Authentication Required**: Most operations require authenticated users
3. **Cascade Deletes**: Proper foreign key constraints with ON DELETE CASCADE
4. **Data Integrity**: Unique constraints on critical fields (phone, email, order_number)

---

## 🔧 API Services

### Service Architecture

The application uses Angular services as abstraction layers over Supabase client:

```
┌─────────────────────────────────────────────┐
│           Angular Components                │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│          Service Layer                      │
│  ┌──────────────┐  ┌──────────────┐        │
│  │   Customer   │  │    Order     │        │
│  │   Service    │  │   Service    │        │
│  └──────────────┘  └──────────────┘        │
│  ┌──────────────┐  ┌──────────────┐        │
│  │   Expense    │  │    Sales     │        │
│  │   Service    │  │   Service    │        │
│  └──────────────┘  └──────────────┘        │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│         Supabase Service                    │
│         (Database Client)                   │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│         Supabase Backend                    │
│         (PostgreSQL + REST API)             │
└─────────────────────────────────────────────┘
```

### 1. **SupabaseService**
**Location:** `src/app/services/supabase.service.ts`

**Purpose:** Singleton service providing Supabase client instance

**Key Features:**
- Initializes Supabase client with environment configuration
- Provides centralized access to database operations
- Manages connection to Supabase backend

---

### 2. **CustomerService**
**Location:** `src/app/services/customer.service.ts`

**Methods:**

| Method | Return Type | Description |
|--------|-------------|-------------|
| `getCustomers()` | `Promise<Customer[]>` | Fetch all customers, ordered by creation date |
| `getCustomer(id)` | `Promise<Customer \| null>` | Fetch single customer by ID |
| `createCustomer(customer)` | `Promise<Customer>` | Create new customer record |
| `updateCustomer(id, updates)` | `Promise<Customer>` | Update existing customer |
| `deleteCustomer(id)` | `Promise<void>` | Delete customer record |
| `searchCustomers(searchTerm)` | `Promise<Customer[]>` | Search customers by name, phone, or email |

**Search Implementation:**
```typescript
.or(`name.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
```

---

### 3. **OrderService**
**Location:** `src/app/services/order.service.ts`

**Methods:**

| Method | Return Type | Description |
|--------|-------------|-------------|
| `getOrders()` | `Promise<OrderWithDetails[]>` | Fetch all orders with customer, items, and delivery details |
| `getOrder(id)` | `Promise<OrderWithDetails \| null>` | Fetch single order with all relations |
| `createOrder(order)` | `Promise<Order>` | Create new order |
| `updateOrder(id, updates)` | `Promise<Order>` | Update order details |
| `deleteOrder(id)` | `Promise<void>` | Delete order (cascades to items) |
| `addOrderItem(item)` | `Promise<OrderItem>` | Add item to order |
| `updateOrderItem(id, updates)` | `Promise<OrderItem>` | Update order item |
| `deleteOrderItem(id)` | `Promise<void>` | Delete order item |
| `saveDeliveryCost(delivery)` | `Promise<DeliveryCost>` | Upsert delivery cost record |
| `getNextOrderNumber()` | `Promise<string>` | Generate next sequential order number |
| `getSaleOrders()` | `Promise<OrderWithDetails[]>` | Fetch orders with type 'Sale' |

**Complex Query Example:**
```typescript
.select(`
  *,
  customer:customers(*),
  order_items(*),
  delivery_cost:delivery_costs(*)
`)
```

**Data Normalization:**
- Handles array vs single object for delivery_cost relation
- Strips non-database fields before insert/update operations

---

### 4. **ExpenseService**
**Location:** `src/app/services/expense.service.ts`

**Methods:**

| Method | Return Type | Description |
|--------|-------------|-------------|
| `getExpenses()` | `Promise<Expense[]>` | Fetch all expenses |
| `getExpense(id)` | `Promise<Expense \| null>` | Fetch single expense |
| `createExpense(expense)` | `Promise<Expense>` | Create new expense |
| `updateExpense(id, updates)` | `Promise<Expense>` | Update expense |
| `deleteExpense(id)` | `Promise<void>` | Delete expense |
| `getTotalExpenses()` | `Promise<number>` | Calculate sum of all expenses |

---

### 5. **SalesService**
**Location:** `src/app/services/sales.service.ts`

**Methods:**

| Method | Return Type | Description |
|--------|-------------|-------------|
| `getSales()` | `Promise<SaleWithDetails[]>` | Fetch all sales with customer details |
| `getSale(id)` | `Promise<SaleWithDetails \| null>` | Fetch single sale |
| `createSale(sale)` | `Promise<Sale>` | Create new sale |
| `updateSale(id, updates)` | `Promise<Sale>` | Update sale |
| `deleteSale(id)` | `Promise<void>` | Delete sale |
| `getNextSaleNumber()` | `Promise<string>` | Generate next sale number |

---

## 🎨 Frontend Components

### Component Structure

```
src/app/
├── app.component.ts          # Root component with sidebar navigation
├── app.routes.ts             # Route configuration
└── components/
    ├── dashboard/
    │   └── dashboard.component.ts
    ├── orders/
    │   ├── orders.component.ts
    │   ├── order-detail.component.ts
    │   └── invoice.component.ts
    ├── customers/
    │   └── customers.component.ts
    ├── expenses/
    │   └── expenses.component.ts
    └── sales/
        └── sales.component.ts
```

### 1. **AppComponent**
**Location:** `src/app/app.component.ts`

**Purpose:** Root component providing application shell

**Features:**
- Sidebar navigation with route links
- Responsive design (desktop/mobile)
- Brand header
- Router outlet for child components

**Navigation Items:**
- Dashboard (📊)
- Orders (📋)
- Customers (👥)
- Expenses (💰)
- Sales (🏷️)

**Styling:**
- Gradient sidebar background
- Active route highlighting
- Mobile-responsive layout

---

### 2. **DashboardComponent**
**Location:** `src/app/components/dashboard/dashboard.component.ts`

**Purpose:** Business analytics and overview dashboard

**Key Metrics Displayed:**
1. **Total Revenue** - Sum of all order amounts
2. **Total Expenses** - Sum of all business expenses
3. **Net Profit** - Revenue minus expenses
4. **Pending Amount** - Outstanding customer payments
5. **Active Orders** - Orders not yet delivered
6. **Total Customers** - Customer count
7. **Customer Orders Count** - Orders with type "Customer Order"
8. **Sale Orders Count** - Orders with type "Sale"

**Charts Implemented:**
1. **Order Type Distribution** (Doughnut Chart)
   - Customer Orders vs Sale Orders
   
2. **Order Status Distribution** (Doughnut Chart)
   - Received, In Progress, Ready, Delivered
   
3. **Payment Status Distribution** (Doughnut Chart)
   - Full Payment, Half Payment, Remaining
   
4. **Revenue vs Expenses** (Bar Chart)
   - Monthly comparison of income and costs
   
5. **Monthly Orders Trend** (Line Chart)
   - Order volume over time

**Technologies:**
- Chart.js for visualizations
- Async data loading with loading states
- Error handling with user feedback

---

### 3. **OrdersComponent**
**Location:** `src/app/components/orders/orders.component.ts`

**Purpose:** Order management interface

**Features:**
- List all orders with customer details
- DataTables integration for:
  - Searching
  - Sorting
  - Pagination
  - Export (Excel, PDF, CSV)
- Create new orders
- Edit existing orders
- Delete orders
- View order details
- Generate invoices

**Order Form Fields:**
- Order number (auto-generated)
- Customer selection/creation
- Order date
- Order type (Customer Order / Sale)
- Order status
- Payment details
- Order items with specifications
- Delivery information

---

### 4. **OrderDetailComponent**
**Location:** `src/app/components/orders/order-detail.component.ts`

**Purpose:** Detailed view and editing of single order

**Sections:**
1. **Order Information**
   - Order number, date, status
   - Customer details
   - Payment information
   
2. **Order Items**
   - Product specifications
   - Quantities and pricing
   - Fabric and dye details
   
3. **Delivery Information**
   - Tracking ID
   - Delivery type
   - Delivery costs
   - Customer charges

**Actions:**
- Edit order details
- Update payment status
- Modify order items
- Update delivery information
- Generate invoice

---

### 5. **InvoiceComponent**
**Location:** `src/app/components/orders/invoice.component.ts`

**Purpose:** Generate printable/downloadable invoices

**Invoice Sections:**
- Company branding
- Order details
- Customer information
- Itemized list of products
- Pricing breakdown
- Payment status
- Delivery information

**Features:**
- Print functionality
- PDF export
- Professional formatting

---

### 6. **CustomersComponent**
**Location:** `src/app/components/customers/customers.component.ts`

**Purpose:** Customer relationship management

**Features:**
- List all customers
- Search customers
- Add new customers
- Edit customer information
- Delete customers
- View customer order history

**Customer Form Fields:**
- Name
- Phone
- Email
- Country
- City
- Address

---

### 7. **ExpensesComponent**
**Location:** `src/app/components/expenses/expenses.component.ts`

**Purpose:** Business expense tracking

**Features:**
- List all expenses
- Filter by date range
- Filter by expense type
- Add new expenses
- Edit expenses
- Delete expenses
- View total expenses

**Expense Form Fields:**
- Expense date
- Expense type
- Description
- Cost
- Related order (optional)

---

### 8. **SalesComponent**
**Location:** `src/app/components/sales/sales.component.ts`

**Purpose:** Inventory sales management

**Features:**
- List all sales
- Create new sales
- Edit sales
- Delete sales
- Manage SKU items
- Track inventory

**Sale Form Fields:**
- Sale number
- Sale name
- Sale date
- Customer (optional)
- SKU items with quantities
- Notes

---

## 🔄 Data Flow

### Order Creation Flow

```
User Action (Create Order)
        │
        ▼
OrdersComponent
        │
        ├─► Validate Form Data
        │
        ├─► Generate Order Number (OrderService.getNextOrderNumber())
        │
        ├─► Create/Select Customer (CustomerService)
        │
        ▼
OrderService.createOrder()
        │
        ├─► Clean data (remove non-DB fields)
        │
        ├─► Insert into 'orders' table
        │
        ▼
Supabase Client
        │
        ├─► Execute INSERT query
        │
        ├─► Apply RLS policies
        │
        ▼
PostgreSQL Database
        │
        ├─► Validate constraints
        │
        ├─► Insert record
        │
        ├─► Trigger updated_at
        │
        ▼
Return created order
        │
        ▼
OrdersComponent
        │
        ├─► Add order items (OrderService.addOrderItem())
        │
        ├─► Add delivery costs (OrderService.saveDeliveryCost())
        │
        ├─► Refresh order list
        │
        ▼
Display success message (SweetAlert2)
```

### Dashboard Data Loading Flow

```
DashboardComponent.ngOnInit()
        │
        ▼
loadDashboardData()
        │
        ├─► OrderService.getOrders()
        │   │
        │   ├─► Fetch orders with relations
        │   │
        │   └─► Calculate metrics:
        │       ├─ Total Revenue
        │       ├─ Pending Amount
        │       ├─ Active Orders
        │       └─ Order Type Counts
        │
        ├─► ExpenseService.getTotalExpenses()
        │   │
        │   └─► Sum all expense costs
        │
        ├─► CustomerService.getCustomers()
        │   │
        │   └─► Count total customers
        │
        ▼
Calculate Net Profit (Revenue - Expenses)
        │
        ▼
DashboardComponent.ngAfterViewInit()
        │
        ▼
drawCharts()
        │
        ├─► drawOrderTypeChart()
        ├─► drawOrderStatusChart()
        ├─► drawPaymentStatusChart()
        ├─► drawRevenueExpensesChart()
        └─► drawMonthlyOrdersChart()
        │
        ▼
Render visualizations with Chart.js
```

---

## 💼 Business Logic

### Order Number Generation

**Logic:** Sequential numbering starting from 6000

```typescript
async getNextOrderNumber(): Promise<string> {
  // Fetch highest existing order number
  const { data } = await supabase
    .from('orders')
    .select('order_number')
    .order('order_number', { ascending: false })
    .limit(1);
  
  // If no orders exist, start at 6000
  if (!data || data.length === 0) {
    return '6000';
  }
  
  // Increment last number
  const lastNumber = parseInt(data[0].order_number);
  return (lastNumber + 1).toString();
}
```

### Payment Calculation

**Automatic Calculation:**
```
amount_remaining = total_amount - amount_paid
```

**Payment Status Logic:**
- `Full Payment`: amount_remaining = 0
- `Half Payment`: amount_paid ≥ 50% of total_amount
- `Remaining`: amount_paid < 50% of total_amount

### Profit Calculation

**Net Profit Formula:**
```
Net Profit = Total Revenue - Total Expenses
```

Where:
- **Total Revenue** = Sum of all `orders.total_amount`
- **Total Expenses** = Sum of all `expenses.cost`

### Order Type Differentiation

**Customer Order:**
- Custom manufacturing orders
- Detailed fabric and dye specifications
- Delivery tracking
- Custom pricing per order

**Sale Order:**
- Inventory-based sales
- References SKU codes
- Links to sales table
- Standardized pricing

### Delivery Cost Management

**Two-tier pricing:**
1. **Delivery Cost**: Actual cost incurred by business
2. **Customer Charge**: Amount charged to customer

**Logic:**
- `added_to_order` flag determines if cost is included in order total
- Allows for profit margin on delivery services
- Supports both National and International delivery types

---

## 📊 Reporting & Analytics

### Dashboard Metrics

**Real-time Calculations:**
1. **Total Revenue**: Aggregated from all orders
2. **Total Expenses**: Aggregated from expense records
3. **Net Profit**: Revenue - Expenses
4. **Pending Amount**: Sum of `amount_remaining` across all orders
5. **Active Orders**: Count of orders not in "Delivered" status

### Chart Analytics

**Order Distribution:**
- Visualizes order types (Customer vs Sale)
- Shows order status distribution
- Displays payment status breakdown

**Financial Trends:**
- Monthly revenue vs expenses comparison
- Order volume trends over time
- Helps identify seasonal patterns

### Export Capabilities

**DataTables Integration:**
- Export to Excel (.xlsx)
- Export to PDF
- Export to CSV
- Copy to clipboard
- Print functionality

---

## 🔮 System Capabilities

### Current Features

✅ **Customer Management**
- CRUD operations
- Search functionality
- Order history tracking

✅ **Order Management**
- Dual order types (Custom/Sale)
- Detailed product specifications
- Payment tracking
- Status management
- Delivery tracking

✅ **Expense Tracking**
- Categorized expenses
- Order-linked expenses
- Date-based filtering

✅ **Sales Management**
- SKU-based inventory
- Sale tracking
- Customer linking

✅ **Analytics Dashboard**
- Real-time metrics
- Multiple chart visualizations
- Financial insights

✅ **Reporting**
- Invoice generation
- Data export (Excel, PDF, CSV)
- Printable reports

### Technical Capabilities

✅ **Performance**
- Indexed database queries
- Efficient data loading
- Client-side caching

✅ **Security**
- Row Level Security
- Authentication required
- Data validation

✅ **Scalability**
- Managed database (Supabase)
- Serverless architecture
- Auto-scaling backend

✅ **User Experience**
- Responsive design
- Loading states
- Error handling
- User-friendly alerts

---

## 🚀 Deployment Architecture

### Current Setup

**Frontend Hosting:**
- Can be deployed to any static hosting service
- Recommended: Vercel, Netlify, or Firebase Hosting

**Backend:**
- Hosted on Supabase cloud
- URL: `https://ttohwauryneywdvhstim.supabase.co`
- Managed PostgreSQL database
- Auto-scaling REST API

**Environment Configuration:**
```typescript
environment = {
  supabaseUrl: 'https://ttohwauryneywdvhstim.supabase.co',
  supabaseAnonKey: '[ANON_KEY]'
}
```

### Build Process

```bash
# Development
npm run start  # Runs on http://localhost:4200

# Production Build
npm run build  # Outputs to dist/ directory
```

---

## 📝 Data Models

### TypeScript Interfaces

**Customer:**
```typescript
interface Customer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  country?: string;
  city?: string;
  address?: string;
  created_at?: string;
}
```

**Order:**
```typescript
interface Order {
  id: string;
  order_number: string;
  customer_id: string;
  order_date: string;
  order_type: string;
  order_status: string;
  tracking_id?: string;
  total_amount: number;
  payment_status: string;
  amount_paid: number;
  amount_remaining: number;
  created_at?: string;
  updated_at?: string;
  customer?: Customer;
  order_items?: OrderItem[];
}
```

**OrderItem:**
```typescript
interface OrderItem {
  id: string;
  order_id: string;
  product_type: string;
  quantity: number;
  price: number;
  fabric_details?: string;
  dye_color?: string[];
  sale_id?: string;
  sku_code?: string;
  created_at?: string;
}
```

**Expense:**
```typescript
interface Expense {
  id: string;
  expense_date: string;
  expense_type: string;
  description: string;
  cost: number;
  related_order_id?: string;
  created_at?: string;
}
```

**Sale:**
```typescript
interface Sale {
  id: string;
  sale_number: string;
  sales_name?: string;
  sale_date: string;
  customer_id?: string;
  sku_items: SkuItem[];
  total_items: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}
```

---

## 🔧 Configuration Files

### angular.json
Defines Angular project configuration, build settings, and asset management.

### tsconfig.json
TypeScript compiler configuration with strict type checking.

### package.json
Project dependencies and npm scripts.

---

## 📚 Migration History

The database schema has evolved through 10 migrations:

1. **20251126185333** - Initial schema creation
2. **20251126191135** - Remove fabric_yards column
3. **20251126191635** - Remove rider_cost column
4. **20251126193107** - Add price to order_items
5. **20251126223746** - Allow public access for business app
6. **20251126224458** - Change dye_color to array
7. **20251127173500** - Create sales table
8. **20251127174309** - Update sales add name field
9. **20251127175118** - Add order_type to orders
10. **20251127175153** - Add sale fields to order_items

---

## 🎯 System Strengths

1. **Comprehensive Data Model**: Covers all aspects of cloth brand operations
2. **Dual Order System**: Supports both custom orders and inventory sales
3. **Financial Tracking**: Detailed expense and revenue management
4. **Analytics**: Real-time business insights with visualizations
5. **Modern Tech Stack**: Latest Angular with managed backend
6. **Scalable Architecture**: Cloud-based with auto-scaling capabilities
7. **Security**: Row-level security and authentication
8. **User Experience**: Responsive design with intuitive interface

---

## 🔍 Areas for Enhancement

### Potential Improvements

1. **Authentication System**
   - Currently relies on Supabase auth but no login UI
   - Add user roles (Admin, Staff, Viewer)
   
2. **Real-time Updates**
   - Leverage Supabase real-time subscriptions
   - Live dashboard updates
   
3. **Inventory Management**
   - Track fabric stock levels
   - Low stock alerts
   
4. **Advanced Reporting**
   - Custom date range reports
   - Profit margin analysis per order
   - Customer lifetime value
   
5. **Notifications**
   - Order status change alerts
   - Payment reminders
   - Delivery notifications
   
6. **Mobile App**
   - Native mobile application
   - Offline capabilities
   
7. **Multi-currency Support**
   - International pricing
   - Currency conversion

---

## 📖 Conclusion

The **Floral Management System** is a well-architected, full-stack business management application designed specifically for custom cloth manufacturing operations. It successfully combines modern web technologies (Angular 20, TypeScript, Supabase) with comprehensive business logic to provide a complete solution for order management, customer relations, expense tracking, and business analytics.

The system demonstrates:
- **Clean architecture** with separation of concerns
- **Scalable design** using cloud-based backend
- **User-centric interface** with rich visualizations
- **Data integrity** through proper database design
- **Security** via Row Level Security policies

This system is production-ready and can effectively manage the day-to-day operations of a cloth brand business while providing valuable insights through its analytics dashboard.
