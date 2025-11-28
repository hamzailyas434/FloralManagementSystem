# 🔄 Floral Management System - Migration Guide

## Complete Technology Stack Conversion Guide for MEAN/MERN or Other Frameworks

---

## 📋 Table of Contents

1. [Current System Overview](#current-system-overview)
2. [Technology Stack Mapping](#technology-stack-mapping)
3. [AI Conversion Prompt](#ai-conversion-prompt)
4. [MEAN Stack Migration](#mean-stack-migration)
5. [MERN Stack Migration](#mern-stack-migration)
6. [Alternative Stacks](#alternative-stacks)
7. [Database Migration](#database-migration)
8. [API Endpoints Reference](#api-endpoints-reference)
9. [Migration Checklist](#migration-checklist)

---

## 🎯 Current System Overview

### Application Type
**Floral Management System** - A comprehensive business management application for custom cloth/textile manufacturing businesses.

### Core Functionality
- ✅ Customer Management (CRUD operations)
- ✅ Order Management (Custom Orders + Inventory Sales)
- ✅ Expense Tracking
- ✅ Sales Management (SKU-based inventory)
- ✅ Analytics Dashboard (Charts & Metrics)
- ✅ Invoice Generation (PDF export)
- ✅ Delivery Cost Tracking
- ✅ Payment Status Management

### Current Architecture
```
┌─────────────────────────────────────┐
│   Frontend: Angular 20 (SPA)       │
│   - Standalone Components           │
│   - TypeScript 5.8.2                │
│   - Chart.js, DataTables            │
│   - SweetAlert2, jsPDF              │
└─────────────────┬───────────────────┘
                  │ REST API
                  ▼
┌─────────────────────────────────────┐
│   Backend: Supabase (BaaS)         │
│   - PostgreSQL Database             │
│   - Auto-generated REST API         │
│   - Row Level Security              │
└─────────────────────────────────────┘
```

---

## 🔀 Technology Stack Mapping

### Current Stack → Target Stacks

| Component | Current | MEAN Stack | MERN Stack | Alternative |
|-----------|---------|------------|------------|-------------|
| **Frontend Framework** | Angular 20 | Angular 17+ | React 18+ | Vue 3 / Next.js |
| **Backend Framework** | Supabase | Express.js | Express.js | NestJS / Fastify |
| **Runtime** | N/A | Node.js 20+ | Node.js 20+ | Bun / Deno |
| **Database** | PostgreSQL (Supabase) | MongoDB | MongoDB | PostgreSQL / MySQL |
| **ORM/ODM** | Supabase Client | Mongoose | Mongoose | Prisma / TypeORM |
| **Authentication** | Supabase Auth | Passport.js / JWT | JWT / NextAuth | Auth0 / Clerk |
| **Language** | TypeScript | TypeScript | TypeScript/JavaScript | TypeScript |
| **State Management** | RxJS | RxJS / NgRx | Redux / Zustand | Pinia / Recoil |
| **Charts** | Chart.js | Chart.js | Chart.js / Recharts | ApexCharts |
| **Tables** | DataTables.net | DataTables.net | TanStack Table | AG Grid |
| **PDF Generation** | jsPDF | PDFKit / jsPDF | jsPDF / React-PDF | Puppeteer |
| **Alerts** | SweetAlert2 | SweetAlert2 | SweetAlert2 / React-Toastify | Sonner |

---

## 🤖 AI Conversion Prompt

### Copy this prompt to convert your system with AI tools (ChatGPT, Claude, etc.)

```markdown
I need to convert a Floral Management System from Angular 20 + Supabase to [MEAN/MERN] stack.

**CURRENT SYSTEM:**
- Frontend: Angular 20 (Standalone Components)
- Backend: Supabase (PostgreSQL + Auto REST API)
- Features: Customer Management, Order Management, Expense Tracking, Sales, Analytics Dashboard

**TARGET STACK:**
- Frontend: [Angular/React]
- Backend: Node.js + Express.js
- Database: [MongoDB/PostgreSQL]
- Authentication: JWT

**DATABASE SCHEMA:**

1. **customers** table:
   - id (uuid), name (text), phone (text), email (text)
   - country (text), city (text), address (text)
   - created_at (timestamp)

2. **orders** table:
   - id (uuid), order_number (text, unique), customer_id (uuid FK)
   - order_date (date), order_type (text: "Customer Order" | "Sale")
   - order_status (text: "Received" | "In Progress" | "Ready" | "Delivered")
   - tracking_id (text), total_amount (decimal), payment_status (text)
   - amount_paid (decimal), amount_remaining (decimal)
   - created_at, updated_at (timestamps)

3. **order_items** table:
   - id (uuid), order_id (uuid FK), product_type (text)
   - quantity (integer), price (decimal), fabric_details (text)
   - dye_color (text array), sku_code (text), sale_id (text)

4. **delivery_costs** table:
   - id (uuid), order_id (uuid FK), delivery_type (text)
   - delivery_cost (decimal), customer_charge (decimal)
   - added_to_order (boolean)

5. **expenses** table:
   - id (uuid), expense_date (date), expense_type (text)
   - description (text), cost (decimal), related_order_id (uuid FK)

6. **sales** table:
   - id (uuid), sale_number (text), sales_name (text)
   - sale_date (date), customer_id (uuid FK), total_items (integer)
   - notes (text)

7. **sale_items** table:
   - id (uuid), sale_id (uuid FK), sku_code (text), quantity (integer)

**REQUIRED FEATURES:**

1. **Customer Management:**
   - List all customers with search
   - Create, update, delete customers
   - View customer order history

2. **Order Management:**
   - Create orders (Custom Order or Sale type)
   - Auto-generate order numbers (starting from 6000)
   - Add multiple order items with specifications
   - Track payment status (Full/Half/Remaining)
   - Update order status workflow
   - Add delivery costs and tracking

3. **Expense Tracking:**
   - Record expenses by type (Material, Making, Delivery, General)
   - Link expenses to specific orders
   - Filter by date range

4. **Sales Management:**
   - Create sales with SKU items
   - Track inventory sales separately from custom orders

5. **Analytics Dashboard:**
   - Total Revenue (sum of all order amounts)
   - Total Expenses (sum of all expenses)
   - Net Profit (Revenue - Expenses)
   - Pending Amount (sum of amount_remaining)
   - Active Orders count (not delivered)
   - Charts: Order Type Distribution, Order Status, Payment Status, Revenue vs Expenses, Monthly Orders Trend

6. **Invoice Generation:**
   - Generate PDF invoices for orders
   - Include customer details, order items, pricing, payment status

7. **Data Export:**
   - Export orders to Excel, PDF, CSV
   - DataTables with search, sort, pagination

**BUSINESS LOGIC:**

1. Order Number Generation:
   - Sequential numbering starting from 6000
   - Auto-increment based on last order

2. Payment Calculation:
   - amount_remaining = total_amount - amount_paid
   - Payment status based on percentage paid

3. Delivery Cost:
   - Separate tracking of actual cost vs customer charge
   - National/International delivery types

**API ENDPOINTS NEEDED:**

Customers:
- GET /api/customers (list all)
- GET /api/customers/:id (get one)
- POST /api/customers (create)
- PUT /api/customers/:id (update)
- DELETE /api/customers/:id (delete)
- GET /api/customers/search?q=term (search)

Orders:
- GET /api/orders (list with customer, items, delivery)
- GET /api/orders/:id (get one with relations)
- POST /api/orders (create)
- PUT /api/orders/:id (update)
- DELETE /api/orders/:id (delete)
- GET /api/orders/next-number (get next order number)
- GET /api/orders/sales (get sale-type orders)

Order Items:
- POST /api/order-items (add item)
- PUT /api/order-items/:id (update)
- DELETE /api/order-items/:id (delete)

Delivery Costs:
- POST /api/delivery-costs (create/update)
- GET /api/delivery-costs/:orderId (get by order)

Expenses:
- GET /api/expenses (list all)
- POST /api/expenses (create)
- PUT /api/expenses/:id (update)
- DELETE /api/expenses/:id (delete)
- GET /api/expenses/total (get sum)

Sales:
- GET /api/sales (list all)
- POST /api/sales (create)
- PUT /api/sales/:id (update)
- DELETE /api/sales/:id (delete)
- GET /api/sales/next-number (get next sale number)

Dashboard:
- GET /api/dashboard/metrics (all metrics in one call)

**PLEASE PROVIDE:**
1. Complete backend API structure with Express.js
2. Database models/schemas for [MongoDB/PostgreSQL]
3. Frontend components structure
4. Authentication implementation
5. Step-by-step migration guide
6. Environment configuration
7. Deployment instructions

**MAINTAIN:**
- All existing functionality
- Same user interface flow
- Data validation rules
- Error handling
- Security best practices
```

---

## 🟢 MEAN Stack Migration

### Architecture

```
┌─────────────────────────────────────┐
│   Frontend: Angular 17+             │
│   - Components (similar structure)  │
│   - Services (HTTP calls)           │
│   - RxJS for state management       │
└─────────────────┬───────────────────┘
                  │ HTTP/REST
                  ▼
┌─────────────────────────────────────┐
│   Backend: Node.js + Express.js     │
│   - RESTful API                     │
│   - JWT Authentication              │
│   - Middleware (auth, validation)   │
└─────────────────┬───────────────────┘
                  │ Mongoose ODM
                  ▼
┌─────────────────────────────────────┐
│   Database: MongoDB                 │
│   - Collections (customers, orders) │
│   - Indexes for performance         │
└─────────────────────────────────────┘
```

### Backend Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.ts          # MongoDB connection
│   │   └── environment.ts       # Environment variables
│   ├── models/
│   │   ├── Customer.ts          # Mongoose schema
│   │   ├── Order.ts
│   │   ├── OrderItem.ts
│   │   ├── DeliveryCost.ts
│   │   ├── Expense.ts
│   │   ├── Sale.ts
│   │   └── SaleItem.ts
│   ├── controllers/
│   │   ├── customerController.ts
│   │   ├── orderController.ts
│   │   ├── expenseController.ts
│   │   ├── salesController.ts
│   │   └── dashboardController.ts
│   ├── routes/
│   │   ├── customerRoutes.ts
│   │   ├── orderRoutes.ts
│   │   ├── expenseRoutes.ts
│   │   ├── salesRoutes.ts
│   │   └── dashboardRoutes.ts
│   ├── middleware/
│   │   ├── auth.ts              # JWT verification
│   │   ├── validation.ts        # Request validation
│   │   └── errorHandler.ts      # Error handling
│   ├── services/
│   │   ├── orderService.ts      # Business logic
│   │   ├── dashboardService.ts
│   │   └── pdfService.ts        # Invoice generation
│   ├── utils/
│   │   ├── logger.ts
│   │   └── helpers.ts
│   └── app.ts                   # Express app setup
├── package.json
├── tsconfig.json
└── .env
```

### Frontend Changes (Angular)

**Minimal changes needed since frontend is already Angular!**

1. **Update Services** - Replace Supabase client with HttpClient:

```typescript
// OLD (Supabase)
import { SupabaseService } from './supabase.service';

async getCustomers() {
  const { data } = await this.supabase.client
    .from('customers')
    .select('*');
  return data;
}

// NEW (HTTP)
import { HttpClient } from '@angular/common/http';

getCustomers(): Observable<Customer[]> {
  return this.http.get<Customer[]>(`${this.apiUrl}/customers`);
}
```

2. **Add Environment Config:**

```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api'
};
```

3. **Update Component Subscriptions:**

```typescript
// OLD (Promise-based)
async loadCustomers() {
  this.customers = await this.customerService.getCustomers();
}

// NEW (Observable-based)
loadCustomers() {
  this.customerService.getCustomers().subscribe({
    next: (customers) => this.customers = customers,
    error: (err) => console.error(err)
  });
}
```

### MongoDB Schema Examples

```javascript
// models/Customer.ts
import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, unique: true, sparse: true },
  email: { type: String, unique: true, sparse: true },
  country: String,
  city: String,
  address: String
}, { timestamps: true });

export const Customer = mongoose.model('Customer', customerSchema);

// models/Order.ts
const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  orderDate: { type: Date, required: true, default: Date.now },
  orderType: { type: String, enum: ['Customer Order', 'Sale'], default: 'Customer Order' },
  orderStatus: { type: String, enum: ['Received', 'In Progress', 'Ready', 'Delivered'], default: 'Received' },
  trackingId: String,
  totalAmount: { type: Number, default: 0 },
  paymentStatus: { type: String, enum: ['Full Payment', 'Half Payment', 'Remaining'], default: 'Remaining' },
  amountPaid: { type: Number, default: 0 },
  amountRemaining: { type: Number, default: 0 }
}, { timestamps: true });

export const Order = mongoose.model('Order', orderSchema);
```

### Express API Example

```typescript
// routes/customerRoutes.ts
import express from 'express';
import { CustomerController } from '../controllers/customerController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();
const controller = new CustomerController();

router.get('/', authMiddleware, controller.getAll);
router.get('/:id', authMiddleware, controller.getOne);
router.post('/', authMiddleware, controller.create);
router.put('/:id', authMiddleware, controller.update);
router.delete('/:id', authMiddleware, controller.delete);
router.get('/search', authMiddleware, controller.search);

export default router;

// controllers/customerController.ts
import { Request, Response } from 'express';
import { Customer } from '../models/Customer';

export class CustomerController {
  async getAll(req: Request, res: Response) {
    try {
      const customers = await Customer.find().sort({ createdAt: -1 });
      res.json(customers);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch customers' });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const customer = new Customer(req.body);
      await customer.save();
      res.status(201).json(customer);
    } catch (error) {
      res.status(400).json({ error: 'Failed to create customer' });
    }
  }

  // ... other methods
}
```

---

## 🔵 MERN Stack Migration

### Architecture

```
┌─────────────────────────────────────┐
│   Frontend: React 18+               │
│   - Components (functional)         │
│   - React Query / SWR               │
│   - Context API / Redux             │
└─────────────────┬───────────────────┘
                  │ HTTP/REST
                  ▼
┌─────────────────────────────────────┐
│   Backend: Node.js + Express.js     │
│   (Same as MEAN)                    │
└─────────────────┬───────────────────┘
                  │ Mongoose ODM
                  ▼
┌─────────────────────────────────────┐
│   Database: MongoDB                 │
└─────────────────────────────────────┘
```

### Frontend Structure (React)

```
frontend/
├── src/
│   ├── components/
│   │   ├── Dashboard/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── MetricCard.tsx
│   │   │   └── Charts.tsx
│   │   ├── Orders/
│   │   │   ├── OrderList.tsx
│   │   │   ├── OrderForm.tsx
│   │   │   ├── OrderDetail.tsx
│   │   │   └── Invoice.tsx
│   │   ├── Customers/
│   │   │   ├── CustomerList.tsx
│   │   │   └── CustomerForm.tsx
│   │   ├── Expenses/
│   │   │   ├── ExpenseList.tsx
│   │   │   └── ExpenseForm.tsx
│   │   └── Sales/
│   │       ├── SalesList.tsx
│   │       └── SalesForm.tsx
│   ├── hooks/
│   │   ├── useCustomers.ts
│   │   ├── useOrders.ts
│   │   ├── useExpenses.ts
│   │   └── useDashboard.ts
│   ├── services/
│   │   ├── api.ts               # Axios instance
│   │   ├── customerService.ts
│   │   ├── orderService.ts
│   │   ├── expenseService.ts
│   │   └── salesService.ts
│   ├── context/
│   │   └── AuthContext.tsx
│   ├── types/
│   │   └── index.ts             # TypeScript interfaces
│   ├── utils/
│   │   ├── formatters.ts
│   │   └── validators.ts
│   ├── App.tsx
│   └── main.tsx
├── package.json
└── vite.config.ts
```

### React Component Examples

```typescript
// components/Customers/CustomerList.tsx
import React, { useState, useEffect } from 'react';
import { customerService } from '../../services/customerService';
import { Customer } from '../../types';

export const CustomerList: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      const data = await customerService.getAll();
      setCustomers(data);
    } catch (error) {
      console.error('Failed to load customers', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="customer-list">
      <h2>Customers</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Phone</th>
            <th>Email</th>
            <th>City</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {customers.map(customer => (
            <tr key={customer.id}>
              <td>{customer.name}</td>
              <td>{customer.phone}</td>
              <td>{customer.email}</td>
              <td>{customer.city}</td>
              <td>
                <button onClick={() => handleEdit(customer)}>Edit</button>
                <button onClick={() => handleDelete(customer.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// services/customerService.ts
import axios from 'axios';
import { Customer } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const customerService = {
  async getAll(): Promise<Customer[]> {
    const response = await axios.get(`${API_URL}/customers`);
    return response.data;
  },

  async getOne(id: string): Promise<Customer> {
    const response = await axios.get(`${API_URL}/customers/${id}`);
    return response.data;
  },

  async create(customer: Partial<Customer>): Promise<Customer> {
    const response = await axios.post(`${API_URL}/customers`, customer);
    return response.data;
  },

  async update(id: string, updates: Partial<Customer>): Promise<Customer> {
    const response = await axios.put(`${API_URL}/customers/${id}`, updates);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await axios.delete(`${API_URL}/customers/${id}`);
  }
};
```

### Using React Query (Recommended)

```typescript
// hooks/useCustomers.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customerService } from '../services/customerService';

export const useCustomers = () => {
  const queryClient = useQueryClient();

  const { data: customers, isLoading, error } = useQuery({
    queryKey: ['customers'],
    queryFn: customerService.getAll
  });

  const createMutation = useMutation({
    mutationFn: customerService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      customerService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: customerService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    }
  });

  return {
    customers,
    isLoading,
    error,
    createCustomer: createMutation.mutate,
    updateCustomer: updateMutation.mutate,
    deleteCustomer: deleteMutation.mutate
  };
};

// Usage in component
const CustomerList = () => {
  const { customers, isLoading, createCustomer, deleteCustomer } = useCustomers();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {customers?.map(customer => (
        <div key={customer.id}>
          {customer.name}
          <button onClick={() => deleteCustomer(customer.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
};
```

---

## 🎨 Alternative Stacks

### Next.js Full-Stack (Recommended for Modern Apps)

```
┌─────────────────────────────────────┐
│   Next.js 14+ (App Router)          │
│   - Server Components               │
│   - API Routes (Backend)            │
│   - Server Actions                  │
└─────────────────┬───────────────────┘
                  │ Prisma ORM
                  ▼
┌─────────────────────────────────────┐
│   Database: PostgreSQL / MongoDB    │
└─────────────────────────────────────┘
```

**Advantages:**
- ✅ Full-stack in one codebase
- ✅ Server-side rendering (SEO)
- ✅ API routes built-in
- ✅ TypeScript native
- ✅ Easy deployment (Vercel)

### NestJS Backend (Enterprise-grade)

```
┌─────────────────────────────────────┐
│   Frontend: Angular/React/Vue       │
└─────────────────┬───────────────────┘
                  │
                  ▼
┌─────────────────────────────────────┐
│   Backend: NestJS                   │
│   - Modular architecture            │
│   - Dependency injection            │
│   - TypeORM / Prisma                │
└─────────────────┬───────────────────┘
                  │
                  ▼
┌─────────────────────────────────────┐
│   Database: PostgreSQL              │
└─────────────────────────────────────┘
```

**Advantages:**
- ✅ Angular-like structure (familiar)
- ✅ Built-in validation, guards
- ✅ Excellent TypeScript support
- ✅ Scalable architecture

---

## 🗄️ Database Migration

### PostgreSQL to MongoDB Mapping

| PostgreSQL | MongoDB | Notes |
|------------|---------|-------|
| Table | Collection | Same concept |
| Row | Document | JSON-like structure |
| Column | Field | More flexible in MongoDB |
| UUID | ObjectId | MongoDB's default ID |
| Foreign Key | Reference / Embedded | Can embed or reference |
| JOIN | $lookup / Populate | Aggregation pipeline |
| Index | Index | Similar syntax |

### Keep PostgreSQL Option

If you prefer to keep PostgreSQL with MEAN/MERN:

**Use Prisma ORM:**

```typescript
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Customer {
  id        String   @id @default(uuid())
  name      String
  phone     String?  @unique
  email     String?  @unique
  country   String?
  city      String?
  address   String?
  createdAt DateTime @default(now())
  orders    Order[]
}

model Order {
  id              String        @id @default(uuid())
  orderNumber     String        @unique
  customerId      String?
  customer        Customer?     @relation(fields: [customerId], references: [id])
  orderDate       DateTime      @default(now())
  orderType       String        @default("Customer Order")
  orderStatus     String        @default("Received")
  trackingId      String?
  totalAmount     Decimal       @default(0)
  paymentStatus   String        @default("Remaining")
  amountPaid      Decimal       @default(0)
  amountRemaining Decimal       @default(0)
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  orderItems      OrderItem[]
  deliveryCosts   DeliveryCost[]
}

// ... other models
```

**Prisma Client Usage:**

```typescript
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Get all customers
const customers = await prisma.customer.findMany({
  orderBy: { createdAt: 'desc' }
});

// Get order with relations
const order = await prisma.order.findUnique({
  where: { id: orderId },
  include: {
    customer: true,
    orderItems: true,
    deliveryCosts: true
  }
});

// Create order
const newOrder = await prisma.order.create({
  data: {
    orderNumber: '6001',
    customerId: customerId,
    orderDate: new Date(),
    totalAmount: 5000
  }
});
```

---

## 🔌 API Endpoints Reference

### Complete REST API Specification

#### Customers

```
GET    /api/customers              # List all customers
GET    /api/customers/:id          # Get single customer
POST   /api/customers              # Create customer
PUT    /api/customers/:id          # Update customer
DELETE /api/customers/:id          # Delete customer
GET    /api/customers/search?q=    # Search customers
```

**Request/Response Examples:**

```json
// POST /api/customers
{
  "name": "John Doe",
  "phone": "+1234567890",
  "email": "john@example.com",
  "country": "USA",
  "city": "New York",
  "address": "123 Main St"
}

// Response
{
  "id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "phone": "+1234567890",
  "email": "john@example.com",
  "country": "USA",
  "city": "New York",
  "address": "123 Main St",
  "createdAt": "2024-11-28T10:00:00Z"
}
```

#### Orders

```
GET    /api/orders                 # List all orders (with relations)
GET    /api/orders/:id             # Get single order
POST   /api/orders                 # Create order
PUT    /api/orders/:id             # Update order
DELETE /api/orders/:id             # Delete order
GET    /api/orders/next-number     # Get next order number
GET    /api/orders/sales           # Get sale-type orders only
```

**Complex Order Response:**

```json
{
  "id": "507f1f77bcf86cd799439011",
  "orderNumber": "6001",
  "customerId": "507f1f77bcf86cd799439012",
  "customer": {
    "id": "507f1f77bcf86cd799439012",
    "name": "John Doe",
    "phone": "+1234567890"
  },
  "orderDate": "2024-11-28",
  "orderType": "Customer Order",
  "orderStatus": "Received",
  "trackingId": "TRACK123",
  "totalAmount": 5000,
  "paymentStatus": "Half Payment",
  "amountPaid": 2500,
  "amountRemaining": 2500,
  "orderItems": [
    {
      "id": "507f1f77bcf86cd799439013",
      "productType": "Dress",
      "quantity": 5,
      "price": 1000,
      "fabricDetails": "Cotton",
      "dyeColor": ["Red", "Blue"]
    }
  ],
  "deliveryCost": {
    "id": "507f1f77bcf86cd799439014",
    "deliveryType": "National",
    "deliveryCost": 500,
    "customerCharge": 600,
    "addedToOrder": true
  },
  "createdAt": "2024-11-28T10:00:00Z",
  "updatedAt": "2024-11-28T10:00:00Z"
}
```

#### Order Items

```
POST   /api/order-items            # Add item to order
PUT    /api/order-items/:id        # Update order item
DELETE /api/order-items/:id        # Delete order item
```

#### Delivery Costs

```
POST   /api/delivery-costs         # Create/update delivery cost
GET    /api/delivery-costs/:orderId # Get delivery cost for order
```

#### Expenses

```
GET    /api/expenses               # List all expenses
GET    /api/expenses/:id           # Get single expense
POST   /api/expenses               # Create expense
PUT    /api/expenses/:id           # Update expense
DELETE /api/expenses/:id           # Delete expense
GET    /api/expenses/total         # Get total expenses sum
```

#### Sales

```
GET    /api/sales                  # List all sales
GET    /api/sales/:id              # Get single sale
POST   /api/sales                  # Create sale
PUT    /api/sales/:id              # Update sale
DELETE /api/sales/:id              # Delete sale
GET    /api/sales/next-number      # Get next sale number
```

#### Dashboard

```
GET    /api/dashboard/metrics      # Get all dashboard metrics
```

**Dashboard Response:**

```json
{
  "totalRevenue": 150000,
  "totalExpenses": 80000,
  "netProfit": 70000,
  "pendingAmount": 25000,
  "activeOrders": 15,
  "totalCustomers": 50,
  "customerOrdersCount": 30,
  "saleOrdersCount": 20,
  "orderTypeDistribution": {
    "customerOrders": 30,
    "sales": 20
  },
  "orderStatusDistribution": {
    "received": 10,
    "inProgress": 8,
    "ready": 5,
    "delivered": 27
  },
  "paymentStatusDistribution": {
    "fullPayment": 35,
    "halfPayment": 10,
    "remaining": 5
  },
  "monthlyRevenue": [
    { "month": "2024-01", "revenue": 12000, "expenses": 6000 },
    { "month": "2024-02", "revenue": 15000, "expenses": 7000 }
  ]
}
```

---

## ✅ Migration Checklist

### Phase 1: Backend Setup (Week 1)

- [ ] Initialize Node.js + Express project
- [ ] Set up MongoDB/PostgreSQL connection
- [ ] Create database models/schemas
- [ ] Implement authentication (JWT)
- [ ] Create API routes structure
- [ ] Implement customer endpoints
- [ ] Implement order endpoints
- [ ] Implement expense endpoints
- [ ] Implement sales endpoints
- [ ] Implement dashboard endpoints
- [ ] Add validation middleware
- [ ] Add error handling
- [ ] Test all endpoints with Postman

### Phase 2: Frontend Setup (Week 2)

**For MEAN (Angular):**
- [ ] Update service files to use HttpClient
- [ ] Replace Supabase calls with HTTP requests
- [ ] Update environment configuration
- [ ] Convert async/await to Observables
- [ ] Add authentication service
- [ ] Add HTTP interceptors (auth token)
- [ ] Test all components

**For MERN (React):**
- [ ] Create React project (Vite/CRA)
- [ ] Set up routing (React Router)
- [ ] Create component structure
- [ ] Implement API service layer
- [ ] Create custom hooks
- [ ] Add state management (Context/Redux)
- [ ] Implement authentication
- [ ] Recreate all pages (Dashboard, Orders, etc.)
- [ ] Add Chart.js integration
- [ ] Add DataTables/TanStack Table
- [ ] Implement PDF generation

### Phase 3: Data Migration (Week 3)

- [ ] Export data from Supabase
- [ ] Transform data format if needed
- [ ] Import data to new database
- [ ] Verify data integrity
- [ ] Test relationships/foreign keys
- [ ] Backup original data

### Phase 4: Testing (Week 4)

- [ ] Unit tests for backend
- [ ] Integration tests for API
- [ ] Frontend component tests
- [ ] End-to-end testing
- [ ] Performance testing
- [ ] Security testing
- [ ] User acceptance testing

### Phase 5: Deployment

- [ ] Set up production database
- [ ] Configure environment variables
- [ ] Deploy backend (Heroku/Railway/DigitalOcean)
- [ ] Deploy frontend (Vercel/Netlify)
- [ ] Set up CI/CD pipeline
- [ ] Configure domain and SSL
- [ ] Monitor and optimize

---

## 📦 Package.json Examples

### Backend (Express + MongoDB)

```json
{
  "name": "floral-backend",
  "version": "1.0.0",
  "scripts": {
    "dev": "nodemon src/app.ts",
    "build": "tsc",
    "start": "node dist/app.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^8.0.0",
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "express-validator": "^7.0.1",
    "pdfkit": "^0.13.0"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/node": "^20.10.0",
    "typescript": "^5.3.0",
    "nodemon": "^3.0.2",
    "ts-node": "^10.9.2"
  }
}
```

### Frontend (React + Vite)

```json
{
  "name": "floral-frontend",
  "version": "1.0.0",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "@tanstack/react-query": "^5.12.0",
    "axios": "^1.6.2",
    "chart.js": "^4.4.0",
    "react-chartjs-2": "^5.2.0",
    "sweetalert2": "^11.10.0",
    "jspdf": "^2.5.1",
    "react-table": "^7.8.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "@vitejs/plugin-react": "^4.2.1",
    "typescript": "^5.3.3",
    "vite": "^5.0.8"
  }
}
```

---

## 🚀 Quick Start Commands

### MEAN Stack

```bash
# Backend
mkdir floral-backend && cd floral-backend
npm init -y
npm install express mongoose jsonwebtoken bcryptjs cors dotenv
npm install -D typescript @types/express @types/node ts-node nodemon
npx tsc --init

# Frontend (keep existing Angular project)
cd ../floral-frontend
# Update services to use HttpClient instead of Supabase
```

### MERN Stack

```bash
# Backend (same as MEAN)
mkdir floral-backend && cd floral-backend
npm init -y
npm install express mongoose jsonwebtoken bcryptjs cors dotenv
npm install -D typescript @types/express @types/node ts-node nodemon

# Frontend
npm create vite@latest floral-frontend -- --template react-ts
cd floral-frontend
npm install
npm install react-router-dom @tanstack/react-query axios chart.js react-chartjs-2
```

---

## 🎓 Learning Resources

### MEAN Stack
- [Angular Official Docs](https://angular.io/docs)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [Mongoose Documentation](https://mongoosejs.com/docs/guide.html)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

### MERN Stack
- [React Official Docs](https://react.dev/)
- [React Query Tutorial](https://tanstack.com/query/latest/docs/react/overview)
- [MongoDB University](https://university.mongodb.com/)

### General
- [REST API Design](https://restfulapi.net/)
- [JWT Authentication](https://jwt.io/introduction)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)

---

## 📞 Support

For migration assistance:
1. Use the AI conversion prompt above with ChatGPT/Claude
2. Refer to the detailed system design in `SYSTEM_DESIGN.md`
3. Check database schema in `supabase/migrations/`
4. Review existing code structure in `src/app/`

---

**Last Updated:** 2024-11-28  
**Document Version:** 1.0  
**Status:** ✅ Ready for Migration
